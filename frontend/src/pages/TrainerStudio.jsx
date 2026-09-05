import { css } from "../lib/css";

export default function TrainerStudio({ v }) {
  return (
    <section style={css("padding:24px 0 0")}>
      <div style={css("display:flex; justify-content:space-between; align-items:flex-end; gap:20px; flex-wrap:wrap; margin-bottom:18px")}>
        <div>
          <h1 style={css("font-family:'Poppins',sans-serif; font-size:28px; font-weight:700; color:#123E7C; margin:0")}>Review generated items</h1>
          <div style={css("font-size:13.5px; color:#5A6C86; margin-top:4px")}>Source file: <strong style={css("color:#123E7C")}>NSSTA_Sampling_Methodology_Module4.pdf</strong> · 62 pages · uploaded 3 Sep 2026</div>
          <div style={css("display:flex; gap:8px; align-items:center; flex-wrap:wrap; margin-top:8px")}>
            <span style={css("font-size:10.5px; font-weight:700; letter-spacing:0.05em; text-transform:uppercase; color:#7A8AA3")}>Mapped to course</span>
            <span style={css("font-size:12.5px; font-weight:700; color:#123E7C; background:#E8F0FA; border:1px solid #B9CFEC; padding:5px 11px; border-radius:20px")}>{v.genCourseTitle}</span>
            <button onClick={v.goUpload} style={css("font:inherit; font-size:12px; font-weight:600; cursor:pointer; padding:0; border:0; background:none; color:#1B5CB8; text-decoration:underline")}>Change</button>
          </div>
        </div>
        <div style={css("display:flex; gap:10px; flex-wrap:wrap")}>
          <button style={css("font:inherit; font-size:13.5px; font-weight:600; cursor:pointer; padding:11px 16px; border:1px solid #C9CFD8; background:#fff; color:#123E7C; border-radius:8px")}>Question bank (1,842)</button>
          <button style={css("font:inherit; font-size:13.5px; font-weight:700; cursor:pointer; padding:11px 16px; border:0; background:#123E7C; color:#fff; border-radius:8px")}>Publish {v.approvedCount} approved</button>
        </div>
      </div>
      <div style={css("background:#fff; border:1px solid #E3E9F2")}>
        <div style={css("padding:14px 22px; border-bottom:1px solid #DDE1E7; display:flex; justify-content:space-between; align-items:center; gap:14px; background:#FBFCFD; flex-wrap:wrap")}>
          <div style={css("display:flex; align-items:center; gap:12px; flex-wrap:wrap")}>
            <span style={css("font-family:'IBM Plex Mono',monospace; font-size:9.5px; letter-spacing:0.06em; border:1px solid #C9CFD8; background:#fff; padding:3px 6px; color:#5A6472")}>UNPUBLISHED DRAFT SET</span>
            <span style={css("font-size:13px; color:#3B424E")}>{v.totalItemCount} items · {v.manualCount} written by you · <strong style={css("color:#123E7C")}>{v.approvedCount} approved</strong> · {v.rejectedCount} rejected · {v.pendingCount} pending</span>
          </div>
          <div style={css("display:flex; gap:10px; align-items:center; flex-wrap:wrap")}>
            <span style={css("font-size:12.5px; color:#7A8AA3")}>Nothing reaches learners until you approve it.</span>
            <button onClick={v.openAdd} style={css("font:inherit; font-size:13px; font-weight:700; cursor:pointer; padding:10px 16px; border:0; background:#F58220; color:#fff; border-radius:24px; white-space:nowrap")}>+ Write a question</button>
          </div>
        </div>

        {v.addOpen && (
          <div style={css("padding:22px; border-bottom:1px solid #EEF1F6; background:#FFFDF8")}>
            <div style={css("display:flex; justify-content:space-between; align-items:baseline; gap:12px; flex-wrap:wrap; margin-bottom:14px")}>
              <div>
                <div style={css("font-size:16px; font-weight:700; color:#123E7C")}>Write a question yourself</div>
                <div style={css("font-size:12.5px; color:#5A6C86; margin-top:2px")}>Added to this set as authored by you — no confidence score, approved on save.</div>
              </div>
              <button onClick={v.closeAdd} style={css("font:inherit; font-size:12.5px; font-weight:600; cursor:pointer; padding:8px 13px; border:1px solid #C9D6E8; background:#fff; color:#123E7C; border-radius:20px")}>Cancel</button>
            </div>
            <label htmlFor="addStem" style={css("display:block; font-size:12.5px; font-weight:700; color:#123E7C; margin-bottom:6px")}>Question</label>
            <textarea id="addStem" onChange={v.onAddStem} value={v.addStem} placeholder="e.g. Which allocation minimises variance when stratum variances differ?" style={css("width:100%; min-height:78px; font:inherit; font-size:14px; line-height:1.55; padding:12px; border:1px solid #C9D6E8; border-radius:8px; resize:vertical")}></textarea>
            <div style={css("font-size:12.5px; font-weight:700; color:#123E7C; margin:14px 0 6px")}>Options — mark the correct one</div>
            <div style={css("display:grid; gap:8px")}>
              {v.addOptions.map((o, i) => (
                <div key={i} style={css("display:grid; grid-template-columns:26px 1fr auto; gap:10px; align-items:center")}>
                  <span style={css("font-family:'IBM Plex Mono',monospace; font-size:13px; color:#5A6C86")}>{o.key}</span>
                  <input type="text" value={o.value} onChange={o.onChange} placeholder={`Option ${o.key}`} style={css("width:100%; font:inherit; font-size:14px; padding:10px 12px; border:1px solid #C9D6E8; border-radius:8px")} />
                  <button onClick={o.pick} style={css(`font:inherit; font-size:12px; font-weight:700; cursor:pointer; white-space:nowrap; padding:9px 13px; border:1px solid ${o.markBorder}; background:${o.markBg}; color:${o.markFg}; border-radius:20px`)}>{o.markLabel}</button>
                </div>
              ))}
            </div>
            <div style={css("display:grid; grid-template-columns:repeat(auto-fit,minmax(min(100%,300px),1fr)); gap:14px; margin-top:16px")}>
              <div>
                <label htmlFor="addDom" style={css("display:block; font-size:12.5px; font-weight:700; color:#123E7C; margin-bottom:6px")}>Competency domain</label>
                <select id="addDom" onChange={v.onAddDomain} value={v.addDomain} style={css("width:100%; font:inherit; font-size:14px; padding:10px 12px; border:1px solid #C9D6E8; background:#fff; border-radius:8px")}>
                  <option value="Statistical">Statistical</option>
                  <option value="Technical">Technical</option>
                  <option value="Digital Governance">Digital Governance</option>
                  <option value="Behavioural">Behavioural / Managerial</option>
                </select>
              </div>
              <div>
                <label htmlFor="addDiff" style={css("display:block; font-size:12.5px; font-weight:700; color:#123E7C; margin-bottom:6px")}>Difficulty</label>
                <select id="addDiff" onChange={v.onAddDiff} value={v.addDiff} style={css("width:100%; font:inherit; font-size:14px; padding:10px 12px; border:1px solid #C9D6E8; background:#fff; border-radius:8px")}>
                  <option value="Easy">Easy</option>
                  <option value="Moderate">Moderate</option>
                  <option value="Hard">Hard</option>
                </select>
              </div>
            </div>
            <button onClick={v.saveAdd} style={css("font:inherit; font-size:14.5px; font-weight:700; cursor:pointer; padding:13px 20px; border:0; background:#123E7C; color:#fff; border-radius:24px; margin-top:18px")}>Add to question set</button>
          </div>
        )}

        {v.questions.map((q, i) => (
          <div key={i} style={css(`padding:20px 22px; border-bottom:1px solid #EEF0F3; background:${q.rowBg}`)}>
            <div style={css("display:flex; justify-content:space-between; gap:20px; align-items:flex-start; flex-wrap:wrap")}>
              <div style={css("flex:1; min-width:280px")}>
                <div style={css("display:flex; gap:8px; align-items:center; flex-wrap:wrap; margin-bottom:9px")}>
                  <span style={css("font-family:'IBM Plex Mono',monospace; font-size:11.5px; color:#7A8492")}>Q{q.no}</span>
                  <span style={css(`font-size:10.5px; font-weight:700; padding:3px 7px; border-radius:6px; color:${q.domColor}; background:${q.domTint}; border:1px solid ${q.domBorder}`)}>{q.domain}</span>
                  <span style={css("font-size:10.5px; font-weight:700; padding:3px 7px; border-radius:6px; color:#3B424E; background:#F1F3F6; border:1px solid #DDE1E7")}>{q.difficulty}</span>
                  <span style={css(`font-size:10.5px; font-weight:700; padding:3px 7px; border-radius:6px; color:${q.originFg}; background:${q.originBg}; border:1px solid ${q.originBorder}`)}>{q.originLabel}</span>
                  {q.aiGenerated && (
                    <span style={css(`font-size:10.5px; font-weight:700; padding:3px 7px; border-radius:6px; color:${q.confColor}; background:${q.confTint}; border:1px solid ${q.confBorder}`)}>Confidence {q.confidence}</span>
                  )}
                  <span style={css("font-size:11px; color:#7A8492")}>source p.{q.page}</span>
                </div>
                <div style={css("font-size:15px; font-weight:600; color:#1A1D23; line-height:1.45; max-width:760px")}>{q.stem}</div>
                <div style={css("display:grid; gap:6px; margin-top:12px; max-width:760px")}>
                  {q.options.map((o, oi) => (
                    <div key={oi} style={css(`display:grid; grid-template-columns:24px 1fr; gap:10px; align-items:baseline; padding:8px 10px; border:1px solid ${o.border}; background:${o.bg}`)}>
                      <span style={css("font-family:'IBM Plex Mono',monospace; font-size:12px; color:#5A6472")}>{o.key}</span>
                      <span style={css("font-size:13.5px; color:#1A1D23; line-height:1.45")}>{o.text}</span>
                    </div>
                  ))}
                </div>
                <div style={css("font-size:12.5px; color:#5A6472; margin-top:10px; line-height:1.5; border-left:2px solid #DDE1E7; padding-left:10px; max-width:760px")}><strong style={css("color:#3B424E")}>Model rationale.</strong> {q.rationale}</div>
              </div>
              <div style={css("width:170px; display:grid; gap:7px")}>
                <div style={css(`font-size:11px; font-weight:700; letter-spacing:0.06em; text-transform:uppercase; color:${q.statusColor}`)}>{q.statusLabel}</div>
                <button onClick={q.approve} style={css(`font:inherit; font-size:13px; font-weight:700; cursor:pointer; padding:9px 12px; border:1px solid #166534; background:${q.approveBg}; color:${q.approveFg}; border-radius:8px`)}>Approve</button>
                <button onClick={q.edit} style={css("font:inherit; font-size:13px; font-weight:600; cursor:pointer; padding:9px 12px; border:1px solid #C9CFD8; background:#fff; color:#123E7C; border-radius:8px")}>Edit item</button>
                <button onClick={q.reject} style={css(`font:inherit; font-size:13px; font-weight:600; cursor:pointer; padding:9px 12px; border:1px solid #991B1B; background:${q.rejectBg}; color:${q.rejectFg}; border-radius:8px`)}>Reject</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
