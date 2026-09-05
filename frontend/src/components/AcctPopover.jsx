import { css } from "../lib/css";

export default function AcctPopover({ v }) {
  return (
    <>
      <div style={css("position:fixed; inset:0; z-index:64")} onClick={v.closePopovers}></div>
      <div role="dialog" aria-label="Account" style={css("position:fixed; top:92px; right:24px; width:min(92vw,300px); background:#fff; border:1px solid #C9CFD8; box-shadow:0 10px 30px rgba(10,34,64,0.20); z-index:65; border-radius:4px; padding:18px")}>
        <div style={css("display:flex; gap:12px; align-items:center")}>
          <div style={css(`width:40px; height:40px; border-radius:8px; background:${v.roleColor}; color:#fff; display:flex; align-items:center; justify-content:center; font-size:14px; font-weight:700; flex-shrink:0`)}>{v.initials}</div>
          <div style={css("min-width:0")}>
            <div style={css("font-size:14.5px; font-weight:700; color:#123E7C; line-height:1.3")}>{v.userName}</div>
            <div style={css("font-size:12px; color:#5A6472; line-height:1.4")}>{v.userDesig}</div>
          </div>
        </div>
        <div style={css("display:flex; gap:8px; align-items:center; margin-top:12px; flex-wrap:wrap")}>
          <span style={css("font-size:10.5px; font-weight:700; letter-spacing:0.05em; text-transform:uppercase; color:#123E7C; background:#E8F0FA; border:1px solid #B9CFEC; padding:3px 7px; border-radius:6px")}>{v.roleLabel}</span>
          <span style={css("font-family:'IBM Plex Mono',monospace; font-size:11px; color:#7A8492")}>{v.loginIdValue}</span>
        </div>
        <div style={css("border-top:1px solid #EEF0F3; margin:14px 0; padding-top:14px; display:grid; gap:8px; justify-items:start")}>
          <a href="#main" style={css("font-size:13px")}>My profile &amp; service record</a>
          <a href="#main" style={css("font-size:13px")}>Notification preferences</a>
          <a href="#main" style={css("font-size:13px")}>Help &amp; support</a>
        </div>
        <button onClick={v.signOut} style={css("font:inherit; width:100%; font-size:13.5px; font-weight:700; cursor:pointer; padding:11px 14px; border:1px solid #123E7C; background:#fff; color:#123E7C; border-radius:8px")}>Sign out</button>
        <div style={css("font-size:11.5px; color:#7A8492; margin-top:10px")}>Signed in via Parichay SSO · session expires after 45 minutes idle</div>
      </div>
    </>
  );
}
