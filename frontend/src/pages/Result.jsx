import { css } from "../lib/css";

export default function Result({ v }) {
  const result = v.diagResult;

  if (!result) {
    return (
      <section style={css("padding:60px 0; text-align:center")}>
        <div style={css("font-size:13.5px; color:#7A8492; margin-bottom:16px")}>No submitted attempt to show yet.</div>
        <button onClick={v.goAssess} style={css("font:inherit; font-size:13.5px; font-weight:700; cursor:pointer; padding:11px 18px; border:0; background:#123E7C; color:#fff; border-radius:8px")}>Back to Assessments</button>
      </section>
    );
  }

  const passedBadge =
    result.passed === null
      ? { label: "No pass/fail threshold set", fg: "#5A6472", bg: "#F1F3F6", border: "#DDE1E7" }
      : result.passed
        ? { label: "Passed", fg: "#166534", bg: "#EBF5EE", border: "#BBDEC7" }
        : { label: "Not passed", fg: "#991B1B", bg: "#FBECEC", border: "#EBC4C4" };

  // perDomainScore/perSubSkillScore are plain { [tagName]: percent } records from the real
  // backend — rendered directly as a flat list of percentages, not forced into the old mock's
  // "current vs required-for-target-role" gap-map shape (that comparison doesn't exist here).
  const domainEntries = Object.entries(result.perDomainScore || {});
  const subSkillEntries = Object.entries(result.perSubSkillScore || {});

  // results[] only carries {questionId, selectedIndex, isCorrect, explanations?} — cross-reference
  // against the assessment definition (still in state from when the attempt was taken) to show the
  // actual question text/options alongside each result.
  const questionsById = Object.fromEntries((v.diagQuestions || []).map((q) => [q.id, q]));
  const items = (result.results || []).map((r) => ({ ...r, question: questionsById[r.questionId] }));

  return (
    <section style={css("padding:24px 0 0; max-width:1100px; margin:0 auto")}>
      <div style={css("background:#fff; border:1px solid #E3E9F2; border-top:3px solid #166534; padding:24px 26px")}>
        <div style={css("display:flex; justify-content:space-between; gap:20px; align-items:flex-start; flex-wrap:wrap")}>
          <div>
            <div style={css("display:inline-flex; align-items:center; gap:8px; font-size:10.5px; font-weight:700; letter-spacing:0.08em; text-transform:uppercase; color:#166534; background:#EBF5EE; border:1px solid #BBDEC7; padding:3px 8px; border-radius:6px")}>Assessment complete</div>
            <h1 style={css("font-family:'Poppins',sans-serif; font-size:26px; font-weight:700; color:#123E7C; margin:10px 0 4px")}>Your diagnostic results</h1>
            <div style={css("display:flex; align-items:center; gap:10px; flex-wrap:wrap")}>
              <span style={css("font-size:13.5px; color:#5A6472")}>Score: <strong style={css("color:#123E7C")}>{result.score}%</strong></span>
              <span style={css(`font-size:11px; font-weight:700; padding:3px 8px; border-radius:6px; color:${passedBadge.fg}; background:${passedBadge.bg}; border:1px solid ${passedBadge.border}`)}>{passedBadge.label}</span>
            </div>
          </div>
          <div style={css("display:grid; gap:9px")}>
            {v.needsSimulation && (
              <button onClick={v.startSimulation} style={css("font:inherit; font-size:14px; font-weight:800; cursor:pointer; padding:12px 20px; border:0; background:#F58220; color:#3D1D00; border-radius:8px; white-space:nowrap")}>Continue to situation simulation</button>
            )}
            <button onClick={v.goDash} style={css("font:inherit; font-size:14px; font-weight:700; cursor:pointer; padding:12px 20px; border:0; background:#123E7C; color:#fff; border-radius:8px; white-space:nowrap")}>Back to dashboard</button>
          </div>
        </div>

        {domainEntries.length > 0 && (
          <div style={css("display:grid; grid-template-columns:repeat(auto-fit,minmax(min(100%,180px),1fr)); gap:12px; margin-top:18px; padding-top:18px; border-top:1px solid #EEF0F3")}>
            {domainEntries.map(([label, pct]) => (
              <div key={label} style={css("border:1px solid #E4E7EC; padding:11px 12px; background:#FCFCFD")}>
                <div style={css("font-size:12px; font-weight:700; color:#1B5CB8")}>{label}</div>
                <div style={css("font-family:'IBM Plex Mono',monospace; font-size:17px; color:#123E7C; margin-top:4px")}>{pct}%</div>
              </div>
            ))}
          </div>
        )}

        {subSkillEntries.length > 0 && (
          <div style={css("margin-top:14px")}>
            <div style={css("font-size:10.5px; font-weight:700; letter-spacing:0.09em; text-transform:uppercase; color:#7A8492; margin-bottom:8px")}>Per sub-skill</div>
            <div style={css("display:flex; gap:8px; flex-wrap:wrap")}>
              {subSkillEntries.map(([label, pct]) => (
                <span key={label} style={css("font-size:12px; padding:5px 10px; border-radius:14px; border:1px solid #DDE1E7; background:#FBFCFD; color:#3B424E")}>{label}: <strong>{pct}%</strong></span>
              ))}
            </div>
          </div>
        )}
      </div>

      <div style={css("display:flex; justify-content:space-between; align-items:baseline; gap:12px; margin:24px 0 12px; flex-wrap:wrap")}>
        <h2 style={css("font-family:'Poppins',sans-serif; font-size:21px; font-weight:700; color:#123E7C; margin:0")}>Item-by-item feedback</h2>
      </div>
      <div style={css("display:grid; gap:12px")}>
        {items.map((item, i) => {
          const q = item.question;
          return (
            <div key={item.questionId} style={css("background:#fff; border:1px solid #E3E9F2; padding:18px 20px")}>
              <div style={css("display:flex; gap:9px; align-items:center; flex-wrap:wrap; margin-bottom:9px")}>
                <span style={css("font-family:'IBM Plex Mono',monospace; font-size:11.5px; color:#7A8492")}>{String(i + 1).padStart(2, "0")}</span>
                {q?.domainTag && <span style={css("font-size:10.5px; font-weight:700; padding:3px 7px; border-radius:6px; color:#1B5CB8; background:#E8F0FA; border:1px solid #B9CFEC")}>{q.domainTag}</span>}
                {q?.subSkillTag && <span style={css("font-size:11.5px; color:#7A8492")}>{q.subSkillTag}</span>}
                <span style={css(`margin-left:auto; font-size:11.5px; font-weight:700; padding:4px 9px; border-radius:6px; color:${item.isCorrect ? "#166534" : "#991B1B"}; background:${item.isCorrect ? "#EBF5EE" : "#FBECEC"}`)}>{item.isCorrect ? "Correct" : "Incorrect"}</span>
              </div>
              <div style={css("font-size:14.5px; font-weight:600; color:#1A1D23; line-height:1.45; max-width:820px")}>{q?.stem ?? "(question text unavailable)"}</div>
              <div style={css("font-size:13px; color:#3B424E; margin-top:8px")}>
                Your answer: <strong>{item.selectedIndex === null ? "Not answered" : (q?.options?.[item.selectedIndex] ?? `Option ${item.selectedIndex}`)}</strong>
              </div>
              {/* Only shown for wrong answers, and only once q.correctIndex is actually available
                  (the revealed post-submission question copy) — falls back to nothing rather than
                  a broken "Option undefined" if that follow-up fetch hasn't resolved yet. */}
              {!item.isCorrect && q?.correctIndex !== undefined && (
                <div style={css("font-size:13px; color:#166534; margin-top:4px")}>
                  Correct answer: <strong>{q.options?.[q.correctIndex] ?? `Option ${q.correctIndex}`}</strong>
                </div>
              )}
              {item.explanations
                ? <div style={css("font-size:13px; color:#3B424E; line-height:1.6; margin-top:10px; border-left:2px solid #F58220; padding-left:12px; max-width:860px")}>{typeof item.explanations === "string" ? item.explanations : JSON.stringify(item.explanations)}</div>
                : <div style={css("font-size:12px; color:#9A8B7A; font-style:italic; margin-top:10px")}>No explanation available for this placeholder question.</div>}
            </div>
          );
        })}
      </div>
    </section>
  );
}
