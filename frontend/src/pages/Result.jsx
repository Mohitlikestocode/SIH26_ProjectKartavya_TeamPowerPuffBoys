import { css } from "../lib/css";

export default function Result({ v }) {
  return (
    <section style={css("padding:24px 0 0; max-width:1100px; margin:0 auto")}>
      <div style={css("background:#fff; border:1px solid #E3E9F2; border-top:3px solid #166534; padding:24px 26px")}>
        <div style={css("display:flex; justify-content:space-between; gap:20px; align-items:flex-start; flex-wrap:wrap")}>
          <div>
            <div style={css("display:inline-flex; align-items:center; gap:8px; font-size:10.5px; font-weight:700; letter-spacing:0.08em; text-transform:uppercase; color:#166534; background:#EBF5EE; border:1px solid #BBDEC7; padding:3px 8px; border-radius:6px")}>Assessment complete</div>
            <h1 style={css("font-family:'Poppins',sans-serif; font-size:26px; font-weight:700; color:#123E7C; margin:10px 0 4px")}>Your results and instant feedback</h1>
            <div style={css("font-size:13.5px; color:#5A6472")}>Mean assessed level {v.meanLevel} / 5 · overall gap index {v.gapIndex} against {v.targetName}</div>
          </div>
          <div style={css("display:grid; gap:9px")}>
            <button onClick={v.goDash} style={css("font:inherit; font-size:14px; font-weight:700; cursor:pointer; padding:12px 20px; border:0; background:#123E7C; color:#fff; border-radius:8px; white-space:nowrap")}>See my gap map</button>
            <button onClick={v.goPath} style={css("font:inherit; font-size:14px; font-weight:600; cursor:pointer; padding:12px 20px; border:1px solid #C9CFD8; background:#fff; color:#123E7C; border-radius:8px; white-space:nowrap")}>Open my learning path</button>
          </div>
        </div>
        <div style={css("display:grid; grid-template-columns:repeat(auto-fit,minmax(min(100%,220px),1fr)); gap:12px; margin-top:18px; padding-top:18px; border-top:1px solid #EEF0F3")}>
          {v.domainCards.map((d, i) => (
            <div key={i} style={css("border:1px solid #E4E7EC; padding:11px 12px; background:#FCFCFD")}>
              <div style={css(`font-size:12px; font-weight:700; color:${d.color}`)}>{d.label}</div>
              <div style={css("display:flex; align-items:baseline; gap:6px; margin-top:4px")}>
                <span style={css("font-family:'IBM Plex Mono',monospace; font-size:17px; color:#123E7C")}>{d.cur}</span>
                <span style={css("font-size:11.5px; color:#7A8492")}>/ {d.req} required</span>
              </div>
              <div style={css(`font-size:11.5px; font-weight:600; color:${d.gapColor}; margin-top:3px`)}>{d.gapText}</div>
            </div>
          ))}
        </div>
      </div>
      <div style={css("display:flex; justify-content:space-between; align-items:baseline; gap:12px; margin:24px 0 12px; flex-wrap:wrap")}>
        <h2 style={css("font-family:'Poppins',sans-serif; font-size:21px; font-weight:700; color:#123E7C; margin:0")}>Item-by-item feedback</h2>
        <span style={css("font-family:'IBM Plex Mono',monospace; font-size:9.5px; letter-spacing:0.06em; border:1px solid #C9CFD8; background:#F5F6F8; padding:3px 6px; color:#5A6472")}>AI-EVALUATED · EXPLANATIONS REVIEWED BY NSSTA FACULTY</span>
      </div>
      <div style={css("display:grid; gap:12px")}>
        {v.review.map((r, i) => (
          <div key={i} style={css("background:#fff; border:1px solid #E3E9F2; padding:18px 20px")}>
            <div style={css("display:flex; gap:9px; align-items:center; flex-wrap:wrap; margin-bottom:9px")}>
              <span style={css("font-family:'IBM Plex Mono',monospace; font-size:11.5px; color:#7A8492")}>{r.no}</span>
              <span style={css(`font-size:10.5px; font-weight:700; padding:3px 7px; border-radius:6px; color:${r.domColor}; background:${r.domTint}; border:1px solid ${r.domBorder}`)}>{r.domain}</span>
              <span style={css("font-size:11.5px; color:#7A8492")}>{r.skill}</span>
              <span style={css(`margin-left:auto; font-size:11.5px; font-weight:700; padding:4px 9px; border-radius:6px; color:${r.verdictColor}; background:${r.verdictBg}`)}>{r.verdict}</span>
            </div>
            <div style={css("font-size:14.5px; font-weight:600; color:#1A1D23; line-height:1.45; max-width:820px")}>{r.stem}</div>
            <div style={css("display:grid; grid-template-columns:repeat(auto-fit,minmax(min(100%,260px),1fr)); gap:12px; margin-top:12px")}>
              <div style={css("border:1px solid #E4E7EC; background:#FCFCFD; padding:11px 13px")}>
                <div style={css("font-size:10.5px; font-weight:700; letter-spacing:0.07em; text-transform:uppercase; color:#7A8492")}>Your answer</div>
                <div style={css("font-size:13px; color:#1A1D23; line-height:1.5; margin-top:4px")}>{r.yours}</div>
              </div>
              <div style={css("border:1px solid #BBDEC7; background:#F4FAF6; padding:11px 13px")}>
                <div style={css("font-size:10.5px; font-weight:700; letter-spacing:0.07em; text-transform:uppercase; color:#166534")}>Best answer</div>
                <div style={css("font-size:13px; color:#1A1D23; line-height:1.5; margin-top:4px")}>{r.best}</div>
              </div>
            </div>
            <div style={css("font-size:13px; color:#3B424E; line-height:1.6; margin-top:12px; border-left:2px solid #F58220; padding-left:12px; max-width:860px")}><strong style={css("color:#123E7C")}>Why.</strong> {r.explain}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
