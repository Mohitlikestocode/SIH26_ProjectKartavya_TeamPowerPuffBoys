import { css } from "../lib/css";

const LANGS = [
  ["EN", "English"], ["HI", "हिंदी · Hindi"], ["BN", "বাংলা · Bengali"], ["MR", "मराठी · Marathi"],
  ["TA", "தமிழ் · Tamil"], ["TE", "తెలుగు · Telugu"], ["GU", "ગુજરાતી · Gujarati"], ["KN", "ಕನ್ನಡ · Kannada"],
  ["ML", "മലയാളം · Malayalam"], ["OR", "ଓଡ଼ିଆ · Odia"], ["PA", "ਪੰਜਾਬੀ · Punjabi"], ["AS", "অসমীয়া · Assamese"], ["UR", "اردو · Urdu"],
];

export default function PrefsPopover({ v }) {
  return (
    <>
      <div style={css("position:fixed; inset:0; z-index:64")} onClick={v.closePopovers}></div>
      <div role="dialog" aria-label="Language and accessibility" style={css("position:fixed; top:92px; right:24px; width:min(92vw,320px); background:#fff; border:1px solid #C9CFD8; box-shadow:0 10px 30px rgba(10,34,64,0.20); z-index:65; border-radius:4px; padding:18px")}>
        <div style={css("display:flex; justify-content:space-between; align-items:baseline; gap:12px; margin-bottom:14px")}>
          <div style={css("font-size:14.5px; font-weight:700; color:#0A2240")}>Language &amp; accessibility</div>
          <button onClick={v.closePopovers} aria-label="Close" style={css("font:inherit; font-size:12px; font-weight:700; cursor:pointer; padding:5px 9px; border:1px solid #C9CFD8; background:#fff; color:#0A2240; border-radius:3px")}>Close</button>
        </div>
        <label htmlFor="langSel" style={css("display:block; font-size:12px; font-weight:600; color:#3B424E; margin-bottom:6px")}>Language</label>
        <select id="langSel" onChange={v.onLangSelect} value={v.lang} style={css("width:100%; font:inherit; font-size:14px; padding:10px 11px; border:1px solid #C9CFD8; background:#fff; color:#1A1D23; border-radius:3px")}>
          {LANGS.map(([code, label]) => (
            <option key={code} value={code}>{label}</option>
          ))}
        </select>
        <div style={css("font-size:11.5px; color:#7A8492; margin-top:6px; line-height:1.5")}>Interface and course metadata are translated by the Sarvam sovereign LLM layer.</div>
        <div style={css("font-size:12px; font-weight:600; color:#3B424E; margin:16px 0 6px")}>Text size</div>
        <div style={css("display:flex")}>
          <button onClick={v.textDown} style={css(`font:inherit; flex:1; font-size:12.5px; font-weight:600; cursor:pointer; padding:10px 0; border:1px solid #C9CFD8; background:${v.sizeSmBg}; color:${v.sizeSmFg}; border-radius:3px 0 0 3px`)}>Small</button>
          <button onClick={v.textReset} style={css(`font:inherit; flex:1; font-size:13.5px; font-weight:600; cursor:pointer; padding:10px 0; border:1px solid #C9CFD8; border-left:0; background:${v.sizeMdBg}; color:${v.sizeMdFg}`)}>Normal</button>
          <button onClick={v.textUp} style={css(`font:inherit; flex:1; font-size:15px; font-weight:600; cursor:pointer; padding:10px 0; border:1px solid #C9CFD8; border-left:0; background:${v.sizeLgBg}; color:${v.sizeLgFg}; border-radius:0 3px 3px 0`)}>Large</button>
        </div>
        <div style={css("font-size:12px; font-weight:600; color:#3B424E; margin:16px 0 6px")}>Display</div>
        <button onClick={v.toggleContrast} style={css(`font:inherit; width:100%; font-size:13.5px; font-weight:700; cursor:pointer; padding:11px 14px; border:1px solid ${v.contrastBorder}; background:${v.contrastBtnBg}; color:${v.contrastBtnFg}; border-radius:3px`)}>High contrast · {v.contrastState}</button>
        <div style={css("font-size:11.5px; color:#7A8492; margin-top:12px; line-height:1.5")}>GIGW 3.0: screen-reader compatible, keyboard navigable, WCAG AA contrast. <a href="#main">Accessibility statement</a></div>
      </div>
    </>
  );
}
