import { css } from "../lib/css";
import ImageSlot from "./ImageSlot";

export default function Header({ v }) {
  return (
    <>
      <div style={css("background:#fff; border-bottom:1px solid #E9DECF")}>
        <div style={css("max-width:1420px; margin:0 auto; padding:7px 30px; display:flex; align-items:center; justify-content:space-between; gap:10px 20px; flex-wrap:wrap")}>
          <div style={css("display:flex; align-items:center; gap:11px")}>
            <div style={css("display:flex; align-items:center; gap:9px; flex-shrink:0")}>
              <div style={css("width:34px; height:42px; background:#fff; border:1px dashed #B9CFEC; border-radius:5px; padding:2px; flex-shrink:0")}>
                <ImageSlot shape="rounded" radius={3} style={{ width: "100%", height: "100%", minWidth: 0 }} placeholder="Emblem" />
              </div>
              <div style={css("display:flex; height:26px; width:5px; flex-direction:column; border-radius:3px; overflow:hidden; flex-shrink:0")}>
                <div style={css("flex:1; background:#FF9933")}></div><div style={css("flex:1; background:#fff")}></div><div style={css("flex:1; background:#138808")}></div>
              </div>
            </div>
            <div>
              <div style={css("font-family:'Noto Sans Devanagari',sans-serif; font-size:11.5px; font-weight:600; color:#123E7C; line-height:1.25")}>भारत सरकार · सांख्यिकी और कार्यक्रम कार्यान्वयन मंत्रालय</div>
              <div style={css("font-size:11px; color:#6B7A93; line-height:1.25")}>Government of India · Ministry of Statistics &amp; Programme Implementation</div>
            </div>
          </div>
          <div style={css("display:flex; align-items:center; gap:14px; font-size:11px; color:#6B7A93; flex-wrap:wrap")}>
            <span>Last reviewed: 5 September 2026</span>
            <span style={css("opacity:0.4")}>|</span>
            <span>Visitors: <strong style={css("color:#123E7C; font-family:'IBM Plex Mono',monospace")}>42,18,907</strong></span>
            <span style={css("opacity:0.4")}>|</span>
            <a href="#main" style={css("font-size:11px")}>Screen reader access</a>
          </div>
        </div>
        <div style={css("display:flex; height:3px")}>
          <div style={css("flex:1; background:#FF9933")}></div>
          <div style={css("flex:1; background:#FFFFFF")}></div>
          <div style={css("flex:1; background:#138808")}></div>
        </div>
      </div>

      <div style={css("background:linear-gradient(#FDF1E3,#FDF6EE); position:sticky; top:0; z-index:30; padding:12px 24px 14px")}>
        <header style={css("max-width:1420px; margin:0 auto; background:#fff; border-radius:44px; box-shadow:0 6px 22px rgba(18,62,124,0.10); padding:10px 16px 10px 22px; display:flex; align-items:center; gap:18px; flex-wrap:nowrap")}>
          <a href="#main" className="skip-link" style={css("position:absolute; left:-9999px; top:0")}>Skip to content</a>

          <button onClick={v.goHome} style={css("font:inherit; cursor:pointer; border:0; background:none; padding:0; display:flex; align-items:center; gap:12px; flex-shrink:0; text-align:left")}>
            <span style={css("width:46px; height:46px; border-radius:50%; background:#123E7C; border:3px solid #F58220; display:flex; align-items:center; justify-content:center; flex-shrink:0")}>
              <span style={css("font-family:'Noto Sans Devanagari',sans-serif; font-size:22px; font-weight:700; color:#fff; line-height:1; margin-top:2px")}>क</span>
            </span>
            <span>
              <span style={css("display:block; font-family:'Poppins',sans-serif; font-size:23px; font-weight:700; color:#123E7C; line-height:1.1; white-space:nowrap")}>Kartavya</span>
              <span style={css("display:block; font-family:'Noto Sans Devanagari',sans-serif; font-size:11.5px; color:#C25E10; font-weight:600; margin-top:1px; white-space:nowrap")}>कर्तव्य</span>
            </span>
          </button>

          <nav aria-label="Primary" style={css("display:flex; align-items:center; gap:4px; flex-wrap:nowrap; flex:1 1 0%; min-width:0; overflow-x:auto; padding-left:8px")}>
            {v.navItems.map((n, i) => (
              <button
                key={i}
                className="nav-btn"
                onClick={n.go}
                style={css(`font:inherit; font-size:14px; font-weight:${n.weight}; cursor:pointer; white-space:nowrap; padding:9px 13px; border:0; border-bottom:3px solid ${n.underline}; background:transparent; color:${n.fg}`)}
              >
                {n.label}
              </button>
            ))}
          </nav>

          <div style={css("display:flex; align-items:center; gap:9px; flex-shrink:0; flex-wrap:nowrap")}>
            <button
              onClick={v.togglePrefs}
              aria-label="Language and accessibility settings"
              title="Language & accessibility"
              style={css(`font:inherit; font-size:12.5px; font-weight:700; cursor:pointer; white-space:nowrap; height:40px; padding:0 14px; border:1px solid ${v.prefsBorder}; background:${v.prefsBg}; color:${v.prefsFg}; border-radius:24px`)}
            >
              {v.langShort} · A
            </button>
            {v.isAuthed && (
              <div style={css("display:flex; align-items:center; gap:9px; flex-wrap:nowrap")}>
                <button
                  onClick={v.openAssistant}
                  aria-label="Open the AI assistant"
                  title="AI assistant"
                  style={css("font:inherit; font-size:12.5px; font-weight:700; cursor:pointer; white-space:nowrap; height:40px; padding:0 14px; border:1px solid #C9D6E8; background:#fff; color:#123E7C; border-radius:24px")}
                >
                  AI
                </button>
                <button
                  onClick={v.toggleAcct}
                  aria-label="Account menu"
                  title={v.userName}
                  style={css(`font:inherit; cursor:pointer; width:40px; height:40px; border-radius:50%; border:2px solid ${v.acctBorder}; background:${v.roleColor}; color:#fff; display:flex; align-items:center; justify-content:center; font-size:13px; font-weight:700`)}
                >
                  {v.initials}
                </button>
              </div>
            )}
            {v.isGuest && (
              <div style={css("display:flex; align-items:center; gap:9px; flex-wrap:nowrap")}>
                <button onClick={v.openScanner} style={css("font:inherit; font-size:13.5px; font-weight:600; cursor:pointer; white-space:nowrap; height:42px; padding:0 18px; border:1.5px solid #123E7C; background:#fff; color:#123E7C; border-radius:24px")}>
                  Scan QR
                </button>
                <button onClick={v.goSignin} className="btn-accent" style={css("font:inherit; font-size:13.5px; font-weight:700; cursor:pointer; white-space:nowrap; height:42px; padding:0 24px; border:0; background:#F58220; color:#fff; border-radius:24px")}>
                  Log in
                </button>
              </div>
            )}
          </div>
        </header>
      </div>
    </>
  );
}
