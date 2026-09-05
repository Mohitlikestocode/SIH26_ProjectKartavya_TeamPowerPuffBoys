import { css } from "../lib/css";

export default function AssessmentsHub({ v }) {
  return (
    <section style={css("padding:24px 0 0")}>
      <h1 style={css("font-family:'Poppins',sans-serif; font-size:28px; font-weight:700; color:#123E7C; margin:0 0 4px")}>Assessments &amp; simulations</h1>
      <div style={css("font-size:13.5px; color:#5A6472; margin-bottom:20px")}>Your baseline, job simulations assigned by your controlling authority, and trainer-run quizzes you can join by QR.</div>
      <div style={css("display:grid; grid-template-columns:repeat(auto-fit,minmax(min(100%,360px),1fr)); gap:20px; align-items:start")}>
        <div style={css("display:grid; gap:14px")}>
          {v.assessed && (
            <div style={css("background:#fff; border:1px solid #E3E9F2; border-left:4px solid #166534; padding:18px 20px; display:flex; justify-content:space-between; gap:14px; align-items:center; flex-wrap:wrap")}>
              <div style={css("min-width:220px; flex:1")}>
                <div style={css("display:flex; gap:8px; align-items:center; margin-bottom:6px; flex-wrap:wrap")}>
                  <span style={css("font-size:10.5px; font-weight:700; padding:3px 7px; border-radius:6px; color:#166534; background:#EBF5EE; border:1px solid #BBDEC7")}>Completed</span>
                  <span style={css("font-size:11.5px; color:#7A8492")}>{v.assessedOn}</span>
                </div>
                <div style={css("font-size:15.5px; font-weight:700; color:#123E7C")}>Baseline competency assessment — {v.targetName}</div>
                <div style={css("font-size:12.5px; color:#5A6472; margin-top:4px; line-height:1.5")}>{v.itemTotal} items · mean assessed level {v.meanLevel} / 5. Feeds your gap map and learning path.</div>
              </div>
              <div style={css("display:grid; gap:8px")}>
                <button onClick={v.goReview} style={css("font:inherit; font-size:13.5px; font-weight:700; cursor:pointer; padding:11px 16px; border:0; background:#123E7C; color:#fff; border-radius:8px; white-space:nowrap")}>View feedback</button>
                <button onClick={v.retakeAssessment} style={css("font:inherit; font-size:13.5px; font-weight:600; cursor:pointer; padding:11px 16px; border:1px solid #C9CFD8; background:#fff; color:#123E7C; border-radius:8px; white-space:nowrap")}>Retake</button>
              </div>
            </div>
          )}
          {v.notAssessed && (
            <div style={css("background:#fff; border:1px solid #F58220; border-left:4px solid #F58220; padding:18px 20px; display:flex; justify-content:space-between; gap:14px; align-items:center; flex-wrap:wrap")}>
              <div style={css("min-width:220px; flex:1")}>
                <div style={css("display:flex; gap:8px; align-items:center; margin-bottom:6px; flex-wrap:wrap")}>
                  <span style={css("font-size:10.5px; font-weight:700; padding:3px 7px; border-radius:6px; color:#7A4A12; background:#FDF4E7; border:1px solid #EFCFAC")}>Not started</span>
                  <span style={css("font-size:11.5px; color:#7A8492")}>20 minutes · 8 items</span>
                </div>
                <div style={css("font-size:15.5px; font-weight:700; color:#123E7C")}>Baseline competency assessment — {v.targetName}</div>
                <div style={css("font-size:12.5px; color:#5A6472; margin-top:4px; line-height:1.5")}>MCQs, two job simulations and one written judgement question. Unlocks your gap map, ranked gaps and sequenced learning path.</div>
              </div>
              <button onClick={v.startAssessment} style={css("font:inherit; font-size:13.5px; font-weight:700; cursor:pointer; padding:12px 18px; border:0; background:#123E7C; color:#fff; border-radius:8px; white-space:nowrap")}>Start now</button>
            </div>
          )}
          <div style={css("background:#fff; border:1px solid #E3E9F2; padding:18px 20px; display:flex; justify-content:space-between; gap:14px; align-items:center; flex-wrap:wrap")}>
            <div style={css("min-width:220px; flex:1")}>
              <div style={css("display:flex; gap:8px; align-items:center; margin-bottom:6px; flex-wrap:wrap")}>
                <span style={css("font-size:10.5px; font-weight:700; padding:3px 7px; border-radius:6px; color:#1B5CB8; background:#E8F0FA; border:1px solid #B9CFEC")}>Statistical</span>
                <span style={css("font-size:10.5px; font-weight:700; padding:3px 7px; border-radius:6px; color:#9A3412; background:#FDF0E4; border:1px solid #EFCFAC")}>Branching simulation</span>
              </div>
              <div style={css("font-size:15.5px; font-weight:700; color:#123E7C")}>Household survey data-quality investigation</div>
              <div style={css("font-size:12.5px; color:#5A6472; margin-top:4px; line-height:1.5")}>A suspicious HCES schedule batch arrives from a field team. Decide what to verify, whom to escalate to, and whether to reject the block. 6 decision points · 35 min.</div>
            </div>
            <button style={css("font:inherit; font-size:13.5px; font-weight:700; cursor:pointer; padding:11px 16px; border:1px solid #123E7C; background:#fff; color:#123E7C; border-radius:8px; white-space:nowrap")}>Begin</button>
          </div>
          <div style={css("background:#fff; border:1px solid #E3E9F2; padding:18px 20px; display:flex; justify-content:space-between; gap:14px; align-items:center; flex-wrap:wrap")}>
            <div style={css("min-width:220px; flex:1")}>
              <div style={css("display:flex; gap:8px; align-items:center; margin-bottom:6px; flex-wrap:wrap")}>
                <span style={css("font-size:10.5px; font-weight:700; padding:3px 7px; border-radius:6px; color:#0F766E; background:#E4F2F0; border:1px solid #B0D8D1")}>Technical</span>
                <span style={css("font-size:10.5px; font-weight:700; padding:3px 7px; border-radius:6px; color:#3B424E; background:#F1F3F6; border:1px solid #DDE1E7")}>Adaptive · 24 items</span>
              </div>
              <div style={css("font-size:15.5px; font-weight:700; color:#123E7C")}>Python &amp; SQL for official statistics — level check</div>
              <div style={css("font-size:12.5px; color:#5A6472; margin-top:4px; line-height:1.5")}>Focused re-assessment of a single domain. Updates only the Technical axis of your gap map.</div>
            </div>
            <button style={css("font:inherit; font-size:13.5px; font-weight:600; cursor:pointer; padding:11px 16px; border:1px solid #123E7C; background:#fff; color:#123E7C; border-radius:8px; white-space:nowrap")}>Start</button>
          </div>
        </div>
        <div style={css("display:grid; gap:20px")}>
          <div style={css("background:#fff; border:1px dashed #B9C4D2; padding:22px; display:grid; gap:14px; justify-items:center; text-align:center")}>
            <div style={css("border:1px solid #E3E9F2; background:#fff; padding:8px")}>{v.qrSmall}</div>
            <div>
              <div style={css("font-size:15.5px; font-weight:700; color:#123E7C")}>Join a trainer-run session</div>
              <div style={css("font-size:12.5px; color:#5A6472; margin-top:4px; line-height:1.5")}>Scan the code displayed in your classroom, or enter the session code your trainer reads out.</div>
            </div>
            <div style={css("display:flex; gap:9px; flex-wrap:wrap; justify-content:center")}>
              <button onClick={v.openScanner} style={css("font:inherit; font-size:13.5px; font-weight:700; cursor:pointer; padding:11px 18px; border:0; background:#123E7C; color:#fff; border-radius:8px")}>Open scanner</button>
              <button onClick={v.openScanInfo} aria-label="How joining works" style={css("font:inherit; font-size:13.5px; font-weight:600; cursor:pointer; padding:11px 14px; border:1px solid #C9CFD8; background:#fff; color:#123E7C; border-radius:8px")}>How it works</button>
            </div>
          </div>
          <div style={css("background:#fff; border:1px solid #E3E9F2; border-radius:12px; padding:22px 24px")}>
            <h2 style={css("font-family:'Poppins',sans-serif; font-size:19px; font-weight:700; color:#123E7C; margin:0 0 3px")}>Recognition</h2>
            <div style={css("font-size:12.5px; color:#5A6472; margin-bottom:14px")}>Certificates and Karma Points synced from iGOT Karmayogi</div>
            {v.certs.map((c, i) => (
              <div key={i} style={css("display:grid; grid-template-columns:1fr auto; gap:12px; align-items:center; padding:10px 0; border-bottom:1px solid #EEF0F3")}>
                <div style={css("min-width:0")}>
                  <div style={css("font-size:13.5px; font-weight:600; color:#1A1D23; line-height:1.3")}>{c.title}</div>
                  <div style={css("font-size:11.5px; color:#7A8492; margin-top:2px")}>{c.meta}</div>
                </div>
                <div style={css("font-family:'IBM Plex Mono',monospace; font-size:11.5px; color:#166534; font-weight:500")}>+{c.points}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
