import { css } from "../lib/css";

export default function Catalogue({ v }) {
  return (
    <section style={css("padding:24px 0 0")}>
      <div style={css("display:flex; justify-content:space-between; align-items:flex-end; gap:20px; flex-wrap:wrap")}>
        <div>
          <h1 style={css("font-family:'Source Serif 4',serif; font-size:28px; font-weight:700; color:#0A2240; margin:0")}>Course catalogue</h1>
          <div style={css("font-size:13.5px; color:#5A6472; margin-top:4px")}>Every course from both sources, open to browse and enrol without any assessment. {v.courseCount} shown.</div>
        </div>
        <div style={css("display:flex; gap:8px; align-items:center; flex-wrap:wrap")}>
          <span style={css("display:inline-flex; align-items:center; gap:6px; border:1px solid #B9CCE5; background:#EAF0F8; padding:4px 8px; border-radius:2px; font-size:11px; font-weight:700; color:#14396B")}><span style={css("width:8px;height:8px;background:#1F5AA6")}></span>iGOT Karmayogi</span>
          <span style={css("display:inline-flex; align-items:center; gap:6px; border:1px solid #CDBDEC; background:#F2EDFB; padding:4px 8px; border-radius:2px; font-size:11px; font-weight:700; color:#4C1D95")}><span style={css("width:8px;height:8px;background:#6D28D9")}></span>NSSTA / TPAC</span>
        </div>
      </div>

      {v.notAssessed && (
        <div style={css("background:#FDF9F0; border:1px solid #EFCFAC; padding:14px 18px; margin-top:16px; display:flex; justify-content:space-between; gap:16px; align-items:center; flex-wrap:wrap")}>
          <div style={css("font-size:13.5px; color:#3B424E; line-height:1.55; flex:1; min-width:260px")}>You are browsing the full catalogue unranked. Take the 20-minute assessment and Kartavya will mark the courses that close <strong style={css("color:#0A2240")}>your</strong> gaps and sequence them into a path.</div>
          <button onClick={v.startAssessment} style={css("font:inherit; font-size:13.5px; font-weight:700; cursor:pointer; padding:11px 18px; border:0; background:#0A2240; color:#fff; border-radius:3px; white-space:nowrap")}>Take the assessment</button>
        </div>
      )}

      <div style={css("background:#fff; border:1px solid #D9DDE4; padding:14px 18px; margin-top:16px; display:flex; gap:20px; align-items:center; flex-wrap:wrap")}>
        <div style={css("display:flex; gap:8px; align-items:center; flex-wrap:wrap")}>
          <span style={css("font-size:10.5px; font-weight:700; letter-spacing:0.09em; text-transform:uppercase; color:#7A8492")}>Domain</span>
          <button onClick={v.setCatAll} style={css(`font:inherit; font-size:12.5px; font-weight:600; cursor:pointer; padding:7px 12px; border:1px solid ${v.catAllBorder}; background:${v.catAllBg}; color:${v.catAllFg}; border-radius:2px`)}>All</button>
          <button onClick={v.setCatS} style={css(`font:inherit; font-size:12.5px; font-weight:600; cursor:pointer; padding:7px 12px; border:1px solid ${v.catSBorder}; background:${v.catSBg}; color:${v.catSFg}; border-radius:2px`)}>Statistical</button>
          <button onClick={v.setCatT} style={css(`font:inherit; font-size:12.5px; font-weight:600; cursor:pointer; padding:7px 12px; border:1px solid ${v.catTBorder}; background:${v.catTBg}; color:${v.catTFg}; border-radius:2px`)}>Technical</button>
          <button onClick={v.setCatD} style={css(`font:inherit; font-size:12.5px; font-weight:600; cursor:pointer; padding:7px 12px; border:1px solid ${v.catDBorder}; background:${v.catDBg}; color:${v.catDFg}; border-radius:2px`)}>Digital Governance</button>
          <button onClick={v.setCatB} style={css(`font:inherit; font-size:12.5px; font-weight:600; cursor:pointer; padding:7px 12px; border:1px solid ${v.catBBorder}; background:${v.catBBg}; color:${v.catBFg}; border-radius:2px`)}>Behavioural</button>
        </div>
        <div style={css("display:flex; gap:8px; align-items:center; flex-wrap:wrap")}>
          <span style={css("font-size:10.5px; font-weight:700; letter-spacing:0.09em; text-transform:uppercase; color:#7A8492")}>Source</span>
          <button onClick={v.setSrcAll} style={css(`font:inherit; font-size:12.5px; font-weight:600; cursor:pointer; padding:7px 12px; border:1px solid ${v.srcAllBorder}; background:${v.srcAllBg}; color:${v.srcAllFg}; border-radius:2px`)}>Both</button>
          <button onClick={v.setSrcI} style={css(`font:inherit; font-size:12.5px; font-weight:600; cursor:pointer; padding:7px 12px; border:1px solid ${v.srcIBorder}; background:${v.srcIBg}; color:${v.srcIFg}; border-radius:2px`)}>iGOT</button>
          <button onClick={v.setSrcN} style={css(`font:inherit; font-size:12.5px; font-weight:600; cursor:pointer; padding:7px 12px; border:1px solid ${v.srcNBorder}; background:${v.srcNBg}; color:${v.srcNFg}; border-radius:2px`)}>NSSTA</button>
        </div>
      </div>

      <div style={css("display:grid; grid-template-columns:repeat(auto-fit,minmax(320px,1fr)); gap:16px; margin-top:16px")}>
        {v.courses.map((c, i) => (
          <div key={i} className="course-card" style={css(`background:#fff; border:1px solid ${c.cardBorder}; border-top:3px solid ${c.srcColor}; padding:18px; display:flex; flex-direction:column; gap:10px`)}>
            {c.recommended && (
              <div style={css("background:#EAF0F8; border:1px solid #B9CCE5; padding:8px 10px; font-size:12px; color:#14396B; line-height:1.45; display:flex; gap:8px; align-items:flex-start")}>
                <span style={css("font-family:'IBM Plex Mono',monospace; font-size:9px; letter-spacing:0.06em; border:1px solid #B9CCE5; background:#fff; padding:2px 5px; white-space:nowrap")}>FOR YOU</span>
                <span>{c.recNote}</span>
              </div>
            )}
            <div style={css("display:flex; justify-content:space-between; align-items:center; gap:8px; flex-wrap:wrap")}>
              <span style={css(`display:inline-flex; align-items:center; gap:6px; border:1px solid ${c.srcBorder}; background:${c.srcTint}; padding:3px 7px; border-radius:2px; font-size:10.5px; font-weight:700; color:${c.srcFg}; white-space:nowrap`)}><span style={css(`width:7px;height:7px; background:${c.srcColor}`)}></span>{c.source}</span>
              <span style={css(`font-size:10.5px; font-weight:700; padding:3px 7px; border-radius:2px; color:${c.domColor}; background:${c.domTint}; border:1px solid ${c.domBorder}; white-space:nowrap`)}>{c.domain}</span>
            </div>
            <div style={css("font-size:15px; font-weight:700; color:#0A2240; line-height:1.35")}>{c.title}</div>
            <div style={css("display:flex; gap:8px; flex-wrap:wrap")}>
              <span style={css("font-size:11px; color:#5A6472; border:1px solid #E4E7EC; background:#FCFCFD; padding:3px 7px")}>{c.duration}</span>
              <span style={css("font-size:11px; color:#5A6472; border:1px solid #E4E7EC; background:#FCFCFD; padding:3px 7px")}>{c.format}</span>
              <span style={css("font-size:11px; color:#5A6472; border:1px solid #E4E7EC; background:#FCFCFD; padding:3px 7px")}>{c.level}</span>
            </div>
            <div style={css("font-size:12px; color:#7A8492; line-height:1.5; margin-top:auto")}>{c.meta}</div>
            <button onClick={c.onCta} className="course-cta" style={css("font:inherit; font-size:13.5px; font-weight:700; cursor:pointer; padding:10px 14px; border:1px solid #0A2240; background:#fff; color:#0A2240; border-radius:3px")}>{c.cta}</button>
          </div>
        ))}
      </div>
    </section>
  );
}
