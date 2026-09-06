import { useEffect, useState } from "react";
import { css } from "../lib/css";
import { createMcqAssessment, createSimulationAssessment, listScenarios, listTargetRoles, ApiError } from "../lib/api";

// Real "trainer builds a test -> gets a working QR" flow, using the same x-admin-id identity
// shortcut TrainerStudio.jsx already relies on (see backend/src/middleware/resolveTrainerAuth.ts).
// Two modes: a general MCQ test assembled from the approved question bank (optionally scoped to a
// designation/target role), or a situation simulation from one of the seeded scenarios — both
// return {assessment, session, joinUrl, qrDataUrl} in one call when a session name is given.
export default function TrainerCreateTest() {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState("mcq"); // mcq | simulation
  const [targetRoles, setTargetRoles] = useState([]);
  const [scenarios, setScenarios] = useState([]);

  const [title, setTitle] = useState("");
  const [targetRoleId, setTargetRoleId] = useState("");
  const [scenarioId, setScenarioId] = useState("");
  const [count, setCount] = useState(10);
  const [timeLimitMinutes, setTimeLimitMinutes] = useState(20);
  const [passingScore, setPassingScore] = useState(50);
  const [sessionName, setSessionName] = useState("");

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  useEffect(() => {
    if (!open) return;
    listTargetRoles().then(setTargetRoles).catch(() => {});
    listScenarios().then(setScenarios).catch(() => {});
  }, [open]);

  async function submit() {
    setSaving(true);
    setError(null);
    setResult(null);
    try {
      const session = sessionName.trim() ? { name: sessionName.trim() } : undefined;
      const created =
        mode === "mcq"
          ? await createMcqAssessment({
              title: title.trim() || "General competency MCQ",
              targetRoleId: targetRoleId || undefined,
              count: Number(count),
              timeLimitSeconds: Number(timeLimitMinutes) * 60,
              passingScore: Number(passingScore),
              session,
            })
          : await createSimulationAssessment({
              scenarioId,
              timeLimitSeconds: Number(timeLimitMinutes) * 60,
              session,
            });
      setResult(created);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : String(err));
    } finally {
      setSaving(false);
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        style={css("font:inherit; font-size:13px; font-weight:700; cursor:pointer; padding:10px 16px; border:1.5px solid #123E7C; background:#fff; color:#123E7C; border-radius:24px; white-space:nowrap; margin-right:10px")}
      >
        + Create test &amp; QR
      </button>
    );
  }

  return (
    <div style={css("background:#fff; border:1px solid #E3E9F2; border-radius:12px; padding:20px 22px; margin-bottom:20px")}>
      <div style={css("display:flex; justify-content:space-between; align-items:center; margin-bottom:14px")}>
        <h2 style={css("font-size:18px; font-weight:700; color:#123E7C; margin:0")}>Create test &amp; QR</h2>
        <button onClick={() => { setOpen(false); setResult(null); }} style={css("font:inherit; font-size:13px; cursor:pointer; padding:8px 14px; border:1px solid #C9CFD8; background:#fff; border-radius:20px")}>Close</button>
      </div>

      {result ? (
        <ResultView result={result} onReset={() => setResult(null)} />
      ) : (
        <div style={css("display:grid; gap:12px; max-width:520px")}>
          <div style={css("display:flex; gap:10px")}>
            <button onClick={() => setMode("mcq")} style={css(`font:inherit; font-size:13px; font-weight:700; cursor:pointer; padding:8px 14px; border-radius:20px; border:1.5px solid ${mode === "mcq" ? "#123E7C" : "#C9CFD8"}; background:${mode === "mcq" ? "#E8F0FA" : "#fff"}; color:#123E7C`)}>General MCQ</button>
            <button onClick={() => setMode("simulation")} style={css(`font:inherit; font-size:13px; font-weight:700; cursor:pointer; padding:8px 14px; border-radius:20px; border:1.5px solid ${mode === "simulation" ? "#F58220" : "#C9CFD8"}; background:${mode === "simulation" ? "#FFF1E6" : "#fff"}; color:#C25E10`)}>Situation simulation</button>
          </div>

          {mode === "mcq" ? (
            <>
              <Field label="Title">
                <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="General competency MCQ" style={inputStyle} />
              </Field>
              <Field label="Designation / target role (optional — scopes questions to what this role requires)">
                <select value={targetRoleId} onChange={(e) => setTargetRoleId(e.target.value)} style={inputStyle}>
                  <option value="">Any (all domains)</option>
                  {targetRoles.map((r) => (
                    <option key={r.id} value={r.id}>{r.title}</option>
                  ))}
                </select>
              </Field>
              <Field label="Number of questions">
                <input type="number" min={1} value={count} onChange={(e) => setCount(e.target.value)} style={inputStyle} />
              </Field>
            </>
          ) : (
            <Field label="Scenario">
              <select value={scenarioId} onChange={(e) => setScenarioId(e.target.value)} style={inputStyle}>
                <option value="">Select a scenario…</option>
                {scenarios.map((s) => (
                  <option key={s.id} value={s.id}>{s.title}</option>
                ))}
              </select>
            </Field>
          )}

          <Field label="Time limit (minutes)">
            <input type="number" min={1} value={timeLimitMinutes} onChange={(e) => setTimeLimitMinutes(e.target.value)} style={inputStyle} />
          </Field>
          {mode === "mcq" && (
            <Field label="Passing score (%)">
              <input type="number" min={0} max={100} value={passingScore} onChange={(e) => setPassingScore(e.target.value)} style={inputStyle} />
            </Field>
          )}
          <Field label="Session name (leave blank to skip QR generation for now)">
            <input value={sessionName} onChange={(e) => setSessionName(e.target.value)} placeholder="e.g. Batch 4 — Statistical Officers" style={inputStyle} />
          </Field>

          <button
            onClick={submit}
            disabled={saving || (mode === "simulation" && !scenarioId)}
            style={css(`font:inherit; font-size:14px; font-weight:700; cursor:pointer; padding:12px 18px; border:0; background:#123E7C; color:#fff; border-radius:8px; opacity:${saving ? 0.6 : 1}; margin-top:6px`)}
          >
            {saving ? "Creating…" : "Create"}
          </button>
          {error && <div style={css("color:#991B1B; font-size:13px")}>{error}</div>}
        </div>
      )}
    </div>
  );
}

function ResultView({ result, onReset }) {
  const { assessment, session, qrDataUrl, joinUrl } = result;
  return (
    <div>
      <div style={css("font-size:14px; color:#166534; font-weight:700; margin-bottom:10px")}>Created: {assessment.title}</div>
      {qrDataUrl ? (
        <div style={css("text-align:center; border:1px solid #E3E9F2; border-radius:12px; padding:18px; max-width:320px")}>
          <img src={qrDataUrl} alt="Session join QR code" style={{ width: "100%", maxWidth: 240 }} />
          <div style={css("font-size:12.5px; color:#5A6C86; margin-top:10px; word-break:break-all")}>{joinUrl}</div>
          <div style={css("font-size:12px; color:#7A8AA3; margin-top:6px")}>Session: {session?.name}</div>
        </div>
      ) : (
        <div style={css("font-size:13px; color:#5A6C86")}>No session name was given, so no QR was generated — the test still exists and can be assigned a session later.</div>
      )}
      <button onClick={onReset} style={css("font:inherit; font-size:13px; font-weight:600; cursor:pointer; padding:9px 14px; border:1px solid #C9CFD8; background:#fff; border-radius:20px; margin-top:14px")}>Create another</button>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label style={css("display:grid; gap:5px; font-size:12.5px; font-weight:600; color:#3B424E")}>
      {label}
      {children}
    </label>
  );
}

const inputStyle = css("font:inherit; font-size:14px; padding:10px 12px; border:1px solid #C9CFD8; border-radius:6px");
