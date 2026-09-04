import { css } from "../lib/css";

export default function ScanInfo({ v }) {
  return (
    <div role="dialog" aria-label="How joining a session works" style={css("position:fixed; inset:0; background:rgba(10,34,64,0.55); z-index:90; display:flex; align-items:center; justify-content:center; padding:24px")}>
      <div style={css("background:#fff; border:1px solid #C9CFD8; max-width:560px; width:100%; max-height:100%; overflow:auto")}>
        <div style={css("display:flex; justify-content:space-between; align-items:flex-start; gap:16px; padding:20px 22px 0")}>
          <div>
            <div style={css("font-size:10.5px; font-weight:700; letter-spacing:0.09em; text-transform:uppercase; color:#7A8492")}>Help</div>
            <h2 style={css("font-family:'Source Serif 4',serif; font-size:21px; font-weight:700; color:#0A2240; margin:5px 0 0")}>How joining a session works</h2>
          </div>
          <button onClick={v.closeScanInfo} aria-label="Close" style={css("font:inherit; font-size:13px; font-weight:700; cursor:pointer; padding:8px 13px; border:1px solid #C9CFD8; background:#fff; color:#0A2240; border-radius:3px")}>Close</button>
        </div>
        <div style={css("padding:16px 22px 22px")}>
          {v.flowSteps.map((f) => (
            <div key={f.n} style={css("display:grid; grid-template-columns:28px 1fr; gap:13px; padding:11px 0; border-bottom:1px solid #EEF0F3")}>
              <div style={css("width:28px; height:28px; border-radius:50%; border:1px solid #C4D0E0; background:#EAF0F8; color:#14396B; display:flex; align-items:center; justify-content:center; font-family:'IBM Plex Mono',monospace; font-size:12px")}>{f.n}</div>
              <div>
                <div style={css("font-size:14px; font-weight:600; color:#1A1D23")}>{f.title}</div>
                <div style={css("font-size:12.5px; color:#5A6472; margin-top:2px; line-height:1.5")}>{f.note}</div>
              </div>
            </div>
          ))}
          <button onClick={v.closeScanInfo} style={css("font:inherit; width:100%; font-size:14px; font-weight:700; cursor:pointer; padding:12px 16px; border:0; background:#0A2240; color:#fff; border-radius:3px; margin-top:16px")}>Got it</button>
        </div>
      </div>
    </div>
  );
}
