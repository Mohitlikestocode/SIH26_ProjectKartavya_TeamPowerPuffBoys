import { useEffect, useRef, useState } from "react";
import { css } from "../lib/css";
import { api } from "../lib/api";

// React port of /public/proctor-test.html's detection logic, wired to a
// real attempt: every logged event POSTs to the backend's /api/violations,
// and the backend's response (not a client-side copy of the threshold) is
// what decides whether the attempt got kicked — single source of truth.
const WASM_BASE = "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm";
const OBJECT_MODEL_URL =
  "https://storage.googleapis.com/mediapipe-models/object_detector/efficientdet_lite2/float16/1/efficientdet_lite2.tflite";
const FACE_MODEL_URL =
  "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task";

const OBJECT_MODEL_THRESHOLD = 0.15;
const PHONE_LOG_THRESHOLD = 0.35;
const FACE_STREAK_TO_LOG = 2;
const COOLDOWN_MS = 5000;
const OBJECT_INTERVAL_MS = 400;
const FACE_INTERVAL_MS = 250;
const BACKEND_TYPE = { looking_away: "no_face" };

export default function ProctoringHarness({ attemptId, token, onKicked }) {
  const videoRef = useRef(null);
  const overlayRef = useRef(null);
  const detectorsRef = useRef({ objectDetector: null, faceLandmarker: null });
  const streamRef = useRef(null);
  const runningRef = useRef(false);
  const rafRef = useRef(null);
  const lastLoggedRef = useRef({});
  const streaksRef = useRef({ noFace: 0, lookAway: 0 });
  const throttleRef = useRef({ object: 0, face: 0 });

  const [modelStatus, setModelStatus] = useState("Loading proctoring models…");
  const [modelsReady, setModelsReady] = useState(false);
  const [cameraOn, setCameraOn] = useState(false);
  const [readout, setReadout] = useState("");
  const [warnings, setWarnings] = useState([]);
  const [warningBanner, setWarningBanner] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { FilesetResolver, ObjectDetector, FaceLandmarker } = await import(
          /* @vite-ignore */ "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/vision_bundle.mjs"
        );
        const vision = await FilesetResolver.forVisionTasks(WASM_BASE);
        const objectDetector = await ObjectDetector.createFromOptions(vision, {
          baseOptions: { modelAssetPath: OBJECT_MODEL_URL },
          scoreThreshold: OBJECT_MODEL_THRESHOLD,
          maxResults: 8,
          runningMode: "VIDEO",
        });
        const faceLandmarker = await FaceLandmarker.createFromOptions(vision, {
          baseOptions: { modelAssetPath: FACE_MODEL_URL },
          runningMode: "VIDEO",
          numFaces: 3,
        });
        if (cancelled) return;
        detectorsRef.current = { objectDetector, faceLandmarker };
        setModelsReady(true);
        setModelStatus('Models ready — click "Enable camera" to start monitoring.');
      } catch (err) {
        if (!cancelled) setModelStatus(`Failed to load proctoring models: ${err?.message ?? err}`);
      }
    })();
    return () => {
      cancelled = true;
      stopCamera();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function flashWarning(msg) {
    setWarningBanner(msg);
    clearTimeout(flashWarning._t);
    flashWarning._t = setTimeout(() => setWarningBanner(""), 2600);
  }

  async function logViolation(type, msg) {
    const now = Date.now();
    if (now - (lastLoggedRef.current[type] || 0) < COOLDOWN_MS) return;
    lastLoggedRef.current[type] = now;

    setWarnings((prev) => [{ type, msg, time: new Date().toLocaleTimeString() }, ...prev].slice(0, 30));
    flashWarning(`⚠ ${type.replace(/_/g, " ")} — ${msg}`);

    try {
      const backendType = BACKEND_TYPE[type] ?? type;
      const result = await api.logViolation(token, attemptId, backendType);
      if (result.status && result.status !== "in_progress") {
        stopCamera();
        onKicked?.(result);
      }
    } catch (err) {
      flashWarning(`Could not report violation to backend: ${err.message}`);
    }
  }

  function drawBox(ctx, x, y, w, h, color, label) {
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, w, h);
    if (label) {
      ctx.fillStyle = color;
      ctx.font = "12px sans-serif";
      ctx.fillText(label, x + 2, Math.max(12, y - 4));
    }
  }

  function detectionLoop(now) {
    if (!runningRef.current) return;
    const video = videoRef.current;
    const overlay = overlayRef.current;
    if (!video || !overlay) {
      rafRef.current = requestAnimationFrame(detectionLoop);
      return;
    }
    const ctx = overlay.getContext("2d");
    ctx.clearRect(0, 0, overlay.width, overlay.height);
    const lines = [];
    const { objectDetector, faceLandmarker } = detectorsRef.current;

    if (objectDetector && now - throttleRef.current.object >= OBJECT_INTERVAL_MS && video.currentTime > 0) {
      throttleRef.current.object = now;
      try {
        const result = objectDetector.detectForVideo(video, now);
        const detections = result?.detections ?? [];
        lines.push(
          "objects: " +
            (detections.length
              ? detections.map((d) => `${d.categories[0]?.categoryName} ${(d.categories[0]?.score * 100).toFixed(0)}%`).join(", ")
              : "(none above threshold)"),
        );
        for (const d of detections) {
          const box = d.boundingBox;
          const category = d.categories[0];
          const isPhone = /phone/i.test(category?.categoryName ?? "");
          drawBox(ctx, box.originX, box.originY, box.width, box.height, isPhone ? "#E53935" : "#607D8B", `${category?.categoryName} ${(category?.score * 100).toFixed(0)}%`);
          if (isPhone && category.score >= PHONE_LOG_THRESHOLD) {
            logViolation("phone_detected", `Phone detected (${Math.round(category.score * 100)}% confidence)`);
          }
        }
      } catch (err) {
        lines.push(`object detector error: ${err?.message ?? err}`);
      }
    }

    if (faceLandmarker && now - throttleRef.current.face >= FACE_INTERVAL_MS && video.currentTime > 0) {
      throttleRef.current.face = now;
      try {
        const result = faceLandmarker.detectForVideo(video, now);
        const faces = result?.faceLandmarks ?? [];
        if (faces.length === 0) {
          streaksRef.current.noFace += 1;
          streaksRef.current.lookAway = 0;
          lines.push(`faces: 0 — no-face streak: ${streaksRef.current.noFace}/${FACE_STREAK_TO_LOG}`);
          if (streaksRef.current.noFace >= FACE_STREAK_TO_LOG) logViolation("no_face", "No face detected in frame");
        } else if (faces.length > 1) {
          streaksRef.current.noFace = 0;
          streaksRef.current.lookAway = 0;
          lines.push(`faces: ${faces.length}`);
          logViolation("multiple_faces", `${faces.length} faces detected in frame`);
        } else {
          streaksRef.current.noFace = 0;
          const lm = faces[0];
          const left = lm[234], right = lm[454], nose = lm[1];
          const faceWidth = right.x - left.x;
          const ratio = faceWidth !== 0 ? (nose.x - left.x) / faceWidth : 0.5;
          const w = overlay.width, h = overlay.height;
          drawBox(ctx, left.x * w - 4, left.y * h - 4, 8, 8, "#4CAF50");
          drawBox(ctx, right.x * w - 4, right.y * h - 4, 8, 8, "#4CAF50");
          drawBox(ctx, nose.x * w - 4, nose.y * h - 4, 8, 8, "#FFD54F");

          if (ratio < 0.25 || ratio > 0.75) {
            streaksRef.current.lookAway += 1;
            lines.push(`faces: 1 — nose ratio ${ratio.toFixed(2)} — look-away streak: ${streaksRef.current.lookAway}/${FACE_STREAK_TO_LOG}`);
            if (streaksRef.current.lookAway >= FACE_STREAK_TO_LOG) {
              logViolation("looking_away", `Head turned away from camera (nose ratio ${ratio.toFixed(2)})`);
            }
          } else {
            streaksRef.current.lookAway = 0;
            lines.push(`faces: 1 — nose ratio ${ratio.toFixed(2)} (facing camera)`);
          }
        }
      } catch (err) {
        lines.push(`face landmarker error: ${err?.message ?? err}`);
      }
    }

    if (lines.length) setReadout(lines.join("\n"));
    rafRef.current = requestAnimationFrame(detectionLoop);
  }

  async function startCamera() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 480, height: 360 }, audio: false });
      streamRef.current = stream;
      const video = videoRef.current;
      video.srcObject = stream;
      await video.play();
      overlayRef.current.width = video.videoWidth || 480;
      overlayRef.current.height = video.videoHeight || 360;
      runningRef.current = true;
      setCameraOn(true);
      rafRef.current = requestAnimationFrame(detectionLoop);
    } catch (err) {
      setError(`Camera permission denied or unavailable (${err?.name ?? err}).`);
    }
  }

  function stopCamera() {
    runningRef.current = false;
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    streamRef.current?.getTracks().forEach((t) => t.stop());
    setCameraOn(false);
  }

  useEffect(() => {
    document.addEventListener("visibilitychange", onVisibility);
    document.addEventListener("fullscreenchange", onFullscreenChange);
    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      document.removeEventListener("fullscreenchange", onFullscreenChange);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function onVisibility() {
    if (document.hidden && runningRef.current) logViolation("tab_switch", "Tab switched or window minimized");
  }
  const wasFullscreenRef = useRef(false);
  function onFullscreenChange() {
    if (!document.fullscreenElement && runningRef.current && wasFullscreenRef.current) {
      logViolation("fullscreen_exit", "Exited fullscreen during attempt");
    }
    wasFullscreenRef.current = !!document.fullscreenElement;
  }

  return (
    <div style={css("background:#12151F; border:1px solid #232838; border-radius:10px; padding:16px; color:#E7ECF3; font-size:12.5px; display:grid; gap:10px")}>
      <div style={css("display:flex; justify-content:space-between; align-items:center; gap:10px; flex-wrap:wrap")}>
        <div style={css("font-weight:700; font-size:13px")}>🔴 Proctoring active</div>
        {!cameraOn && (
          <button
            onClick={startCamera}
            disabled={!modelsReady}
            style={css(`font:inherit; font-size:12.5px; font-weight:700; cursor:${modelsReady ? "pointer" : "not-allowed"}; padding:8px 14px; border:0; background:${modelsReady ? "#1B5CB8" : "#3B424E"}; color:#fff; border-radius:7px`)}
          >
            {modelsReady ? "Enable camera & start monitoring" : "Loading models…"}
          </button>
        )}
      </div>
      <div style={css("color:#8A93A6")}>{modelStatus}</div>
      {error && <div style={css("color:#FF6B6B")}>{error}</div>}

      <div style={css("position:relative; width:100%; max-width:320px; aspect-ratio:4/3; background:#000; border-radius:8px; overflow:hidden")}>
        <video ref={videoRef} muted playsInline style={css("position:absolute; inset:0; width:100%; height:100%; object-fit:cover")}></video>
        <canvas ref={overlayRef} style={css("position:absolute; inset:0; width:100%; height:100%")}></canvas>
        {warningBanner && (
          <div style={css("position:absolute; top:0; left:0; right:0; background:rgba(198,40,40,0.92); color:#fff; font-weight:700; font-size:11.5px; padding:6px 10px")}>
            {warningBanner}
          </div>
        )}
      </div>

      {readout && <div style={css("font-family:'IBM Plex Mono',monospace; font-size:11px; color:#7FD8A0; white-space:pre-wrap")}>{readout}</div>}

      <div>
        <div style={css("font-size:11px; text-transform:uppercase; letter-spacing:.06em; color:#8A93A6; margin-bottom:6px")}>Warnings ({warnings.length})</div>
        {warnings.length === 0 && <div style={css("color:#5C6478")}>None yet.</div>}
        {warnings.slice(0, 6).map((w, i) => (
          <div key={i} style={css("padding:5px 0; border-bottom:1px solid #232838")}>
            <b>{w.type}</b> — {w.msg} <span style={css("color:#5C6478")}>({w.time})</span>
          </div>
        ))}
      </div>
    </div>
  );
}
