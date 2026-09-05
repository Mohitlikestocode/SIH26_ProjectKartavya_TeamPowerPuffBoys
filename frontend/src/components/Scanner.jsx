import { css } from "../lib/css";

export default function Scanner({ v }) {
  return (
    <div role="dialog" aria-label="Scan session QR code" style={css("position:fixed; inset:0; background:#101318; z-index:80; display:flex; flex-direction:column")}>
      <div style={css("display:flex; justify-content:space-between; align-items:center; gap:16px; padding:14px 20px; background:#123E7C; color:#fff; flex-wrap:wrap")}>
        <div style={css("display:flex; align-items:center; gap:11px")}>
          <span style={css("width:30px; height:30px; border-radius:50%; background:#fff; border:3px solid #F58220; display:flex; align-items:center; justify-content:center")}>
            <span style={css("font-family:'Noto Sans Devanagari',sans-serif; font-size:15px; font-weight:700; color:#123E7C; line-height:1; margin-top:1px")}>क</span>
          </span>
          <div>
            <div style={css("font-size:14.5px; font-weight:700")}>Scan session QR code</div>
            <div style={css("font-size:11.5px; color:#B7CDEB")}>Point your camera at the code shown by your trainer</div>
          </div>
        </div>
        <div style={css("display:flex; gap:9px; align-items:center")}>
          <button onClick={v.openScanInfo} aria-label="How joining works" style={css("font:inherit; width:34px; height:34px; cursor:pointer; border:1px solid #3C6BAE; background:transparent; color:#fff; border-radius:50%; font-size:14px; font-weight:700")}>i</button>
          <button onClick={v.closeScanner} style={css("font:inherit; font-size:13px; font-weight:700; cursor:pointer; padding:9px 15px; border:1px solid #3C6BAE; background:transparent; color:#fff; border-radius:8px")}>Cancel</button>
        </div>
      </div>
      <div style={css("flex:1; min-height:0; position:relative; display:flex; align-items:center; justify-content:center; overflow:hidden; background:#15181E")}>
        <div style={css("position:absolute; inset:0; background:repeating-linear-gradient(115deg,#191D24 0 22px,#15181E 22px 44px); opacity:0.9")}></div>
        <div style={css("position:relative; width:min(74vw,320px); max-width:80%; max-height:70%; aspect-ratio:1")}>
          <div style={css("position:absolute; inset:0; border:1px solid rgba(255,255,255,0.18)")}></div>
          <div style={css("position:absolute; top:0; left:0; width:44px; height:44px; border-top:4px solid #fff; border-left:4px solid #fff")}></div>
          <div style={css("position:absolute; top:0; right:0; width:44px; height:44px; border-top:4px solid #fff; border-right:4px solid #fff")}></div>
          <div style={css("position:absolute; bottom:0; left:0; width:44px; height:44px; border-bottom:4px solid #fff; border-left:4px solid #fff")}></div>
          <div style={css("position:absolute; bottom:0; right:0; width:44px; height:44px; border-bottom:4px solid #fff; border-right:4px solid #fff")}></div>
          <div style={css("position:absolute; left:6px; right:6px; top:50%; height:2px; background:#F58220; box-shadow:0 0 12px rgba(176,141,46,0.8)")}></div>
        </div>
        <div style={css("position:absolute; bottom:8px; left:0; right:0; text-align:center; color:#D6DCE5; font-size:12.5px")}>Hold steady · the code is detected automatically</div>
      </div>
      <div style={css("background:#fff; padding:18px 20px 22px")}>
        <div style={css("max-width:520px; margin:0 auto")}>
          <div style={css("display:flex; gap:10px; justify-content:center; margin-bottom:16px; flex-wrap:wrap")}>
            <button style={css("font:inherit; font-size:13px; font-weight:600; cursor:pointer; padding:10px 14px; border:1px solid #C9CFD8; background:#fff; color:#123E7C; border-radius:8px")}>Torch</button>
            <button style={css("font:inherit; font-size:13px; font-weight:600; cursor:pointer; padding:10px 14px; border:1px solid #C9CFD8; background:#fff; color:#123E7C; border-radius:8px")}>Switch camera</button>
            <button style={css("font:inherit; font-size:13px; font-weight:600; cursor:pointer; padding:10px 14px; border:1px solid #C9CFD8; background:#fff; color:#123E7C; border-radius:8px")}>Upload a photo of the code</button>
          </div>
          <div style={css("border-top:1px solid #EEF0F3; padding-top:16px")}>
            <label htmlFor="sessCode" style={css("display:block; font-size:12.5px; font-weight:600; color:#3B424E; margin-bottom:6px")}>No camera? Enter the session code your trainer reads out</label>
            <div style={css("display:flex; gap:9px; flex-wrap:wrap")}>
              <input id="sessCode" type="text" placeholder="e.g. NSSTA-8841" style={css("flex:1; min-width:180px; font:inherit; font-size:15px; letter-spacing:0.06em; padding:12px 13px; border:1px solid #C9CFD8; border-radius:8px")} />
              <button style={css("font:inherit; font-size:14px; font-weight:700; cursor:pointer; padding:12px 20px; border:0; background:#123E7C; color:#fff; border-radius:8px")}>Join session</button>
            </div>
            <div style={css("font-size:11.5px; color:#7A8492; margin-top:8px")}>Camera access is used only to read the code and is never recorded. You will sign in with Parichay before the assessment starts.</div>
          </div>
        </div>
      </div>
    </div>
  );
}
