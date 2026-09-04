import { css } from "../lib/css";

export default function Assistant({ v }) {
  return (
    <div role="dialog" aria-label="AI assistant" style={css("position:fixed; right:20px; bottom:20px; width:min(94vw,400px); max-height:min(78vh,620px); background:#fff; border:1px solid #C9CFD8; box-shadow:0 12px 40px rgba(10,34,64,0.25); z-index:70; display:flex; flex-direction:column; border-radius:4px")}>
      <div style={css("background:#0A2240; color:#fff; padding:14px 16px; display:flex; justify-content:space-between; align-items:center; gap:12px; border-radius:3px 3px 0 0")}>
        <div>
          <div style={css("font-size:14.5px; font-weight:700")}>Kartavya assistant</div>
          <div style={css("font-size:11px; color:#9DB2CD")}>Multilingual · Sarvam sovereign LLM · answers cite platform data</div>
        </div>
        <button onClick={v.closeAssistant} aria-label="Close assistant" style={css("font:inherit; font-size:13px; font-weight:700; cursor:pointer; padding:7px 12px; border:1px solid #3A567C; background:transparent; color:#fff; border-radius:3px")}>Close</button>
      </div>
      <div style={css("flex:1; overflow:auto; padding:16px; display:grid; gap:14px; background:#F7F9FC")}>
        {v.assistLines.map((a, i) => (
          <div key={i}>
            <div style={css("background:#0A2240; color:#fff; padding:10px 12px; border-radius:3px 3px 0 3px; font-size:13.5px; line-height:1.5; margin-left:36px")}>{a.q}</div>
            <div style={css("background:#fff; border:1px solid #DDE1E7; padding:11px 13px; border-radius:0 3px 3px 3px; font-size:13.5px; line-height:1.6; color:#1A1D23; margin-right:24px; margin-top:6px")}>{a.a}</div>
          </div>
        ))}
        <div style={css("display:flex; align-items:center; gap:8px; font-size:11.5px; color:#7A8492")}>
          <span style={css("font-family:'IBM Plex Mono',monospace; font-size:9.5px; letter-spacing:0.06em; border:1px solid #C9CFD8; background:#fff; padding:2px 6px")}>AI-ASSISTED</span>
          Answers are generated. Verify anything you will act on officially.
        </div>
      </div>
      <div style={css("padding:12px 14px; border-top:1px solid #DDE1E7; display:flex; gap:9px; align-items:center")}>
        <input type="text" placeholder="Ask in English or हिंदी…" style={css("flex:1; min-width:0; font:inherit; font-size:14px; padding:11px 12px; border:1px solid #C9CFD8; border-radius:3px")} />
        <button aria-label="Speak your question" style={css("font:inherit; font-size:13px; font-weight:700; cursor:pointer; padding:11px 13px; border:1px solid #C9CFD8; background:#fff; color:#0A2240; border-radius:3px")}>Voice</button>
        <button style={css("font:inherit; font-size:13px; font-weight:700; cursor:pointer; padding:11px 15px; border:0; background:#0A2240; color:#fff; border-radius:3px")}>Send</button>
      </div>
    </div>
  );
}
