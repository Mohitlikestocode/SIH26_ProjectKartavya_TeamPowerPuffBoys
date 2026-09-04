import { Fragment } from "react";
import { css } from "../lib/css";

export default function AdminReports({ v }) {
  return (
    <section style={css("padding:24px 0 0")}>
      <h1 style={css("font-family:'Source Serif 4',serif; font-size:28px; font-weight:700; color:#0A2240; margin:0 0 4px")}>Reports</h1>
      <div style={css("font-size:13.5px; color:#5A6472; margin-bottom:20px")}>Standing and scheduled reports for cadre controlling authorities. All exports are watermarked and logged.</div>
      <div style={css("background:#fff; border:1px solid #D9DDE4")}>
        <div style={css("display:grid; grid-template-columns:minmax(220px,2fr) 1fr 1fr 1fr auto; gap:1px; background:#E4E7EC")}>
          <div style={css("background:#F7F8FA; padding:12px 16px; font-size:11px; font-weight:700; letter-spacing:0.05em; text-transform:uppercase; color:#7A8492")}>Report</div>
          <div style={css("background:#F7F8FA; padding:12px 16px; font-size:11px; font-weight:700; letter-spacing:0.05em; text-transform:uppercase; color:#7A8492")}>Period</div>
          <div style={css("background:#F7F8FA; padding:12px 16px; font-size:11px; font-weight:700; letter-spacing:0.05em; text-transform:uppercase; color:#7A8492")}>Owner</div>
          <div style={css("background:#F7F8FA; padding:12px 16px; font-size:11px; font-weight:700; letter-spacing:0.05em; text-transform:uppercase; color:#7A8492")}>Status</div>
          <div style={css("background:#F7F8FA; padding:12px 16px")}></div>
          {v.reports.map((r, i) => (
            <Fragment key={i}>
              <div style={css("background:#fff; padding:14px 16px; font-size:14px; font-weight:600; color:#0A2240")}>{r.name}</div>
              <div style={css("background:#fff; padding:14px 16px; font-size:13px; color:#5A6472")}>{r.period}</div>
              <div style={css("background:#fff; padding:14px 16px; font-size:13px; color:#5A6472")}>{r.owner}</div>
              <div style={css("background:#fff; padding:14px 16px; font-size:13px; color:#3B424E")}>{r.status}</div>
              <div style={css("background:#fff; padding:10px 16px; display:flex; align-items:center; gap:8px")}>
                <span style={css("font-family:'IBM Plex Mono',monospace; font-size:11px; color:#7A8492; white-space:nowrap")}>{r.format}</span>
                <button style={css("font:inherit; font-size:12.5px; font-weight:700; cursor:pointer; padding:8px 12px; border:1px solid #0A2240; background:#fff; color:#0A2240; border-radius:3px; white-space:nowrap")}>Download</button>
              </div>
            </Fragment>
          ))}
        </div>
      </div>
    </section>
  );
}
