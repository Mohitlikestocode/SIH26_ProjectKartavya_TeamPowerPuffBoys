import { css } from "../lib/css";

export default function AssessmentRunner({ v }) {
  if (v.diagLoading) {
    return (
      <section style={css("padding:96px 0; text-align:center")}>
        <div style={css("font-size:14px; color:#5A6472")}>Loading the diagnostic assessment…</div>
      </section>
    );
  }

  if (v.diagLoadError) {
    return (
      <section style={css("padding:60px 0; max-width:520px; margin:0 auto; text-align:center")}>
        <div style={css("padding:16px 18px; border:1px solid #EBC4C4; background:#FBECEC; color:#991B1B; font-size:13.5px; border-radius:8px")}>
          Could not load the diagnostic assessment: {v.diagLoadError}
        </div>
        <button onClick={v.goAssess} style={css("font:inherit; margin-top:16px; font-size:13.5px; font-weight:700; cursor:pointer; padding:11px 18px; border:0; background:#123E7C; color:#fff; border-radius:8px")}>Back to Assessments</button>
      </section>
    );
  }

  const questions = v.diagQuestions;
  if (questions.length === 0) {
    return (
      <section style={css("padding:60px 0; text-align:center; color:#7A8492; font-size:13.5px")}>No questions in this assessment.</section>
    );
  }

  const total = questions.length;
  const cursor = Math.min(v.diagCursor, total - 1);
  const item = questions[cursor];
  const answeredCount = Object.keys(v.diagAnswers).filter((qid) => questions.some((q) => q.id === qid)).length;
  const runnerPct = ((answeredCount / total) * 100).toFixed(0) + "%";
  const notLastItem = cursor < total - 1;
  const isLastItem = cursor === total - 1;

  return (
    <section style={css("padding:24px 0 0; max-width:1180px; margin:0 auto")}>
      <div style={css("display:flex; justify-content:space-between; align-items:flex-end; gap:16px; flex-wrap:wrap; margin-bottom:14px")}>
        <div>
          <span style={css("font-family:'IBM Plex Mono',monospace; font-size:11.5px; color:#7A8492")}>BASELINE DIAGNOSTIC</span>
          <h1 style={css("font-family:'Poppins',sans-serif; font-size:24px; font-weight:700; color:#123E7C; margin:5px 0 0")}>Baseline Diagnostic</h1>
        </div>
        <div style={css("font-size:12.5px; color:#5A6472; text-align:right")}>Item {cursor + 1} of {total} · {answeredCount} answered</div>
      </div>
      <div style={css("height:6px; background:#E4E7EC; margin-bottom:20px")}><div style={css(`height:100%; width:${runnerPct}; background:#123E7C`)}></div></div>
      <div style={css("display:grid; grid-template-columns:repeat(auto-fit,minmax(min(100%,300px),1fr)); gap:20px; align-items:start")}>
        <div style={css("background:#fff; border:1px solid #E3E9F2; border-top:3px solid #1B5CB8; padding:26px; min-width:0")}>
          <div style={css("display:flex; gap:9px; align-items:center; flex-wrap:wrap; margin-bottom:14px")}>
            {item.domainTag && <span style={css("font-size:10.5px; font-weight:700; padding:3px 8px; border-radius:6px; color:#1B5CB8; background:#E8F0FA; border:1px solid #B9CFEC")}>{item.domainTag}</span>}
            {item.subSkillTag && <span style={css("font-size:11.5px; color:#7A8492")}>{item.subSkillTag}</span>}
            {/* Design choice: flagged, not silent — a small badge so placeholder content is
                obviously placeholder during demo/testing, rather than looking like a real question
                that happens to be oddly generic. Remove once real questions replace the stub set. */}
            {item.isStub && (
              <span style={css("font-size:10px; font-weight:700; letter-spacing:0.04em; text-transform:uppercase; padding:3px 7px; border-radius:6px; color:#9A3412; background:#FDF0E4; border:1px dashed #EFCFAC")}>Placeholder content</span>
            )}
          </div>
          <div style={css("font-family:'Poppins',sans-serif; font-size:20px; line-height:1.45; font-weight:600; color:#123E7C; margin-bottom:18px; text-wrap:pretty")}>{item.stem}</div>
          <div style={css("display:grid; gap:9px")}>
            {(item.options || []).map((optionText, i) => {
              const on = v.diagAnswers[item.id] === i;
              return (
                <button
                  key={i}
                  onClick={() => v.selectDiagAnswer(item.id, i)}
                  style={css(`font:inherit; text-align:left; cursor:pointer; display:grid; grid-template-columns:30px 1fr; gap:12px; align-items:baseline; padding:14px 15px; border:${on ? "2px solid #123E7C" : "1px solid #DDE1E7"}; background:${on ? "#E8F0FA" : "#fff"}; border-radius:6px`)}
                >
                  <span style={css(`font-family:'IBM Plex Mono',monospace; font-size:13px; color:${on ? "#123E7C" : "#7A8492"}; font-weight:500`)}>{String.fromCharCode(65 + i)}</span>
                  <span style={css("font-size:14.5px; line-height:1.5; color:#1A1D23")}>{optionText}</span>
                </button>
              );
            })}
          </div>
          <div style={css("display:flex; justify-content:space-between; gap:12px; margin-top:24px; padding-top:18px; border-top:1px solid #EEF0F3; flex-wrap:wrap")}>
            <button onClick={v.diagGoPrev} style={css("font:inherit; font-size:14px; font-weight:600; cursor:pointer; padding:12px 18px; border:1px solid #C9CFD8; background:#fff; color:#123E7C; border-radius:8px")}>Previous</button>
            {notLastItem && (
              <button onClick={v.diagGoNext} style={css("font:inherit; font-size:14px; font-weight:700; cursor:pointer; padding:12px 22px; border:0; background:#123E7C; color:#fff; border-radius:8px")}>Next item</button>
            )}
            {isLastItem && (
              <button onClick={v.submitDiagnostic} style={css("font:inherit; font-size:14px; font-weight:700; cursor:pointer; padding:12px 22px; border:0; background:#166534; color:#fff; border-radius:8px")}>Submit for evaluation</button>
            )}
          </div>
        </div>
        <div style={css("display:grid; gap:16px; max-width:340px")}>
          <div style={css("background:#fff; border:1px solid #E3E9F2; padding:18px 20px")}>
            <div style={css("font-size:10.5px; font-weight:700; letter-spacing:0.09em; text-transform:uppercase; color:#7A8492; margin-bottom:11px")}>Items</div>
            <div style={css("display:grid; gap:5px")}>
              {questions.map((q, i) => {
                const done = v.diagAnswers[q.id] !== undefined;
                const on = i === cursor;
                return (
                  <button
                    key={q.id}
                    onClick={() => v.diagGoToIndex(i)}
                    style={css(`font:inherit; text-align:left; cursor:pointer; display:grid; grid-template-columns:26px 1fr 16px; gap:9px; align-items:center; padding:8px 9px; border:${on ? "1px solid #123E7C" : "1px solid #EEF0F3"}; background:${on ? "#E8F0FA" : "#fff"}; border-radius:6px`)}
                  >
                    <span style={css("font-family:'IBM Plex Mono',monospace; font-size:11.5px; color:#5A6472")}>{String(i + 1).padStart(2, "0")}</span>
                    <span style={css(`font-size:12.5px; color:#1A1D23; font-weight:${on ? "700" : "400"}`)}>{q.subSkillTag || q.domainTag || "Item"}</span>
                    <span style={css(`width:10px; height:10px; border-radius:50%; background:${done ? "#166534" : "#DDE1E7"}`)}></span>
                  </button>
                );
              })}
            </div>
          </div>
          <div style={css("background:#EEF1F6; border:1px solid #DDE1E7; padding:16px 18px")}>
            <div style={css("font-size:12.5px; color:#3B424E; line-height:1.6")}>{total} items across your competency domains. Your answers are submitted once, at the end.</div>
          </div>
          <button onClick={v.goDash} style={css("font:inherit; font-size:13px; font-weight:600; cursor:pointer; padding:11px 14px; border:1px solid #C9CFD8; background:#fff; color:#123E7C; border-radius:8px")}>Save and exit</button>
        </div>
      </div>
    </section>
  );
}
