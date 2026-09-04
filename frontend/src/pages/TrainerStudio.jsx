import { css } from "../lib/css";

export default function TrainerStudio({ v }) {
  return (
    <section style={css("padding:24px 0 0")}>
      <div style={css("display:flex; justify-content:space-between; align-items:flex-end; gap:20px; flex-wrap:wrap; margin-bottom:18px")}>
        <div>
          <h1 style={css("font-family:'Source Serif 4',serif; font-size:28px; font-weight:700; color:#0A2240; margin:0")}>Review generated items</h1>
          <div style={css("font-size:13.5px; color:#5A6472; margin-top:4px")}>Source: <strong style={css("color:#0A2240")}>NSSTA_Sampling_Methodology_Module4.pdf</strong> · 62 pages · uploaded 3 Sep 2026, 14:12</div>
        </div>
        <div style={css("display:flex; gap:10px; flex-wrap:wrap")}>
          <button style={css("font:inherit; font-size:13.5px; font-weight:600; cursor:pointer; padding:11px 16px; border:1px solid #C9CFD8; background:#fff; color:#0A2240; border-radius:3px")}>Question bank (1,842)</button>
          <button style={css("font:inherit; font-size:13.5px; font-weight:700; cursor:pointer; padding:11px 16px; border:0; background:#0A2240; color:#fff; border-radius:3px")}>Publish {v.approvedCount} approved</button>
        </div>
      </div>
      <div style={css("background:#fff; border:1px solid #D9DDE4")}>
        <div style={css("padding:14px 22px; border-bottom:1px solid #DDE1E7; display:flex; justify-content:space-between; align-items:center; gap:14px; background:#FBFCFD; flex-wrap:wrap")}>
          <div style={css("display:flex; align-items:center; gap:12px; flex-wrap:wrap")}>
            <span style={css("font-family:'IBM Plex Mono',monospace; font-size:9.5px; letter-spacing:0.06em; border:1px solid #C9CFD8; background:#fff; padding:3px 6px; color:#5A6472")}>AI-GENERATED · UNPUBLISHED</span>
            <span style={css("font-size:13px; color:#3B424E")}>14 generated · <strong style={css("color:#0A2240")}>{v.approvedCount} approved</strong> · {v.rejectedCount} rejected · {v.pendingCount} pending</span>
          </div>
          <div style={css("font-size:12.5px; color:#7A8492")}>Nothing reaches learners until you approve it.</div>
        </div>
        {v.questions.map((q, i) => (
          <div key={i} style={css(`padding:20px 22px; border-bottom:1px solid #EEF0F3; background:${q.rowBg}`)}>
            <div style={css("display:flex; justify-content:space-between; gap:20px; align-items:flex-start; flex-wrap:wrap")}>
              <div style={css("flex:1; min-width:280px")}>
                <div style={css("display:flex; gap:8px; align-items:center; flex-wrap:wrap; margin-bottom:9px")}>
                  <span style={css("font-family:'IBM Plex Mono',monospace; font-size:11.5px; color:#7A8492")}>Q{q.no}</span>
                  <span style={css(`font-size:10.5px; font-weight:700; padding:3px 7px; border-radius:2px; color:${q.domColor}; background:${q.domTint}; border:1px solid ${q.domBorder}`)}>{q.domain}</span>
                  <span style={css("font-size:10.5px; font-weight:700; padding:3px 7px; border-radius:2px; color:#3B424E; background:#F1F3F6; border:1px solid #DDE1E7")}>{q.difficulty}</span>
                  <span style={css(`font-size:10.5px; font-weight:700; padding:3px 7px; border-radius:2px; color:${q.confColor}; background:${q.confTint}; border:1px solid ${q.confBorder}`)}>Confidence {q.confidence}</span>
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
                <button onClick={q.approve} style={css(`font:inherit; font-size:13px; font-weight:700; cursor:pointer; padding:9px 12px; border:1px solid #166534; background:${q.approveBg}; color:${q.approveFg}; border-radius:3px`)}>Approve</button>
                <button onClick={q.edit} style={css("font:inherit; font-size:13px; font-weight:600; cursor:pointer; padding:9px 12px; border:1px solid #C9CFD8; background:#fff; color:#0A2240; border-radius:3px")}>Edit item</button>
                <button onClick={q.reject} style={css(`font:inherit; font-size:13px; font-weight:600; cursor:pointer; padding:9px 12px; border:1px solid #991B1B; background:${q.rejectBg}; color:${q.rejectFg}; border-radius:3px`)}>Reject</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
