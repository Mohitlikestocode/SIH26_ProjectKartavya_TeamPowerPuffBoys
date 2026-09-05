import { useState } from "react";
import { css } from "../lib/css";
import { api } from "../lib/api";
import LiveAssessmentRunner from "./LiveAssessmentRunner";

// What a real QR scan lands on: /join/{sessionId}?token=... — this is the
// literal join URL the backend's sessions.service.ts signs and encodes into
// the QR. Login here is the mock-SSO step described in prompt.md ("scanning
// opens the join URL -> validate token/expiry -> mock SSO login if not
// already authenticated -> create an Attempt -> redirect into the
// assessment") — this page IS that redirect target.
export default function JoinPage() {
  const parts = window.location.pathname.split("/").filter(Boolean); // ["join", ":id"]
  const sessionId = parts[1];
  const joinToken = new URLSearchParams(window.location.search).get("token") || "";

  const [email, setEmail] = useState("learner@kartavya.gov.in");
  const [password, setPassword] = useState("password123");
  const [status, setStatus] = useState("idle"); // idle | joining | joined | error | submitted
  const [error, setError] = useState("");
  const [token, setToken] = useState("");
  const [attempt, setAttempt] = useState(null);
  const [assessment, setAssessment] = useState(null);
  const [result, setResult] = useState(null);

  if (!sessionId || !joinToken) {
    return (
      <Shell>
        <div style={css("color:#991B1B")}>Missing session id or token in the URL — this page expects <code>/join/&#123;sessionId&#125;?token=...</code>, exactly what the QR encodes.</div>
      </Shell>
    );
  }

  async function doJoin(e) {
    e.preventDefault();
    setStatus("joining");
    setError("");
    try {
      const { token: authToken } = await api.login(email, password);
      setToken(authToken);
      const { attempt, assessment } = await api.joinSession(authToken, sessionId, joinToken);
      setAttempt(attempt);
      setAssessment(assessment);
      setStatus("joined");
    } catch (err) {
      setError(err.message);
      setStatus("error");
    }
  }

  if (status === "joined" && attempt && assessment) {
    return (
      <Shell wide>
        <LiveAssessmentRunner
          assessment={assessment}
          attemptId={attempt.id}
          token={token}
          onSubmitted={(r) => { setResult(r); setStatus("submitted"); }}
        />
      </Shell>
    );
  }

  if (status === "submitted" && result) {
    return (
      <Shell>
        <h2 style={css("font-family:'Poppins',sans-serif; color:#166534; margin:0 0 14px")}>Submitted</h2>
        <div style={css("font-size:32px; font-weight:700; color:#123E7C; margin-bottom:6px")}>{result.score}<span style={css("font-size:16px; color:#5A6472")}> / 100</span></div>
        <div style={css("font-size:12.5px; color:#5A6472; margin-bottom:16px")}>Status: {result.status}</div>
        {result.perDomainScore && Object.keys(result.perDomainScore).length > 0 && (
          <div style={css("margin-bottom:10px")}>
            <div style={css("font-weight:700; font-size:12.5px; margin-bottom:6px")}>Per-domain score</div>
            {Object.entries(result.perDomainScore).map(([k, v]) => (
              <div key={k} style={css("font-size:13px; color:#3B424E")}>{k}: {v}%</div>
            ))}
          </div>
        )}
        {result.perSubSkillScore && Object.keys(result.perSubSkillScore).length > 0 && (
          <div>
            <div style={css("font-weight:700; font-size:12.5px; margin-bottom:6px")}>Per-sub-skill score</div>
            {Object.entries(result.perSubSkillScore).map(([k, v]) => (
              <div key={k} style={css("font-size:13px; color:#3B424E")}>{k}: {v}%</div>
            ))}
          </div>
        )}
      </Shell>
    );
  }

  return (
    <Shell>
      <div style={css("font-size:11px; text-transform:uppercase; letter-spacing:.06em; color:#7A8492; margin-bottom:6px")}>Session {sessionId.slice(0, 8)}…</div>
      <h2 style={css("font-family:'Poppins',sans-serif; color:#123E7C; margin:0 0 16px")}>Sign in to join</h2>
      <form onSubmit={doJoin} style={css("display:grid; gap:12px; max-width:340px")}>
        <label style={css("font-size:12.5px; font-weight:600; color:#3B424E")}>
          Email
          <input value={email} onChange={(e) => setEmail(e.target.value)} style={css("display:block; width:100%; font:inherit; font-size:14px; padding:10px 12px; border:1px solid #C9CFD8; border-radius:6px; margin-top:4px")} />
        </label>
        <label style={css("font-size:12.5px; font-weight:600; color:#3B424E")}>
          Password
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} style={css("display:block; width:100%; font:inherit; font-size:14px; padding:10px 12px; border:1px solid #C9CFD8; border-radius:6px; margin-top:4px")} />
        </label>
        <button type="submit" disabled={status === "joining"} style={css(`font:inherit; font-size:14px; font-weight:700; cursor:pointer; padding:12px 16px; border:0; background:#123E7C; color:#fff; border-radius:8px; opacity:${status === "joining" ? 0.6 : 1}`)}>
          {status === "joining" ? "Joining…" : "Sign in & join session"}
        </button>
        {status === "error" && <div style={css("color:#991B1B; font-size:13px")}>{error}</div>}
      </form>
      <div style={css("font-size:11.5px; color:#7A8492; margin-top:16px")}>Demo credentials pre-filled (seeded learner account). Any registered account works.</div>
    </Shell>
  );
}

function Shell({ children, wide }) {
  return (
    <div style={css(`min-height:100vh; background:#F7F9FC; padding:40px 20px; font:14px/1.5 'Segoe UI', system-ui, sans-serif`)}>
      <div style={css(`max-width:${wide ? "1180px" : "480px"}; margin:0 auto; background:${wide ? "transparent" : "#fff"}; border:${wide ? "none" : "1px solid #E3E9F2"}; padding:${wide ? "0" : "32px"}`)}>
        {children}
      </div>
    </div>
  );
}
