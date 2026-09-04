import { css } from "../lib/css";

export default function LearningPath({ v }) {
  return (
    <section style={css("padding:24px 0 0")}>
      {v.notAssessed && (
        <div style={css("background:#fff; border:1px solid #D9DDE4; padding:44px 40px; text-align:center; max-width:720px; margin:20px auto")}>
          <div style={css("width:52px; height:52px; border-radius:50%; background:#EAF0F8; border:1px solid #B9CCE5; margin:0 auto 16px; display:flex; align-items:center; justify-content:center; font-family:'IBM Plex Mono',monospace; font-size:18px; color:#14396B")}>?</div>
          <h1 style={css("font-family:'Source Serif 4',serif; font-size:26px; font-weight:700; color:#0A2240; margin:0 0 8px")}>Your learning path is not generated yet</h1>
          <p style={css("font-size:14.5px; line-height:1.6; color:#3B424E; margin:0 auto 20px; max-width:520px")}>A path is a sequence, not a list — it needs to know where you currently stand. Complete the baseline assessment and Kartavya will build three sequenced stages against your target role. Until then, the full catalogue is open to browse.</p>
          <div style={css("display:flex; gap:12px; justify-content:center; flex-wrap:wrap")}>
            <button onClick={v.startAssessment} style={css("font:inherit; font-size:15px; font-weight:700; cursor:pointer; padding:14px 22px; border:0; background:#0A2240; color:#fff; border-radius:3px")}>Start assessment · 20 min</button>
            <button onClick={v.goCatalogue} style={css("font:inherit; font-size:15px; font-weight:600; cursor:pointer; padding:14px 22px; border:1px solid #C9CFD8; background:#fff; color:#0A2240; border-radius:3px")}>Browse courses</button>
          </div>
        </div>
      )}
      {v.assessed && (
        <div>
          <div style={css("display:flex; justify-content:space-between; align-items:flex-end; gap:20px; flex-wrap:wrap; margin-bottom:18px")}>
            <div>
              <h1 style={css("font-family:'Source Serif 4',serif; font-size:28px; font-weight:700; color:#0A2240; margin:0")}>Your learning path</h1>
              <div style={css("font-size:13.5px; color:#5A6472; margin-top:4px")}>Three sequenced stages toward {v.targetName}. Each item names the gap it closes; later stages assume the earlier ones are done.</div>
            </div>
            <div style={css("display:flex; gap:8px; align-items:center; flex-wrap:wrap")}>
              <span style={css("display:inline-flex; align-items:center; gap:6px; border:1px solid #B9CCE5; background:#EAF0F8; padding:4px 8px; border-radius:2px; font-size:11px; font-weight:700; color:#14396B")}><span style={css("width:8px;height:8px;background:#1F5AA6")}></span>iGOT Karmayogi</span>
              <span style={css("display:inline-flex; align-items:center; gap:6px; border:1px solid #CDBDEC; background:#F2EDFB; padding:4px 8px; border-radius:2px; font-size:11px; font-weight:700; color:#4C1D95")}><span style={css("width:8px;height:8px;background:#6D28D9")}></span>NSSTA / TPAC</span>
              <span style={css("font-family:'IBM Plex Mono',monospace; font-size:9.5px; letter-spacing:0.06em; border:1px solid #C9CFD8; background:#F5F6F8; padding:3px 6px; color:#5A6472")}>AI-SEQUENCED</span>
            </div>
          </div>
          <div style={css("background:#fff; border:1px solid #D9DDE4; padding:20px 24px; margin-bottom:20px")}>
            <div style={css("display:grid; grid-template-columns:repeat(auto-fit,minmax(230px,1fr)); gap:20px; align-items:start")}>
              {v.stageHeads.map((s, i) => (
                <div key={i} style={css("display:grid; grid-template-columns:38px 1fr; gap:12px; align-items:start")}>
                  <div style={css(`width:38px; height:38px; border-radius:50%; background:${s.dotBg}; border:2px solid ${s.dotBorder}; color:${s.dotFg}; display:flex; align-items:center; justify-content:center; font-family:'IBM Plex Mono',monospace; font-size:13px`)}>{s.n}</div>
                  <div>
                    <div style={css("font-size:10.5px; font-weight:700; letter-spacing:0.08em; text-transform:uppercase; color:#7A8492")}>{s.phase}</div>
                    <div style={css("font-family:'Source Serif 4',serif; font-size:18px; font-weight:700; color:#0A2240; margin-top:2px; line-height:1.25")}>{s.title}</div>
                    <div style={css("font-size:12.5px; color:#5A6472; line-height:1.5; margin-top:4px")}>{s.note}</div>
                    <div style={css("font-family:'IBM Plex Mono',monospace; font-size:11.5px; color:#7A8492; margin-top:6px")}>{s.meta}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div style={css("display:grid; gap:20px")}>
            {v.stages.map((st, si) => (
              <div key={si} style={css(`background:#fff; border:1px solid #D9DDE4; border-left:4px solid ${st.accent}; padding:22px 24px`)}>
                <div style={css("display:flex; align-items:center; gap:12px; flex-wrap:wrap; padding-bottom:14px; border-bottom:1px solid #EEF0F3; margin-bottom:16px")}>
                  <span style={css(`width:30px; height:30px; border-radius:50%; background:${st.accent}; color:#fff; display:flex; align-items:center; justify-content:center; font-family:'IBM Plex Mono',monospace; font-size:12px`)}>{st.n}</span>
                  <div>
                    <div style={css("font-family:'Source Serif 4',serif; font-size:19px; font-weight:700; color:#0A2240; line-height:1.2")}>{st.title}</div>
                    <div style={css("font-size:12px; color:#7A8492; margin-top:2px")}>{st.gate}</div>
                  </div>
                </div>
                <div style={css("display:grid; grid-template-columns:repeat(auto-fit,minmax(300px,1fr)); gap:14px")}>
                  {st.items.map((it, ii) => (
                    <div key={ii} className="path-item" style={css(`border:1px solid #D9DDE4; border-top:3px solid ${it.srcColor}; background:#FCFCFD; padding:16px; display:flex; flex-direction:column; gap:10px`)}>
                      <div style={css("display:flex; justify-content:space-between; align-items:center; gap:8px; flex-wrap:wrap")}>
                        <span style={css(`display:inline-flex; align-items:center; gap:6px; border:1px solid ${it.srcBorder}; background:${it.srcTint}; padding:3px 7px; border-radius:2px; font-size:10.5px; font-weight:700; color:${it.srcFg}; white-space:nowrap`)}><span style={css(`width:7px;height:7px; background:${it.srcColor}`)}></span>{it.source}</span>
                        <span style={css("font-family:'IBM Plex Mono',monospace; font-size:10.5px; color:#7A8492")}>{it.match} match</span>
                      </div>
                      <div style={css("font-size:14.5px; font-weight:700; color:#0A2240; line-height:1.35")}>{it.title}</div>
                      <div style={css("display:flex; gap:8px; flex-wrap:wrap")}>
                        <span style={css("font-size:11px; color:#5A6472; border:1px solid #E4E7EC; background:#fff; padding:3px 7px")}>{it.duration}</span>
                        <span style={css("font-size:11px; color:#5A6472; border:1px solid #E4E7EC; background:#fff; padding:3px 7px")}>{it.format}</span>
                      </div>
                      <div style={css(`font-size:12.5px; line-height:1.5; color:#3B424E; border-left:2px solid ${it.srcColor}; padding-left:9px; margin-top:auto`)}>{it.why}</div>
                      <button className="path-item-cta" style={css("font:inherit; font-size:13px; font-weight:700; cursor:pointer; padding:9px 12px; border:1px solid #0A2240; background:#fff; color:#0A2240; border-radius:3px")}>{it.cta}</button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
