import { Fragment } from "react";
import { css } from "../lib/css";

export default function AdminAnalytics({ v }) {
  return (
    <section style={css("padding:24px 0 0")}>
      <div style={css("display:flex; justify-content:space-between; align-items:flex-end; gap:20px; flex-wrap:wrap; margin-bottom:16px")}>
        <div>
          <h1 style={css("font-family:'Source Serif 4',serif; font-size:28px; font-weight:700; color:#0A2240; margin:0")}>Competency heatmap — Official Statistical System</h1>
          <div style={css("font-size:13.5px; color:#5A6472; margin-top:4px")}>18,442 profiles · assessment coverage 71% · framework: MoSPI Competency Directory v3.1</div>
        </div>
        <div style={css("display:flex; gap:10px; flex-wrap:wrap")}>
          <button style={css("font:inherit; font-size:13px; font-weight:600; cursor:pointer; padding:10px 14px; border:1px solid #C9CFD8; background:#fff; color:#0A2240; border-radius:3px")}>Export XLSX</button>
          <button style={css("font:inherit; font-size:13px; font-weight:700; cursor:pointer; padding:10px 14px; border:0; background:#0A2240; color:#fff; border-radius:3px")}>Schedule report</button>
        </div>
      </div>
      <div style={css("background:#fff; border:1px solid #D9DDE4; padding:12px 18px; display:flex; gap:18px; align-items:center; flex-wrap:wrap; margin-bottom:20px")}>
        <span style={css("font-size:10.5px; font-weight:700; letter-spacing:0.09em; text-transform:uppercase; color:#7A8492")}>Cohort</span>
        <div style={css("display:flex; gap:8px; align-items:center")}><span style={css("font-size:12.5px; color:#5A6472")}>Region</span><span style={css("font-size:13px; font-weight:600; color:#0A2240; border:1px solid #C9CFD8; padding:5px 10px; background:#FBFCFD")}>All India ▾</span></div>
        <div style={css("display:flex; gap:8px; align-items:center")}><span style={css("font-size:12.5px; color:#5A6472")}>Cadre</span><span style={css("font-size:13px; font-weight:600; color:#0A2240; border:1px solid #C9CFD8; padding:5px 10px; background:#FBFCFD")}>All cadres ▾</span></div>
        <div style={css("display:flex; gap:8px; align-items:center")}><span style={css("font-size:12.5px; color:#5A6472")}>Assessed</span><span style={css("font-size:13px; font-weight:600; color:#0A2240; border:1px solid #C9CFD8; padding:5px 10px; background:#FBFCFD")}>Last 12 months ▾</span></div>
        <span style={css("margin-left:auto; font-size:12px; color:#7A8492")}>Data as on 31 Aug 2026</span>
      </div>
      <div style={css("display:grid; grid-template-columns:repeat(auto-fit,minmax(400px,1fr)); gap:20px; align-items:start")}>
        <div style={css("background:#fff; border:1px solid #D9DDE4; padding:22px 24px; min-width:0")}>
          <div style={css("display:flex; justify-content:space-between; align-items:baseline; gap:12px; margin-bottom:16px; flex-wrap:wrap")}>
            <h2 style={css("font-family:'Source Serif 4',serif; font-size:20px; font-weight:700; color:#0A2240; margin:0")}>Cadre × domain gap severity</h2>
            <div style={css("display:flex; align-items:center; gap:8px")}>
              <span style={css("font-size:11.5px; color:#7A8492")}>Low</span>
              <div style={css("display:flex")}>
                <span style={css("width:20px; height:12px; background:#FDF4E7; border:1px solid #E4E7EC")}></span>
                <span style={css("width:20px; height:12px; background:#F8E1BE; border:1px solid #E4E7EC; border-left:0")}></span>
                <span style={css("width:20px; height:12px; background:#EFC086; border:1px solid #E4E7EC; border-left:0")}></span>
                <span style={css("width:20px; height:12px; background:#DC8F4C; border:1px solid #E4E7EC; border-left:0")}></span>
                <span style={css("width:20px; height:12px; background:#B0531F; border:1px solid #E4E7EC; border-left:0")}></span>
              </div>
              <span style={css("font-size:11.5px; color:#7A8492")}>Critical</span>
            </div>
          </div>
          <div style={css("display:grid; grid-template-columns:minmax(140px,190px) repeat(4,minmax(62px,1fr)); gap:1px; background:#E4E7EC; border:1px solid #E4E7EC")}>
            <div style={css("background:#F7F8FA; padding:11px 12px; font-size:11px; font-weight:700; letter-spacing:0.05em; text-transform:uppercase; color:#7A8492")}>Cadre / service</div>
            <div style={css("background:#F7F8FA; padding:11px 6px; text-align:center; font-size:11.5px; font-weight:700; color:#0E7490")}>Statistical</div>
            <div style={css("background:#F7F8FA; padding:11px 6px; text-align:center; font-size:11.5px; font-weight:700; color:#6D28D9")}>Technical</div>
            <div style={css("background:#F7F8FA; padding:11px 6px; text-align:center; font-size:11.5px; font-weight:700; color:#B45309")}>Digital Gov.</div>
            <div style={css("background:#F7F8FA; padding:11px 6px; text-align:center; font-size:11.5px; font-weight:700; color:#15803D")}>Behavioural</div>
            {v.heatRows.map((r, i) => (
              <Fragment key={i}>
                <div style={css("background:#fff; padding:13px 12px")}>
                  <div style={css("font-size:13.5px; font-weight:600; color:#1A1D23")}>{r.name}</div>
                  <div style={css("font-size:11.5px; color:#7A8492; margin-top:2px")}>{r.count} officials</div>
                </div>
                <div style={css(`padding:13px 6px; text-align:center; background:${r.c0bg}`)}><div style={css(`font-family:'IBM Plex Mono',monospace; font-size:15px; color:${r.c0fg}`)}>{r.c0}</div></div>
                <div style={css(`padding:13px 6px; text-align:center; background:${r.c1bg}`)}><div style={css(`font-family:'IBM Plex Mono',monospace; font-size:15px; color:${r.c1fg}`)}>{r.c1}</div></div>
                <div style={css(`padding:13px 6px; text-align:center; background:${r.c2bg}`)}><div style={css(`font-family:'IBM Plex Mono',monospace; font-size:15px; color:${r.c2fg}`)}>{r.c2}</div></div>
                <div style={css(`padding:13px 6px; text-align:center; background:${r.c3bg}`)}><div style={css(`font-family:'IBM Plex Mono',monospace; font-size:15px; color:${r.c3fg}`)}>{r.c3}</div></div>
              </Fragment>
            ))}
          </div>
          <div style={css("font-size:12px; color:#7A8492; margin-top:12px")}>Cell value = mean gap against role requirement, 0–5 scale. Click a cell to open the cohort roster.</div>
        </div>
        <div style={css("display:grid; gap:20px; min-width:0")}>
          <div style={css("background:#fff; border:1px solid #D9DDE4; padding:22px 24px")}>
            <h2 style={css("font-family:'Source Serif 4',serif; font-size:20px; font-weight:700; color:#0A2240; margin:0 0 3px")}>Training effectiveness</h2>
            <div style={css("font-size:12.5px; color:#5A6472; margin-bottom:16px")}>Mean competency lift 90 days post-completion</div>
            <div style={css("display:grid; gap:11px")}>
              {v.effect.map((e, i) => (
                <div key={i} style={css("display:grid; grid-template-columns:1fr 110px 50px; gap:12px; align-items:center")}>
                  <div style={css("min-width:0")}>
                    <div style={css("font-size:13px; font-weight:600; color:#1A1D23; line-height:1.3")}>{e.name}</div>
                    <div style={css("font-size:11px; color:#7A8492; margin-top:2px")}>{e.source} · {e.n} completions</div>
                  </div>
                  <div style={css("height:10px; background:#EEF0F3; border:1px solid #E4E7EC; position:relative")}><div style={css(`position:absolute; inset:0 auto 0 0; width:${e.pct}; background:${e.color}`)}></div></div>
                  <div style={css("font-family:'IBM Plex Mono',monospace; font-size:12.5px; color:#166534; text-align:right")}>+{e.lift}</div>
                </div>
              ))}
            </div>
          </div>
          <div style={css("background:#fff; border:1px solid #D9DDE4; padding:22px 24px")}>
            <div style={css("display:flex; justify-content:space-between; align-items:baseline; gap:10px; flex-wrap:wrap")}>
              <h2 style={css("font-family:'Source Serif 4',serif; font-size:20px; font-weight:700; color:#0A2240; margin:0 0 3px")}>Emerging skill requirements</h2>
              <span style={css("font-family:'IBM Plex Mono',monospace; font-size:9.5px; letter-spacing:0.06em; border:1px solid #C9CFD8; background:#F5F6F8; padding:2px 6px; color:#5A6472")}>AI-FORECAST</span>
            </div>
            <div style={css("font-size:12.5px; color:#5A6472; margin-bottom:14px")}>Projected demand shift over 24 months · model v2.3, reviewed by DIID</div>
            {v.emerging.map((m, i) => (
              <div key={i} style={css("display:grid; grid-template-columns:1fr auto auto; gap:12px; align-items:center; padding:10px 0; border-bottom:1px solid #EEF0F3")}>
                <div style={css("font-size:13.5px; font-weight:600; color:#1A1D23; min-width:0")}>{m.name}</div>
                <span style={css(`font-size:10.5px; font-weight:700; padding:3px 7px; border-radius:2px; color:${m.color}; background:${m.tint}; border:1px solid ${m.border}; white-space:nowrap`)}>{m.domain}</span>
                <div style={css("font-family:'IBM Plex Mono',monospace; font-size:12.5px; color:#9A3412; width:52px; text-align:right")}>{m.delta}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
