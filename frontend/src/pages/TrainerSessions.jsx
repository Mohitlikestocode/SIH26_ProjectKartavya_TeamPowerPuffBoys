import { css } from "../lib/css";

export default function TrainerSessions({ v }) {
  return (
    <section style={css("padding:24px 0 0")}>
      <h1 style={css("font-family:'Source Serif 4',serif; font-size:28px; font-weight:700; color:#0A2240; margin:0 0 4px")}>Sessions &amp; QR access</h1>
      <div style={css("font-size:13.5px; color:#5A6472; margin-bottom:20px")}>Project the code in your classroom. Participants join on their phones without prior enrolment.</div>
      <div style={css("display:grid; grid-template-columns:repeat(auto-fit,minmax(320px,1fr)); gap:20px; align-items:start")}>
        <div style={css("background:#fff; border:1px solid #D9DDE4; padding:24px; text-align:center")}>
          <div style={css("border:1px solid #D9DDE4; background:#fff; padding:16px; display:flex; justify-content:center")}>{v.qrLarge}</div>
          <div style={css("font-size:17px; font-weight:700; color:#0A2240; margin-top:14px")}>Sampling Methodology — Batch 41</div>
          <div style={css("font-size:12.5px; color:#5A6472; margin-top:3px")}>NSSTA Greater Noida · Room 2B</div>
          <div style={css("display:flex; gap:8px; margin-top:12px; flex-wrap:wrap; justify-content:center")}>
            <span style={css("font-family:'IBM Plex Mono',monospace; font-size:13px; font-weight:500; border:1px solid #C4D0E0; background:#EAF0F8; color:#14396B; padding:5px 10px")}>NSSTA-8841</span>
            <span style={css("font-size:11.5px; font-weight:600; border:1px solid #EFCFAC; background:#FDF0E4; color:#9A3412; padding:5px 10px")}>Expires 17:30 IST</span>
          </div>
          <div style={css("font-size:12.5px; color:#5A6472; margin-top:12px")}>18 of 32 participants joined</div>
        </div>
        <div style={css("background:#fff; border:1px solid #D9DDE4; padding:22px 24px")}>
          <h2 style={css("font-family:'Source Serif 4',serif; font-size:19px; font-weight:700; color:#0A2240; margin:0 0 12px")}>Live participation</h2>
          <div style={css("display:grid; gap:10px")}>
            <div style={css("display:grid; grid-template-columns:1fr auto; gap:10px; align-items:center; padding:10px 0; border-bottom:1px solid #EEF0F3")}>
              <div style={css("font-size:13.5px; color:#1A1D23")}>Joined</div><div style={css("font-family:'IBM Plex Mono',monospace; font-size:14px; color:#0A2240")}>18 / 32</div>
            </div>
            <div style={css("display:grid; grid-template-columns:1fr auto; gap:10px; align-items:center; padding:10px 0; border-bottom:1px solid #EEF0F3")}>
              <div style={css("font-size:13.5px; color:#1A1D23")}>Submitted</div><div style={css("font-family:'IBM Plex Mono',monospace; font-size:14px; color:#0A2240")}>6</div>
            </div>
            <div style={css("display:grid; grid-template-columns:1fr auto; gap:10px; align-items:center; padding:10px 0; border-bottom:1px solid #EEF0F3")}>
              <div style={css("font-size:13.5px; color:#1A1D23")}>Mean score so far</div><div style={css("font-family:'IBM Plex Mono',monospace; font-size:14px; color:#0A2240")}>71%</div>
            </div>
            <div style={css("display:grid; grid-template-columns:1fr auto; gap:10px; align-items:center; padding:10px 0")}>
              <div style={css("font-size:13.5px; color:#1A1D23")}>Weakest item</div><div style={css("font-family:'IBM Plex Mono',monospace; font-size:14px; color:#9A3412")}>Q04 · 34%</div>
            </div>
          </div>
          <button style={css("font:inherit; width:100%; font-size:13.5px; font-weight:700; cursor:pointer; padding:12px 16px; border:1px solid #0A2240; background:#fff; color:#0A2240; border-radius:3px; margin-top:14px")}>Close session &amp; publish results</button>
        </div>
        <div style={css("background:#fff; border:1px solid #D9DDE4; padding:22px 24px")}>
          <h2 style={css("font-family:'Source Serif 4',serif; font-size:19px; font-weight:700; color:#0A2240; margin:0 0 12px")}>Simulation templates</h2>
          <div style={css("display:grid; gap:9px")}>
            <div style={css("border:1px solid #DDE1E7; padding:12px; background:#FCFCFD")}>
              <div style={css("font-size:13.5px; font-weight:700; color:#0A2240")}>Data-quality investigation</div>
              <div style={css("font-size:12px; color:#7A8492; margin-top:3px")}>6 decision nodes · 3 outcomes</div>
            </div>
            <div style={css("border:1px solid #DDE1E7; padding:12px; background:#FCFCFD")}>
              <div style={css("font-size:13.5px; font-weight:700; color:#0A2240")}>Survey design trade-off</div>
              <div style={css("font-size:12px; color:#7A8492; margin-top:3px")}>8 decision nodes · budget constraint</div>
            </div>
            <div style={css("border:1px solid #DDE1E7; padding:12px; background:#FCFCFD")}>
              <div style={css("font-size:13.5px; font-weight:700; color:#0A2240")}>Release-calendar incident</div>
              <div style={css("font-size:12px; color:#7A8492; margin-top:3px")}>5 decision nodes · escalation path</div>
            </div>
            <button style={css("font:inherit; font-size:13px; font-weight:700; cursor:pointer; padding:10px 12px; border:1px dashed #B9C4D2; background:#F7F9FC; color:#0A2240; border-radius:3px")}>Build from blank canvas</button>
          </div>
        </div>
      </div>
    </section>
  );
}
