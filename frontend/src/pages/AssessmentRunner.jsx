import { css } from "../lib/css";

export default function AssessmentRunner({ v }) {
  return (
    <section style={css("padding:24px 0 0; max-width:1180px; margin:0 auto")}>
      <div style={css("display:flex; justify-content:space-between; align-items:flex-end; gap:16px; flex-wrap:wrap; margin-bottom:14px")}>
        <div>
          <span style={css("font-family:'IBM Plex Mono',monospace; font-size:11.5px; color:#7A8492")}>BASELINE COMPETENCY ASSESSMENT</span>
          <h1 style={css("font-family:'Source Serif 4',serif; font-size:24px; font-weight:700; color:#0A2240; margin:5px 0 0")}>Assessment for {v.targetName}</h1>
        </div>
        <div style={css("font-size:12.5px; color:#5A6472; text-align:right")}>Item {v.itemNo} of {v.itemTotal} · {v.answeredCount} answered<br />No time limit · progress saved on this device</div>
      </div>
      <div style={css("height:6px; background:#E4E7EC; margin-bottom:20px")}><div style={css(`height:100%; width:${v.runnerPct}; background:#0A2240`)}></div></div>
      <div style={css("display:grid; grid-template-columns:repeat(auto-fit,minmax(300px,1fr)); gap:20px; align-items:start")}>
        <div style={css(`background:#fff; border:1px solid #D9DDE4; border-top:3px solid ${v.itemColor}; padding:26px; min-width:0`)}>
          <div style={css("display:flex; gap:9px; align-items:center; flex-wrap:wrap; margin-bottom:14px")}>
            <span style={css(`font-size:10.5px; font-weight:700; padding:3px 8px; border-radius:2px; color:${v.itemColor}; background:${v.itemTint}; border:1px solid ${v.itemBorder}`)}>{v.itemDomain}</span>
            <span style={css("font-size:10.5px; font-weight:700; padding:3px 8px; border-radius:2px; color:#3B424E; background:#F1F3F6; border:1px solid #DDE1E7")}>{v.itemKind}</span>
            <span style={css("font-size:11.5px; color:#7A8492")}>{v.itemSkill}</span>
          </div>
          {v.hasContext && (
            <div style={css("background:#F7F9FC; border-left:3px solid #B08D2E; padding:14px 16px; font-size:13.5px; line-height:1.6; color:#3B424E; margin-bottom:16px")}>{v.itemContext}</div>
          )}
          <div style={css("font-family:'Source Serif 4',serif; font-size:20px; line-height:1.45; font-weight:600; color:#0A2240; margin-bottom:18px; text-wrap:pretty")}>{v.itemStem}</div>
          {v.isEssayItem && (
            <div>
              <textarea
                onChange={v.onEssay}
                value={v.essayText}
                placeholder="Write your response. Explain your reasoning and the order in which you would act."
                style={css("width:100%; min-height:190px; font:inherit; font-size:14.5px; line-height:1.6; padding:14px; border:1px solid #C9CFD8; border-radius:2px; resize:vertical")}
              ></textarea>
              <div style={css("display:flex; justify-content:space-between; gap:12px; margin-top:8px; font-size:12px; color:#7A8492; flex-wrap:wrap")}>
                <span>{v.essayWords} words · 120–250 recommended</span>
                <span style={css("display:inline-flex; align-items:center; gap:6px")}><span style={css("font-family:'IBM Plex Mono',monospace; font-size:9.5px; letter-spacing:0.06em; border:1px solid #C9CFD8; background:#F5F6F8; padding:2px 6px")}>AI-EVALUATED</span>reasoning, sequencing and statistical judgement</span>
              </div>
            </div>
          )}
          {v.isChoiceItem && (
            <div style={css("display:grid; gap:9px")}>
              {v.itemOptions.map((o, i) => (
                <button key={i} onClick={o.pick} style={css(`font:inherit; text-align:left; cursor:pointer; display:grid; grid-template-columns:30px 1fr; gap:12px; align-items:baseline; padding:14px 15px; border:${o.border}; background:${o.bg}; border-radius:2px`)}>
                  <span style={css(`font-family:'IBM Plex Mono',monospace; font-size:13px; color:${o.keyFg}; font-weight:500`)}>{o.key}</span>
                  <span style={css("font-size:14.5px; line-height:1.5; color:#1A1D23")}>{o.text}</span>
                </button>
              ))}
            </div>
          )}
          <div style={css("display:flex; justify-content:space-between; gap:12px; margin-top:24px; padding-top:18px; border-top:1px solid #EEF0F3; flex-wrap:wrap")}>
            <button onClick={v.prevItem} style={css("font:inherit; font-size:14px; font-weight:600; cursor:pointer; padding:12px 18px; border:1px solid #C9CFD8; background:#fff; color:#0A2240; border-radius:3px")}>Previous</button>
            {v.notLastItem && (
              <button onClick={v.nextItem} style={css("font:inherit; font-size:14px; font-weight:700; cursor:pointer; padding:12px 22px; border:0; background:#0A2240; color:#fff; border-radius:3px")}>Next item</button>
            )}
            {v.isLastItem && (
              <button onClick={v.submitAssessment} style={css("font:inherit; font-size:14px; font-weight:700; cursor:pointer; padding:12px 22px; border:0; background:#166534; color:#fff; border-radius:3px")}>Submit for evaluation</button>
            )}
          </div>
        </div>
        <div style={css("display:grid; gap:16px; max-width:340px")}>
          <div style={css("background:#fff; border:1px solid #D9DDE4; padding:18px 20px")}>
            <div style={css("font-size:10.5px; font-weight:700; letter-spacing:0.09em; text-transform:uppercase; color:#7A8492; margin-bottom:11px")}>Items</div>
            <div style={css("display:grid; gap:5px")}>
              {v.itemNav.map((i, idx) => (
                <button key={idx} onClick={i.go} style={css(`font:inherit; text-align:left; cursor:pointer; display:grid; grid-template-columns:26px 1fr 16px; gap:9px; align-items:center; padding:8px 9px; border:${i.border}; background:${i.bg}; border-radius:2px`)}>
                  <span style={css("font-family:'IBM Plex Mono',monospace; font-size:11.5px; color:#5A6472")}>{i.no}</span>
                  <span style={css(`font-size:12.5px; color:#1A1D23; font-weight:${i.weight}`)}>{i.label}</span>
                  <span style={css(`width:10px; height:10px; border-radius:50%; background:${i.dot}`)}></span>
                </button>
              ))}
            </div>
          </div>
          <div style={css("background:#EEF1F6; border:1px solid #DDE1E7; padding:16px 18px")}>
            <div style={css("font-size:12.5px; color:#3B424E; line-height:1.6")}>Eight items drawn from the responsibilities of <strong style={css("color:#0A2240")}>{v.targetName}</strong>: multiple choice, two job simulations and one written judgement question. Your answers are the only input to your gap map.</div>
          </div>
          <button onClick={v.goDash} style={css("font:inherit; font-size:13px; font-weight:600; cursor:pointer; padding:11px 14px; border:1px solid #C9CFD8; background:#fff; color:#0A2240; border-radius:3px")}>Save and exit</button>
        </div>
      </div>
    </section>
  );
}
