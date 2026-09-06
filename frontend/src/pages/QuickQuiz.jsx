import { useState } from "react";
import { css } from "../lib/css";
import { buildLocalDiagnostic, scoreLocalDiagnostic } from "../lib/localAssessments";

// The QR-scan demo target: a phone camera scans the QR shown on QuickQuizQr.jsx (rendered on the
// trainer's Sessions & QR page), which encodes a URL to this exact route (/quiz). No login, no
// session token, no backend call of any kind — the quiz (the real curated 10-question Price
// Statistics diagnostic, same content the real backend serves) and its scoring both run entirely
// in this page, so the demo works even with the backend down, offline, or on a phone's mobile
// data with no route back to a laptop's dev server. Mounted directly by main.jsx's raw-pathname
// routing, same pattern as JoinPage.jsx.
export default function QuickQuiz() {
  const [assessment] = useState(() => buildLocalDiagnostic());
  const [cursor, setCursor] = useState(0);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);

  const questions = assessment.questions;
  const q = questions[cursor];
  const answeredCount = Object.keys(answers).length;

  function pick(idx) {
    setAnswers((prev) => ({ ...prev, [q.id]: idx }));
  }

  function submit() {
    setResult(scoreLocalDiagnostic(assessment, answers));
  }

  if (result) {
    const passedBadge = result.passed
      ? { label: "Passed", fg: "#166534", bg: "#EBF5EE", border: "#BBDEC7" }
      : { label: "Not passed", fg: "#991B1B", bg: "#FBECEC", border: "#EBC4C4" };
    return (
      <Shell>
        <div style={css("display:inline-flex; align-items:center; gap:8px; font-size:10.5px; font-weight:700; letter-spacing:0.08em; text-transform:uppercase; color:#166534; background:#EBF5EE; border:1px solid #BBDEC7; padding:3px 8px; border-radius:6px")}>Quiz complete</div>
        <h1 style={css("font-family:'Poppins',sans-serif; font-size:26px; font-weight:700; color:#123E7C; margin:10px 0 16px")}>{assessment.title}</h1>
        <div style={css("display:flex; align-items:center; gap:10px; margin-bottom:20px")}>
          <span style={css("font-size:15px; color:#5A6472")}>Score: <strong style={css("color:#123E7C; font-size:20px")}>{result.score}%</strong></span>
          <span style={css(`font-size:11px; font-weight:700; padding:4px 10px; border-radius:6px; color:${passedBadge.fg}; background:${passedBadge.bg}; border:1px solid ${passedBadge.border}`)}>{passedBadge.label}</span>
        </div>
        <div style={css("display:grid; gap:9px; margin-bottom:24px")}>
          {Object.entries(result.perDomainScore).map(([label, pct]) => (
            <div key={label} style={css("display:flex; justify-content:space-between; padding:9px 12px; border:1px solid #E4E7EC; background:#FCFCFD; border-radius:6px")}>
              <span style={css("font-size:13px; font-weight:600; color:#1B5CB8")}>{label}</span>
              <span style={css("font-family:'IBM Plex Mono',monospace; font-size:13px; color:#123E7C")}>{pct}%</span>
            </div>
          ))}
        </div>
        <button
          onClick={() => { setResult(null); setAnswers({}); setCursor(0); }}
          style={css("font:inherit; font-size:14px; font-weight:700; cursor:pointer; padding:12px 20px; border:0; background:#123E7C; color:#fff; border-radius:8px")}
        >
          Retake
        </button>
      </Shell>
    );
  }

  return (
    <Shell wide>
      <div style={css("display:flex; justify-content:space-between; align-items:flex-end; gap:16px; flex-wrap:wrap; margin-bottom:14px")}>
        <div>
          <span style={css("font-family:'IBM Plex Mono',monospace; font-size:11.5px; color:#7A8492")}>SCANNED VIA QR — BUILT-IN DEMO QUIZ</span>
          <h1 style={css("font-family:'Poppins',sans-serif; font-size:22px; font-weight:700; color:#123E7C; margin:5px 0 0")}>{assessment.title}</h1>
        </div>
        <div style={css("font-size:12.5px; color:#5A6472")}>Item {cursor + 1} of {questions.length} · {answeredCount} answered</div>
      </div>
      <div style={css("height:6px; background:#E4E7EC; margin-bottom:20px; border-radius:4px; overflow:hidden")}>
        <div style={css(`height:100%; width:${((answeredCount / questions.length) * 100).toFixed(0)}%; background:#123E7C`)}></div>
      </div>

      <div style={css("background:#fff; border:1px solid #E3E9F2; border-top:3px solid #1B5CB8; padding:22px; border-radius:0 0 8px 8px")}>
        <div style={css("display:flex; gap:9px; align-items:center; flex-wrap:wrap; margin-bottom:14px")}>
          <span style={css("font-size:10.5px; font-weight:700; padding:3px 8px; border-radius:6px; color:#1B5CB8; background:#E8F0FA; border:1px solid #B9CFEC")}>{q.domainTag}</span>
          <span style={css("font-size:10.5px; font-weight:700; padding:3px 8px; border-radius:6px; color:#3B424E; background:#F1F3F6; border:1px solid #DDE1E7")}>{q.subSkillTag}</span>
        </div>
        <div style={css("font-family:'Poppins',sans-serif; font-size:18px; line-height:1.45; font-weight:600; color:#123E7C; margin-bottom:16px")}>{q.stem}</div>
        <div style={css("display:grid; gap:9px")}>
          {q.options.map((opt, i) => {
            const on = answers[q.id] === i;
            return (
              <button
                key={i}
                onClick={() => pick(i)}
                style={css(`font:inherit; text-align:left; cursor:pointer; display:grid; grid-template-columns:28px 1fr; gap:10px; align-items:baseline; padding:13px 14px; border:${on ? "2px solid #123E7C" : "1px solid #DDE1E7"}; background:${on ? "#E8F0FA" : "#fff"}; border-radius:6px`)}
              >
                <span style={css(`font-family:'IBM Plex Mono',monospace; font-size:13px; color:${on ? "#123E7C" : "#7A8492"}; font-weight:500`)}>{String.fromCharCode(65 + i)}</span>
                <span style={css("font-size:14px; line-height:1.5; color:#1A1D23")}>{opt}</span>
              </button>
            );
          })}
        </div>
        <div style={css("display:flex; justify-content:space-between; gap:12px; margin-top:22px; padding-top:16px; border-top:1px solid #EEF0F3")}>
          <button
            onClick={() => setCursor((c) => Math.max(0, c - 1))}
            disabled={cursor === 0}
            style={css(`font:inherit; font-size:13.5px; font-weight:600; cursor:pointer; padding:11px 16px; border:1px solid #C9CFD8; background:#fff; color:#123E7C; border-radius:8px; opacity:${cursor === 0 ? 0.5 : 1}`)}
          >
            Previous
          </button>
          {cursor < questions.length - 1 ? (
            <button onClick={() => setCursor((c) => c + 1)} style={css("font:inherit; font-size:13.5px; font-weight:700; cursor:pointer; padding:11px 20px; border:0; background:#123E7C; color:#fff; border-radius:8px")}>
              Next
            </button>
          ) : (
            <button onClick={submit} style={css("font:inherit; font-size:13.5px; font-weight:700; cursor:pointer; padding:11px 20px; border:0; background:#166534; color:#fff; border-radius:8px")}>
              Submit
            </button>
          )}
        </div>
      </div>
    </Shell>
  );
}

function Shell({ children, wide }) {
  return (
    <div style={css("min-height:100vh; background:#F7F9FC; padding:28px 16px; font:14px/1.5 'Segoe UI', system-ui, sans-serif")}>
      <div style={css(`max-width:${wide ? "640px" : "480px"}; margin:0 auto`)}>{children}</div>
    </div>
  );
}
