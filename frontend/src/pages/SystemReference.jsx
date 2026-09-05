import { css } from "../lib/css";

export default function SystemReference() {
  return (
    <section style={css("padding:24px 0 0")}>
      <h1 style={css("font-family:'Poppins',sans-serif; font-size:28px; font-weight:700; color:#123E7C; margin:0 0 4px")}>Design reference</h1>
      <div style={css("font-size:13.5px; color:#5A6472; margin-bottom:20px; max-width:720px")}>The minimum set needed to build the rest of Kartavya consistently. GIGW 3.0 aligned; all foreground/background pairs meet WCAG AA at body sizes.</div>
      <div style={css("display:grid; grid-template-columns:repeat(auto-fit,minmax(min(100%,400px),1fr)); gap:20px")}>
        <div style={css("background:#fff; border:1px solid #E3E9F2; border-radius:12px; padding:22px 24px")}>
          <h2 style={css("font-family:'Poppins',sans-serif; font-size:19px; font-weight:700; color:#123E7C; margin:0 0 14px")}>Identity</h2>
          <div style={css("display:flex; gap:20px; align-items:center; flex-wrap:wrap; padding-bottom:18px; border-bottom:1px solid #EEF0F3")}>
            <div style={css("width:64px; height:64px; border-radius:50%; background:#123E7C; border:3px solid #F58220; display:flex; align-items:center; justify-content:center")}>
              <span style={css("font-family:'Noto Sans Devanagari',sans-serif; font-size:31px; font-weight:700; color:#fff; line-height:1; margin-top:2px")}>क</span>
            </div>
            <div>
              <div style={css("font-family:'Poppins',sans-serif; font-size:30px; font-weight:700; color:#123E7C; line-height:1.05")}>Kartavya</div>
              <div style={css("font-size:12px; color:#5A6472; margin-top:3px")}>Royal-blue roundel, saffron keyline, Devanagari क. Minimum 32px; never recoloured, never on a coloured field. Reversed (white roundel, navy glyph) on dark ground only.</div>
            </div>
          </div>
          <div style={css("font-size:12.5px; font-weight:700; color:#123E7C; margin:16px 0 8px")}>Tricolor — accent band only</div>
          <div style={css("display:flex; height:14px; border:1px solid #E3E9F2")}><div style={css("flex:1; background:#FF9933")}></div><div style={css("flex:1; background:#fff")}></div><div style={css("flex:1; background:#138808")}></div></div>
          <div style={css("font-size:12px; color:#7A8492; margin-top:7px")}>Permitted use: a 3px band beneath the utility bar. Never a background, button, chart or badge fill.</div>
        </div>
        <div style={css("background:#fff; border:1px solid #E3E9F2; border-radius:12px; padding:22px 24px")}>
          <h2 style={css("font-family:'Poppins',sans-serif; font-size:19px; font-weight:700; color:#123E7C; margin:0 0 6px")}>Domain colours — fixed meaning</h2>
          <div style={css("font-size:12.5px; color:#5A6472; margin-bottom:14px")}>One hue per competency domain, used identically in badges, gap-map axes, bars and heatmap headers.</div>
          <div style={css("display:grid; gap:10px")}>
            <div style={css("display:grid; grid-template-columns:14px 1fr auto auto; gap:12px; align-items:center; padding-bottom:10px; border-bottom:1px solid #EEF0F3")}>
              <span style={css("width:14px; height:14px; background:#1B5CB8")}></span><span style={css("font-size:13.5px; font-weight:600; color:#1A1D23")}>Statistical</span>
              <span style={css("font-size:10.5px; font-weight:700; padding:3px 7px; color:#1B5CB8; background:#E8F0FA; border:1px solid #B9CFEC")}>Badge</span>
              <span style={css("font-family:'IBM Plex Mono',monospace; font-size:11px; color:#7A8492")}>#1B5CB8</span>
            </div>
            <div style={css("display:grid; grid-template-columns:14px 1fr auto auto; gap:12px; align-items:center; padding-bottom:10px; border-bottom:1px solid #EEF0F3")}>
              <span style={css("width:14px; height:14px; background:#0F766E")}></span><span style={css("font-size:13.5px; font-weight:600; color:#1A1D23")}>Technical</span>
              <span style={css("font-size:10.5px; font-weight:700; padding:3px 7px; color:#0F766E; background:#E4F2F0; border:1px solid #B0D8D1")}>Badge</span>
              <span style={css("font-family:'IBM Plex Mono',monospace; font-size:11px; color:#7A8492")}>#0F766E</span>
            </div>
            <div style={css("display:grid; grid-template-columns:14px 1fr auto auto; gap:12px; align-items:center; padding-bottom:10px; border-bottom:1px solid #EEF0F3")}>
              <span style={css("width:14px; height:14px; background:#9D2449")}></span><span style={css("font-size:13.5px; font-weight:600; color:#1A1D23")}>Digital Governance</span>
              <span style={css("font-size:10.5px; font-weight:700; padding:3px 7px; color:#9D2449; background:#FBEAEE; border:1px solid #EDC3CE")}>Badge</span>
              <span style={css("font-family:'IBM Plex Mono',monospace; font-size:11px; color:#7A8492")}>#9D2449</span>
            </div>
            <div style={css("display:grid; grid-template-columns:14px 1fr auto auto; gap:12px; align-items:center")}>
              <span style={css("width:14px; height:14px; background:#15803D")}></span><span style={css("font-size:13.5px; font-weight:600; color:#1A1D23")}>Behavioural / Managerial</span>
              <span style={css("font-size:10.5px; font-weight:700; padding:3px 7px; color:#166534; background:#EBF5EE; border:1px solid #BBDEC7")}>Badge</span>
              <span style={css("font-family:'IBM Plex Mono',monospace; font-size:11px; color:#7A8492")}>#15803D</span>
            </div>
          </div>
          <div style={css("margin-top:18px; padding-top:16px; border-top:1px solid #EEF0F3")}>
            <div style={css("font-size:12.5px; font-weight:700; color:#123E7C; margin-bottom:10px")}>Source &amp; provenance chips</div>
            <div style={css("display:flex; gap:9px; flex-wrap:wrap")}>
              <span style={css("display:inline-flex; align-items:center; gap:6px; border:1px solid #B9CFEC; background:#E8F0FA; padding:4px 8px; font-size:11px; font-weight:700; color:#123E7C")}><span style={css("width:8px;height:8px;background:#1B5CB8")}></span>iGOT Karmayogi</span>
              <span style={css("display:inline-flex; align-items:center; gap:6px; border:1px solid #F3CFA6; background:#FDF0E1; padding:4px 8px; font-size:11px; font-weight:700; color:#9A4A0B")}><span style={css("width:8px;height:8px;background:#E9761B")}></span>NSSTA / TPAC</span>
              <span style={css("font-family:'IBM Plex Mono',monospace; font-size:9.5px; letter-spacing:0.06em; border:1px solid #C9CFD8; background:#F5F6F8; padding:3px 6px; color:#5A6472")}>AI-ASSISTED</span>
              <span style={css("font-family:'IBM Plex Mono',monospace; font-size:9.5px; letter-spacing:0.06em; border:1px solid #C9CFD8; background:#F5F6F8; padding:3px 6px; color:#5A6472")}>AI-EVALUATED</span>
              <span style={css("font-family:'IBM Plex Mono',monospace; font-size:9.5px; letter-spacing:0.06em; border:1px solid #C9CFD8; background:#F5F6F8; padding:3px 6px; color:#5A6472")}>AI-FORECAST</span>
            </div>
          </div>
        </div>
        <div style={css("background:#fff; border:1px solid #E3E9F2; border-radius:12px; padding:22px 24px")}>
          <h2 style={css("font-family:'Poppins',sans-serif; font-size:19px; font-weight:700; color:#123E7C; margin:0 0 14px")}>Type scale</h2>
          <div style={css("display:grid; gap:13px")}>
            <div style={css("display:grid; grid-template-columns:1fr 170px; gap:16px; align-items:baseline; padding-bottom:11px; border-bottom:1px solid #EEF0F3")}>
              <div style={css("font-family:'Poppins',sans-serif; font-size:40px; font-weight:700; color:#123E7C; line-height:1.05")}>Display 40/44</div>
              <div style={css("font-family:'IBM Plex Mono',monospace; font-size:11px; color:#7A8492")}>Source Serif 4 Bold · page titles</div>
            </div>
            <div style={css("display:grid; grid-template-columns:1fr 170px; gap:16px; align-items:baseline; padding-bottom:11px; border-bottom:1px solid #EEF0F3")}>
              <div style={css("font-family:'Poppins',sans-serif; font-size:28px; font-weight:700; color:#123E7C")}>Heading 28/34</div>
              <div style={css("font-family:'IBM Plex Mono',monospace; font-size:11px; color:#7A8492")}>Source Serif 4 Bold · sections</div>
            </div>
            <div style={css("display:grid; grid-template-columns:1fr 170px; gap:16px; align-items:baseline; padding-bottom:11px; border-bottom:1px solid #EEF0F3")}>
              <div style={css("font-family:'Poppins',sans-serif; font-size:20px; font-weight:700; color:#123E7C")}>Panel title 20/26</div>
              <div style={css("font-family:'IBM Plex Mono',monospace; font-size:11px; color:#7A8492")}>Source Serif 4 Bold · panels</div>
            </div>
            <div style={css("display:grid; grid-template-columns:1fr 170px; gap:16px; align-items:baseline; padding-bottom:11px; border-bottom:1px solid #EEF0F3")}>
              <div style={css("font-size:15px; color:#1A1D23; line-height:1.6")}>Body 15/24 — Noto Sans for prose, labels and card copy. Indic scripts fall back to Noto Sans Devanagari at identical metrics: <span style={css("font-family:'Noto Sans Devanagari',sans-serif")}>सांख्यिकीय क्षमता आकलन</span></div>
              <div style={css("font-family:'IBM Plex Mono',monospace; font-size:11px; color:#7A8492")}>Noto Sans Regular · body</div>
            </div>
            <div style={css("display:grid; grid-template-columns:1fr 170px; gap:16px; align-items:baseline")}>
              <div style={css("font-family:'IBM Plex Mono',monospace; font-size:15px; color:#1A1D23")}>1,240 · 3.34 · ISS-2016-0442</div>
              <div style={css("font-family:'IBM Plex Mono',monospace; font-size:11px; color:#7A8492")}>IBM Plex Mono · IDs &amp; figures</div>
            </div>
          </div>
        </div>
        <div style={css("background:#fff; border:1px solid #E3E9F2; border-radius:12px; padding:22px 24px")}>
          <h2 style={css("font-family:'Poppins',sans-serif; font-size:19px; font-weight:700; color:#123E7C; margin:0 0 14px")}>Components</h2>
          <div style={css("font-size:11px; font-weight:700; letter-spacing:0.09em; text-transform:uppercase; color:#7A8492; margin-bottom:9px")}>Buttons</div>
          <div style={css("display:flex; gap:10px; flex-wrap:wrap; margin-bottom:18px")}>
            <button style={css("font:inherit; font-size:13.5px; font-weight:700; cursor:pointer; padding:11px 16px; border:0; background:#123E7C; color:#fff; border-radius:8px")}>Primary</button>
            <button style={css("font:inherit; font-size:13.5px; font-weight:700; cursor:pointer; padding:11px 16px; border:1px solid #123E7C; background:#fff; color:#123E7C; border-radius:8px")}>Secondary</button>
            <button style={css("font:inherit; font-size:13.5px; font-weight:600; cursor:pointer; padding:11px 16px; border:1px solid #C9CFD8; background:#fff; color:#123E7C; border-radius:8px")}>Tertiary</button>
            <button style={css("font:inherit; font-size:13.5px; font-weight:700; cursor:pointer; padding:11px 16px; border:1px dashed #B9C4D2; background:#F7F9FC; color:#123E7C; border-radius:8px")}>Ghost / create</button>
          </div>
          <div style={css("font-size:11px; font-weight:700; letter-spacing:0.09em; text-transform:uppercase; color:#7A8492; margin-bottom:9px")}>Status chips</div>
          <div style={css("display:flex; gap:9px; flex-wrap:wrap; margin-bottom:18px")}>
            <span style={css("font-size:11px; font-weight:700; padding:4px 8px; color:#166534; background:#EBF5EE; border:1px solid #BBDEC7")}>Approved</span>
            <span style={css("font-size:11px; font-weight:700; padding:4px 8px; color:#9A3412; background:#FDF0E4; border:1px solid #EFCFAC")}>Pending review</span>
            <span style={css("font-size:11px; font-weight:700; padding:4px 8px; color:#991B1B; background:#FBECEC; border:1px solid #EBC4C4")}>Rejected</span>
            <span style={css("font-size:11px; font-weight:700; padding:4px 8px; color:#3B424E; background:#F1F3F6; border:1px solid #DDE1E7")}>Draft</span>
          </div>
          <div style={css("font-size:11px; font-weight:700; letter-spacing:0.09em; text-transform:uppercase; color:#7A8492; margin-bottom:9px")}>Course card anatomy</div>
          <div style={css("border:1px solid #E3E9F2; border-top:3px solid #1B5CB8; background:#FCFCFD; padding:16px; display:grid; gap:10px; max-width:330px")}>
            <div style={css("display:flex; justify-content:space-between; align-items:center; gap:8px; flex-wrap:wrap")}>
              <span style={css("display:inline-flex; align-items:center; gap:6px; border:1px solid #B9CFEC; background:#E8F0FA; padding:3px 7px; font-size:10.5px; font-weight:700; color:#123E7C")}><span style={css("width:7px;height:7px;background:#1B5CB8")}></span>iGOT Karmayogi</span>
              <span style={css("font-size:10.5px; font-weight:700; padding:3px 7px; color:#0F766E; background:#E4F2F0; border:1px solid #B0D8D1")}>Technical</span>
            </div>
            <div style={css("font-size:14.5px; font-weight:700; color:#123E7C; line-height:1.35")}>Source chip · domain chip · title · metadata · reason · action</div>
            <div style={css("display:flex; gap:8px; flex-wrap:wrap")}><span style={css("font-size:11px; color:#5A6472; border:1px solid #E4E7EC; background:#fff; padding:3px 7px")}>duration</span><span style={css("font-size:11px; color:#5A6472; border:1px solid #E4E7EC; background:#fff; padding:3px 7px")}>format</span></div>
            <div style={css("font-size:12.5px; line-height:1.5; color:#3B424E; border-left:2px solid #1B5CB8; padding-left:9px")}>Explainability line — appears only after assessment, and always names the specific gap the item closes.</div>
            <button style={css("font:inherit; font-size:13px; font-weight:700; cursor:pointer; padding:9px 12px; border:1px solid #123E7C; background:#fff; color:#123E7C; border-radius:8px")}>Enrol</button>
          </div>
        </div>
      </div>
    </section>
  );
}
