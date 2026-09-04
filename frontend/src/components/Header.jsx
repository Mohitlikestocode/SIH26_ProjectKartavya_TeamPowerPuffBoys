import { css } from "../lib/css";

export default function Header({ v }) {
  return (
    <header style={css("position:sticky; top:0; z-index:30; background:#fff; border-bottom:1px solid #D9DDE4; box-shadow:0 1px 4px rgba(10,34,64,0.10)")}>
      <div style={css("display:flex; height:3px")}>
        <div style={css("flex:1; background:#FF9933")}></div>
        <div style={css("flex:1; background:#FFFFFF")}></div>
        <div style={css("flex:1; background:#138808")}></div>
      </div>
      <div style={css("max-width:1500px; margin:0 auto; padding:11px 32px; min-height:80px; display:flex; align-items:center; gap:22px; flex-wrap:nowrap")}>
        <a href="#main" className="skip-link" style={css("position:absolute; left:-9999px; top:0")}>Skip to content</a>

        <button onClick={v.goHome} style={css("font:inherit; cursor:pointer; border:0; background:none; padding:0; display:flex; align-items:center; gap:14px; flex-shrink:0; text-align:left")}>
          <span style={css("width:48px; height:48px; border-radius:50%; background:#0A2240; border:2px solid #B08D2E; display:flex; align-items:center; justify-content:center; flex-shrink:0")}>
            <span style={css("font-family:'Noto Sans Devanagari',sans-serif; font-size:23px; font-weight:700; color:#fff; line-height:1; margin-top:2px")}>क</span>
          </span>
          <span>
            <span style={css("display:block; font-family:'Source Serif 4',Georgia,serif; font-size:25px; font-weight:700; color:#0A2240; letter-spacing:-0.015em; line-height:1.1; white-space:nowrap")}>Kartavya</span>
            <span style={css("display:block; font-size:10.5px; color:#5A6472; margin-top:2px; white-space:nowrap; letter-spacing:0.01em")}>Government of India · MoSPI</span>
          </span>
        </button>

        <nav aria-label="Primary" style={css("display:flex; align-items:center; gap:6px; flex-wrap:nowrap; flex:1 1 0%; min-width:0; overflow-x:auto")}>
          {v.navItems.map((n, i) => (
            <button
              key={i}
              className="nav-btn"
              onClick={n.go}
              style={css(`font:inherit; font-size:13.5px; font-weight:${n.weight}; cursor:pointer; white-space:nowrap; padding:11px 13px; border:0; background:${n.bg}; color:${n.fg}; border-radius:3px`)}
            >
              {n.label}
            </button>
          ))}
        </nav>

        <div style={css("display:flex; align-items:center; gap:10px; flex-shrink:0; flex-wrap:nowrap")}>
          <button
            onClick={v.togglePrefs}
            aria-label="Language and accessibility settings"
            title="Language & accessibility"
            style={css(`font:inherit; font-size:12.5px; font-weight:700; cursor:pointer; white-space:nowrap; height:38px; padding:0 12px; border:1px solid ${v.prefsBorder}; background:${v.prefsBg}; color:${v.prefsFg}; border-radius:3px`)}
          >
            {v.langShort} · A
          </button>

          {v.isAuthed && (
            <div style={css("display:flex; align-items:center; gap:10px; padding-left:12px; border-left:1px solid #DDE1E7; flex-wrap:nowrap")}>
              <button
                onClick={v.openAssistant}
                aria-label="Open the AI assistant"
                title="AI assistant"
                style={css("font:inherit; font-size:12.5px; font-weight:700; cursor:pointer; white-space:nowrap; height:38px; padding:0 12px; border:1px solid #C9CFD8; background:#fff; color:#0A2240; border-radius:3px")}
              >
                AI
              </button>
              <button
                onClick={v.toggleAcct}
                aria-label="Account menu"
                title={v.userName}
                style={css(`font:inherit; cursor:pointer; width:38px; height:38px; border-radius:3px; border:1px solid ${v.acctBorder}; background:${v.roleColor}; color:#fff; display:flex; align-items:center; justify-content:center; font-size:13px; font-weight:700`)}
              >
                {v.initials}
              </button>
            </div>
          )}
          {v.isGuest && (
            <div style={css("display:flex; align-items:center; gap:10px; padding-left:12px; border-left:1px solid #DDE1E7; flex-wrap:nowrap")}>
              <button onClick={v.openScanner} style={css("font:inherit; font-size:13px; font-weight:600; cursor:pointer; white-space:nowrap; height:38px; padding:0 13px; border:1px solid #C9CFD8; background:#fff; color:#0A2240; border-radius:3px")}>
                Scan QR
              </button>
              <button onClick={v.goSignin} style={css("font:inherit; font-size:13.5px; font-weight:700; cursor:pointer; white-space:nowrap; height:38px; padding:0 18px; border:0; background:#0A2240; color:#fff; border-radius:3px")}>
                Sign in
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
