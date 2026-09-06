import { useState } from "react";
import { css } from "../lib/css";
import { api } from "../lib/api";
import ProctoringHarness from "../components/ProctoringHarness";

// The live, backend-connected counterpart to pages/AssessmentRunner.jsx
// (which stays exactly as-is, driving the polished mock demo). This one
// renders whatever the backend actually returned for a real Attempt —
// Assessment.questions for mcq/diagnostic, Assessment.scenario for
// simulation — submits real answers, and — when the assessment is
// isProctored — mounts the real ProctoringHarness alongside it.
export default function LiveAssessmentRunner({ assessment, attemptId, token, onSubmitted, localScorer }) {
  const [kicked, setKicked] = useState(null);

  if (kicked) {
    return (
      <div style={css("max-width:520px; margin:60px auto; background:#fff; border:1px solid #E3E9F2; border-top:3px solid #991B1B; padding:28px; text-align:center")}>
        <h2 style={css("font-family:'Poppins',sans-serif; color:#991B1B; margin:0 0 10px")}>Attempt terminated</h2>
        <div style={css("color:#3B424E; font-size:14px; line-height:1.6")}>
          Too many proctoring warnings — this attempt was force-submitted by the backend, exactly like a real proctored test.
        </div>
      </div>
    );
  }

  return (
    <section style={css("padding:24px 0 0; max-width:1180px; margin:0 auto")}>
      <div style={css("display:flex; justify-content:space-between; align-items:flex-end; gap:16px; flex-wrap:wrap; margin-bottom:14px")}>
        <div>
          <span style={css("font-family:'IBM Plex Mono',monospace; font-size:11.5px; color:#7A8492")}>LIVE ASSESSMENT — BACKEND CONNECTED</span>
          <h1 style={css("font-family:'Poppins',sans-serif; font-size:24px; font-weight:700; color:#123E7C; margin:5px 0 0")}>{assessment.title}</h1>
        </div>
        {assessment.isProctored && <div style={css("font-size:12.5px; color:#5A6472; text-align:right")}>🔴 Proctored</div>}
      </div>

      <div style={css(`display:grid; grid-template-columns:${assessment.isProctored ? "2fr 1fr" : "1fr"}; gap:20px; align-items:start`)}>
        {assessment.type === "simulation" ? (
          <ScenarioRunner assessment={assessment} attemptId={attemptId} token={token} onSubmitted={onSubmitted} localScorer={localScorer} />
        ) : (
          <McqRunner assessment={assessment} attemptId={attemptId} token={token} onSubmitted={onSubmitted} />
        )}

        {assessment.isProctored && (
          <ProctoringHarness attemptId={attemptId} token={token} onKicked={setKicked} />
        )}
      </div>
    </section>
  );
}

function McqRunner({ assessment, attemptId, token, onSubmitted }) {
  const questions = Array.isArray(assessment.questions) ? assessment.questions : [];
  const [cursor, setCursor] = useState(0);
  const [answers, setAnswers] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const q = questions[cursor];
  const answeredCount = Object.keys(answers).length;

  function pick(idx) {
    setAnswers((prev) => ({ ...prev, [q.id]: idx }));
  }

  async function submit() {
    setSubmitting(true);
    setError("");
    try {
      const answerPayload = Object.entries(answers).map(([questionId, selectedIndex]) => ({ questionId, selectedIndex }));
      const result = await api.submitAttempt(token, attemptId, answerPayload);
      onSubmitted(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (!q) {
    return <div style={css("padding:40px; text-align:center; color:#5A6472")}>This assessment has no questions.</div>;
  }

  return (
    <>
      <div style={css("height:6px; background:#E4E7EC; margin-bottom:20px")}>
        <div style={css(`height:100%; width:${((answeredCount / questions.length) * 100).toFixed(0)}%; background:#123E7C`)}></div>
      </div>
      <div style={css("background:#fff; border:1px solid #E3E9F2; border-top:3px solid #1B5CB8; padding:26px; min-width:0")}>
        <div style={css("display:flex; justify-content:flex-end; margin-bottom:4px")}>
          <span style={css("font-size:12.5px; color:#5A6472")}>Item {cursor + 1} of {questions.length} · {answeredCount} answered</span>
        </div>
        <div style={css("display:flex; gap:9px; align-items:center; flex-wrap:wrap; margin-bottom:14px")}>
          {q.domainTag && <span style={css("font-size:10.5px; font-weight:700; padding:3px 8px; border-radius:6px; color:#1B5CB8; background:#E8F0FA; border:1px solid #B9CFEC")}>{q.domainTag}</span>}
          {q.subSkillTag && <span style={css("font-size:10.5px; font-weight:700; padding:3px 8px; border-radius:6px; color:#3B424E; background:#F1F3F6; border:1px solid #DDE1E7")}>{q.subSkillTag}</span>}
          {q.isStub && <span style={css("font-family:'IBM Plex Mono',monospace; font-size:9.5px; letter-spacing:0.06em; border:1px solid #C9CFD8; background:#fff; padding:2px 6px")}>STUB QUESTION</span>}
        </div>
        <div style={css("font-family:'Poppins',sans-serif; font-size:20px; line-height:1.45; font-weight:600; color:#123E7C; margin-bottom:18px")}>{q.stem}</div>

        <div style={css("display:grid; gap:9px")}>
          {(q.options || []).map((opt, i) => {
            const on = answers[q.id] === i;
            return (
              <button
                key={i}
                onClick={() => pick(i)}
                style={css(`font:inherit; text-align:left; cursor:pointer; display:grid; grid-template-columns:30px 1fr; gap:12px; align-items:baseline; padding:14px 15px; border:${on ? "2px solid #123E7C" : "1px solid #DDE1E7"}; background:${on ? "#E8F0FA" : "#fff"}; border-radius:6px`)}
              >
                <span style={css(`font-family:'IBM Plex Mono',monospace; font-size:13px; color:${on ? "#123E7C" : "#7A8492"}; font-weight:500`)}>{["A", "B", "C", "D"][i]}</span>
                <span style={css("font-size:14.5px; line-height:1.5; color:#1A1D23")}>{opt}</span>
              </button>
            );
          })}
        </div>

        <div style={css("display:flex; justify-content:space-between; gap:12px; margin-top:24px; padding-top:18px; border-top:1px solid #EEF0F3; flex-wrap:wrap")}>
          <button
            onClick={() => setCursor((c) => Math.max(0, c - 1))}
            disabled={cursor === 0}
            style={css(`font:inherit; font-size:14px; font-weight:600; cursor:pointer; padding:12px 18px; border:1px solid #C9CFD8; background:#fff; color:#123E7C; border-radius:8px; opacity:${cursor === 0 ? 0.5 : 1}`)}
          >
            Previous
          </button>
          {cursor < questions.length - 1 ? (
            <button onClick={() => setCursor((c) => c + 1)} style={css("font:inherit; font-size:14px; font-weight:700; cursor:pointer; padding:12px 22px; border:0; background:#123E7C; color:#fff; border-radius:8px")}>
              Next item
            </button>
          ) : (
            <button
              onClick={submit}
              disabled={submitting}
              style={css(`font:inherit; font-size:14px; font-weight:700; cursor:pointer; padding:12px 22px; border:0; background:#166534; color:#fff; border-radius:8px; opacity:${submitting ? 0.6 : 1}`)}
            >
              {submitting ? "Submitting…" : "Submit for evaluation"}
            </button>
          )}
        </div>
        {error && <div style={css("color:#991B1B; font-size:13px; margin-top:10px")}>{error}</div>}
      </div>
    </>
  );
}

// Walks assessment.scenario's node/choice tree exactly like
// simulations.service.ts's scoreSimulationPath expects: a decision node has
// `prompt` + `choices` (each pointing at nextNodeId); a node with no
// `choices` is terminal (outcome/feedback/score). The learner's path is
// recorded as {nodeId, choiceId} steps and submitted verbatim as `answers`.
function ScenarioRunner({ assessment, attemptId, token, onSubmitted, localScorer }) {
  const scenario = assessment.scenario;
  const [currentNodeId, setCurrentNodeId] = useState(scenario?.startNodeId);
  const [path, setPath] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [pendingResult, setPendingResult] = useState(null);

  if (!scenario || !scenario.nodes) {
    return <div style={css("padding:40px; text-align:center; color:#5A6472")}>This simulation has no scenario data.</div>;
  }

  const node = scenario.nodes[currentNodeId];
  const isTerminal = !node?.choices;

  async function choose(choice) {
    const nextPath = [...path, { nodeId: currentNodeId, choiceId: choice.id }];
    setPath(nextPath);

    const nextNode = scenario.nodes[choice.nextNodeId];
    if (nextNode && !nextNode.choices) {
      // Reached a terminal node — score the path, but hold onto the result and let the learner
      // actually read the outcome/feedback text before navigating away (see the "Continue" button
      // below) rather than yanking them straight to the results screen.
      setSubmitting(true);
      setError("");
      try {
        // No token (no backend deployed yet) — score entirely client-side instead of erroring out.
        const result = token ? await api.submitAttempt(token, attemptId, nextPath) : localScorer(nextPath);
        setCurrentNodeId(choice.nextNodeId);
        setPendingResult(result);
      } catch (err) {
        setError(err.message);
      } finally {
        setSubmitting(false);
      }
    } else {
      setCurrentNodeId(choice.nextNodeId);
    }
  }

  return (
    <div style={css("background:#fff; border:1px solid #E3E9F2; border-top:3px solid #F58220; padding:26px; min-width:0")}>
      <div style={css("display:flex; gap:9px; align-items:center; flex-wrap:wrap; margin-bottom:14px")}>
        <span style={css("font-size:10.5px; font-weight:700; padding:3px 8px; border-radius:6px; color:#C25E10; background:#FFF1E6; border:1px solid #F3C79A")}>SITUATION SIMULATION</span>
        {scenario.domainTag && <span style={css("font-size:10.5px; font-weight:700; padding:3px 8px; border-radius:6px; color:#1B5CB8; background:#E8F0FA; border:1px solid #B9CFEC")}>{scenario.domainTag}</span>}
        {scenario.subSkillTag && <span style={css("font-size:10.5px; font-weight:700; padding:3px 8px; border-radius:6px; color:#3B424E; background:#F1F3F6; border:1px solid #DDE1E7")}>{scenario.subSkillTag}</span>}
      </div>
      <div style={css("font-size:12.5px; color:#7A8492; margin-bottom:14px")}>Step {path.length + 1} · {scenario.title}</div>

      {isTerminal ? (
        <div>
          <div style={css("font-family:'Poppins',sans-serif; font-size:20px; font-weight:700; color:#166534; margin-bottom:10px")}>Outcome{pendingResult ? ` — scored ${pendingResult.score}/100` : ""}</div>
          <div style={css("font-size:15px; line-height:1.55; color:#1A1D23; margin-bottom:14px")}>{node.outcome}</div>
          {node.feedback && <div style={css("font-size:14px; line-height:1.6; color:#3B424E; background:#F6FAFF; border:1px solid #B9CFEC; border-radius:8px; padding:14px")}>{node.feedback}</div>}
          {pendingResult && (
            <button
              onClick={() => onSubmitted(pendingResult)}
              style={css("font:inherit; margin-top:18px; font-size:14px; font-weight:700; cursor:pointer; padding:12px 22px; border:0; background:#166534; color:#fff; border-radius:8px")}
            >
              Continue
            </button>
          )}
        </div>
      ) : (
        <>
          <div style={css("font-family:'Poppins',sans-serif; font-size:19px; line-height:1.5; font-weight:600; color:#123E7C; margin-bottom:18px")}>{node.prompt}</div>
          <div style={css("display:grid; gap:9px")}>
            {(node.choices || []).map((choice) => (
              <button
                key={choice.id}
                onClick={() => choose(choice)}
                disabled={submitting}
                style={css(`font:inherit; text-align:left; cursor:pointer; padding:14px 15px; border:1px solid #DDE1E7; background:#fff; border-radius:6px; opacity:${submitting ? 0.6 : 1}`)}
              >
                <span style={css("font-size:14.5px; line-height:1.5; color:#1A1D23")}>{choice.label}</span>
              </button>
            ))}
          </div>
        </>
      )}
      {error && <div style={css("color:#991B1B; font-size:13px; margin-top:10px")}>{error}</div>}
    </div>
  );
}
