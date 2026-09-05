import { useState } from "react";
import { css } from "../lib/css";
import { api } from "../lib/api";

const DUMMY_QUESTIONS = [
  {
    id: "q1",
    stem: "Which sampling method gives every unit in the population an equal chance of selection?",
    options: ["Simple random sampling", "Convenience sampling", "Quota sampling", "Snowball sampling"],
    correctIndex: 0,
    domainTag: "Statistical",
    subSkillTag: "Sampling",
  },
  {
    id: "q2",
    stem: "In national accounts, GVA stands for:",
    options: ["Gross Value Added", "General Value Assessment", "Government Valuation Authority", "Gross Volume Average"],
    correctIndex: 0,
    domainTag: "Statistical",
    subSkillTag: "National Accounts",
  },
  {
    id: "q3",
    stem: "Which Python library is most commonly used for tabular data cleaning?",
    options: ["pandas", "matplotlib", "requests", "flask"],
    correctIndex: 0,
    domainTag: "Technical",
    subSkillTag: "Python",
  },
  {
    id: "q4",
    stem: "Under India's DPDP Act, what must be minimized when processing statistical microdata?",
    options: ["Personal data collection beyond stated purpose", "Server cost", "Survey duration", "Number of enumerators"],
    correctIndex: 0,
    domainTag: "Digital Governance",
    subSkillTag: "Data Privacy",
  },
];

// Trainer-side half of the real end-to-end flow: sign in, create a real
// Assessment (4 dummy MCQs matching the documented stub contract), create a
// Session for it (this is what generates the QR), then hand the learner a
// scannable code / clickable link that lands on JoinPage.jsx — the actual
// backend-driven join -> Attempt -> proctoring -> submit flow.
export default function LiveDemo() {
  const [step, setStep] = useState("login"); // login | create | session
  const [email, setEmail] = useState("trainer@kartavya.gov.in");
  const [password, setPassword] = useState("password123");
  const [token, setToken] = useState("");
  const [title, setTitle] = useState("Live Demo — Sampling & Data Quick Check");
  const [isProctored, setIsProctored] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [session, setSession] = useState(null);

  async function doLogin(e) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const { token } = await api.login(email, password);
      setToken(token);
      setStep("create");
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function createAssessmentAndSession() {
    setBusy(true);
    setError("");
    try {
      const assessment = await api.createAssessment(token, {
        type: "mcq",
        title,
        domainTags: ["Statistical", "Technical", "Digital Governance"],
        subSkillTags: ["Sampling", "National Accounts", "Python", "Data Privacy"],
        timeLimitSeconds: 600,
        passingScore: 50,
        isProctored,
        questions: DUMMY_QUESTIONS,
      });
      const created = await api.createSession(token, {
        assessmentId: assessment.id,
        name: title,
        expiresInMinutes: 120,
      });
      setSession(created);
      setStep("session");
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={css("min-height:100vh; background:#F7F9FC; padding:40px 20px; font:14px/1.5 'Segoe UI', system-ui, sans-serif")}>
      <div style={css("max-width:560px; margin:0 auto; background:#fff; border:1px solid #E3E9F2; padding:32px")}>
        <div style={css("font-size:11px; text-transform:uppercase; letter-spacing:.06em; color:#7A8492; margin-bottom:6px")}>Live backend demo — trainer side</div>
        <h1 style={css("font-family:'Poppins',sans-serif; font-size:22px; color:#123E7C; margin:0 0 18px")}>Create a proctored (or not) test</h1>

        {step === "login" && (
          <form onSubmit={doLogin} style={css("display:grid; gap:12px; max-width:360px")}>
            <label style={css("font-size:12.5px; font-weight:600; color:#3B424E")}>
              Email
              <input value={email} onChange={(e) => setEmail(e.target.value)} style={css("display:block; width:100%; font:inherit; font-size:14px; padding:10px 12px; border:1px solid #C9CFD8; border-radius:6px; margin-top:4px")} />
            </label>
            <label style={css("font-size:12.5px; font-weight:600; color:#3B424E")}>
              Password
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} style={css("display:block; width:100%; font:inherit; font-size:14px; padding:10px 12px; border:1px solid #C9CFD8; border-radius:6px; margin-top:4px")} />
            </label>
            <button type="submit" disabled={busy} style={css("font:inherit; font-size:14px; font-weight:700; cursor:pointer; padding:12px 16px; border:0; background:#123E7C; color:#fff; border-radius:8px")}>
              {busy ? "Signing in…" : "Sign in as trainer"}
            </button>
          </form>
        )}

        {step === "create" && (
          <div style={css("display:grid; gap:14px; max-width:400px")}>
            <label style={css("font-size:12.5px; font-weight:600; color:#3B424E")}>
              Test title
              <input value={title} onChange={(e) => setTitle(e.target.value)} style={css("display:block; width:100%; font:inherit; font-size:14px; padding:10px 12px; border:1px solid #C9CFD8; border-radius:6px; margin-top:4px")} />
            </label>
            <label style={css("display:flex; align-items:center; gap:8px; font-size:13px; font-weight:600; color:#3B424E; cursor:pointer")}>
              <input type="checkbox" checked={isProctored} onChange={(e) => setIsProctored(e.target.checked)} />
              Proctored (launches camera monitoring for whoever joins)
            </label>
            <div style={css("font-size:12px; color:#7A8492")}>Uses 4 fixed sample MCQs (Sampling, National Accounts, Python, Data Privacy) so this doesn't depend on the real question-bank module.</div>
            <button onClick={createAssessmentAndSession} disabled={busy} style={css("font:inherit; font-size:14px; font-weight:700; cursor:pointer; padding:12px 16px; border:0; background:#123E7C; color:#fff; border-radius:8px")}>
              {busy ? "Creating…" : "Create test + session (generates QR)"}
            </button>
          </div>
        )}

        {step === "session" && session && (
          <div>
            <div style={css("font-size:13px; color:#166534; font-weight:700; margin-bottom:14px")}>Session created — scan the QR or open the link below.</div>
            <img src={session.qrDataUrl} alt="Join QR code" style={css("width:220px; height:220px; border:1px solid #E3E9F2; margin-bottom:14px")} />
            <div style={css("font-size:12px; color:#5A6472; margin-bottom:6px")}>Join link (same as what the QR encodes):</div>
            <a href={session.joinUrl} target="_blank" rel="noreferrer" style={css("font-size:13px; color:#1B5CB8; word-break:break-all")}>{session.joinUrl}</a>
            <div style={css("font-size:11.5px; color:#7A8492; margin-top:16px")}>
              On a phone on the same network, scan the QR directly. In this browser, just click the link above — it opens <code>/join/&#123;sessionId&#125;</code>,
              the exact page a real scan lands on: sign in, create the Attempt, render the questions, and (since {isProctored ? "this test is proctored" : "this test is not proctored"}) {isProctored ? "launch the camera harness" : "skip the camera harness entirely"}.
            </div>
          </div>
        )}

        {error && <div style={css("color:#991B1B; font-size:13px; margin-top:14px")}>{error}</div>}
      </div>
    </div>
  );
}
