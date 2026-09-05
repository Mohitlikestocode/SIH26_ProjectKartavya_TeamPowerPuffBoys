import { css } from "../lib/css";

export default function AssessmentsHub({ v }) {
  return (
    <section style={css("padding:24px 0 0")}>
      <h1 style={css("font-family:'Poppins',sans-serif; font-size:28px; font-weight:700; color:#123E7C; margin:0 0 4px")}>Assessments &amp; simulations</h1>
      <div style={css("font-size:13.5px; color:#5A6472; margin-bottom:20px")}>Your baseline, job simulations assigned by your controlling authority, and trainer-run quizzes you can join by QR.</div>
      <div style={css("display:grid; grid-template-columns:repeat(auto-fit,minmax(min(100%,360px),1fr)); gap:20px; align-items:start")}>
        <div style={css("display:grid; gap:14px")}>
          {v.diagCompleted && (
            <div style={css("background:#fff; border:1px solid #E3E9F2; border-left:4px solid #166534; padding:18px 20px; display:flex; justify-content:space-between; gap:14px; align-items:center; flex-wrap:wrap")}>
              <div style={css("min-width:220px; flex:1")}>
                <div style={css("display:flex; gap:8px; align-items:center; margin-bottom:6px; flex-wrap:wrap")}>
                  <span style={css("font-size:10.5px; font-weight:700; padding:3px 7px; border-radius:6px; color:#166534; background:#EBF5EE; border:1px solid #BBDEC7")}>Completed</span>
                </div>
                <div style={css("font-size:15.5px; font-weight:700; color:#123E7C")}>Baseline Diagnostic</div>
                <div style={css("font-size:12.5px; color:#5A6472; margin-top:4px; line-height:1.5")}>Score {v.diagScore}% {v.diagPassedLabel}</div>
              </div>
              <div style={css("display:grid; gap:8px")}>
                <button onClick={v.goReview} style={css("font:inherit; font-size:13.5px; font-weight:700; cursor:pointer; padding:11px 16px; border:0; background:#123E7C; color:#fff; border-radius:8px; white-space:nowrap")}>View feedback</button>
                <button onClick={v.startDiagnostic} style={css("font:inherit; font-size:13.5px; font-weight:600; cursor:pointer; padding:11px 16px; border:1px solid #C9CFD8; background:#fff; color:#123E7C; border-radius:8px; white-space:nowrap")}>Retake</button>
              </div>
            </div>
          )}
          {!v.diagCompleted && (
            <div style={css("background:#fff; border:1px solid #F58220; border-left:4px solid #F58220; padding:18px 20px; display:flex; justify-content:space-between; gap:14px; align-items:center; flex-wrap:wrap")}>
              <div style={css("min-width:220px; flex:1")}>
                <div style={css("display:flex; gap:8px; align-items:center; margin-bottom:6px; flex-wrap:wrap")}>
                  <span style={css("font-size:10.5px; font-weight:700; padding:3px 7px; border-radius:6px; color:#7A4A12; background:#FDF4E7; border:1px solid #EFCFAC")}>Not started</span>
                  <span style={css("font-size:11.5px; color:#7A8492")}>30 minutes · 8 items</span>
                </div>
                <div style={css("font-size:15.5px; font-weight:700; color:#123E7C")}>Baseline Diagnostic</div>
                <div style={css("font-size:12.5px; color:#5A6472; margin-top:4px; line-height:1.5")}>Onboarding MCQ set across all 4 competency domains.</div>
              </div>
              <button onClick={v.startDiagnostic} style={css("font:inherit; font-size:13.5px; font-weight:700; cursor:pointer; padding:12px 18px; border:0; background:#123E7C; color:#fff; border-radius:8px; white-space:nowrap")}>Start now</button>
            </div>
          )}
          {v.diagLoadError && (
            <div style={css("padding:12px 14px; border:1px solid #EBC4C4; background:#FBECEC; color:#991B1B; font-size:12.5px; border-radius:8px")}>Could not load the diagnostic assessment: {v.diagLoadError}</div>
          )}
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
