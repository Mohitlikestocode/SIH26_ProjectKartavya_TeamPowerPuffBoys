import { css } from "../lib/css";

export default function Assistant({ v }) {
  return (
    <div role="dialog" aria-label="AI assistant" style={css("position:fixed; right:20px; bottom:20px; width:min(94vw,400px); max-height:min(78vh,620px); background:#fff; border:1px solid #C9CFD8; box-shadow:0 12px 40px rgba(10,34,64,0.25); z-index:70; display:flex; flex-direction:column; border-radius:4px")}>
      <div style={css("background:#123E7C; color:#fff; padding:14px 16px; display:flex; justify-content:space-between; align-items:center; gap:12px; border-radius:8px 3px 0 0")}>
        <div>
          <div style={css("font-size:14.5px; font-weight:700")}>Kartavya assistant</div>
          <div style={css("font-size:11px; color:#B7CDEB")}>Multilingual · Sarvam sovereign LLM · answers cite platform data</div>
        </div>
        <button onClick={v.closeAssistant} aria-label="Close assistant" style={css("font:inherit; font-size:13px; font-weight:700; cursor:pointer; padding:7px 12px; border:1px solid #3C6BAE; background:transparent; color:#fff; border-radius:8px")}>Close</button>
      </div>
      <div style={css("flex:1; overflow:auto; padding:16px; display:grid; gap:14px; background:#F7F9FC")}>
        {v.assistLines.map((a, i) => (
          <div key={i}>
            <div style={css("background:#123E7C; color:#fff; padding:10px 12px; border-radius:8px 3px 0 3px; font-size:13.5px; line-height:1.5; margin-left:36px")}>{a.q}</div>
            <div style={css("display:flex; align-items:flex-start; gap:6px; margin-top:6px; margin-right:24px")}>
              <div style={css("flex:1; min-width:0; background:#fff; border:1px solid #DDE1E7; padding:11px 13px; border-radius:0 3px 3px 3px; font-size:13.5px; line-height:1.6; color:#1A1D23")}>{a.a}</div>
              <button
                onClick={a.onPlay}
                disabled={a.isPlaying}
                aria-label={a.isPlaying ? "Playing" : "Play this reply aloud"}
                title={a.isPlaying ? "Playing…" : "Play aloud"}
                style={css(`flex-shrink:0; font:inherit; font-size:13px; cursor:${a.isPlaying ? "default" : "pointer"}; padding:8px 9px; border:1px solid #DDE1E7; background:#fff; color:${a.isPlaying ? "#F58220" : "#123E7C"}; border-radius:6px; line-height:1`)}
              >{a.isPlaying ? "♪" : "▶"}</button>
            </div>
          </div>
        ))}
        <div style={css("display:flex; align-items:center; gap:8px; font-size:11.5px; color:#7A8492")}>
          <span style={css("font-family:'IBM Plex Mono',monospace; font-size:9.5px; letter-spacing:0.06em; border:1px solid #C9CFD8; background:#fff; padding:2px 6px")}>AI-ASSISTED</span>
          Answers are generated. Verify anything you will act on officially.
        </div>
        {v.assistBusy && (
          <div style={css("font-size:12.5px; color:#5A6472; font-style:italic")}>Thinking…</div>
        )}
        {v.assistError && (
          <div style={css("font-size:12.5px; color:#9A3412; background:#FDF0E4; border:1px solid #F3CFA6; padding:8px 10px; border-radius:6px")}>{v.assistError}</div>
        )}
      </div>
      <div style={css("padding:12px 14px; border-top:1px solid #DDE1E7; display:flex; gap:9px; align-items:center")}>
        <input
          type="text"
          placeholder="Ask in English or हिंदी…"
          value={v.assistInput}
          onChange={v.onAssistInput}
          onKeyDown={v.onAssistKeyDown}
          disabled={v.assistBusy}
          style={css("flex:1; min-width:0; font:inherit; font-size:14px; padding:11px 12px; border:1px solid #C9CFD8; border-radius:8px")}
        />
        <button
          onClick={v.onAssistVoiceToggle}
          disabled={v.assistTranscribing}
          aria-label={v.assistRecording ? "Stop recording" : "Speak your question"}
          style={css(`font:inherit; font-size:13px; font-weight:700; cursor:pointer; padding:11px 13px; border:1px solid ${v.assistRecording ? "#9A3412" : "#C9CFD8"}; background:${v.assistRecording ? "#FDF0E4" : "#fff"}; color:${v.assistRecording ? "#9A3412" : "#123E7C"}; border-radius:8px; white-space:nowrap`)}
        >{v.assistVoiceLabel}</button>
        <button
          onClick={v.onAssistSend}
          disabled={!v.canAssistSend}
          style={css(`font:inherit; font-size:13px; font-weight:700; cursor:${v.canAssistSend ? "pointer" : "default"}; padding:11px 15px; border:0; background:${v.canAssistSend ? "#123E7C" : "#9FB3CE"}; color:#fff; border-radius:8px`)}
        >Send</button>
      </div>
    </div>
  );
}
