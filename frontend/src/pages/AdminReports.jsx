import { Fragment } from "react";
import { css } from "../lib/css";
import { sectionsToCsv, downloadCsv, dateSlug } from "../lib/exportCsv";

// Maps a standing report to the on-hand dataset it summarises, so "Download"
// produces a spreadsheet with real content rather than just the row's metadata.
// Reports with no backing dataset yet still download (metadata + a note).
function datasetSection(name, v) {
  if (/gap summary/i.test(name)) {
    return {
      title: "Cadre x domain mean gap (0-5 scale)",
      rows: [
        ["Cadre / service", "Officials", "Statistical", "Technical", "Digital Governance", "Behavioural"],
        ...v.heatRows.map((r) => [r.name, r.count, r.c0, r.c1, r.c2, r.c3]),
      ],
    };
  }
  if (/effectiveness/i.test(name)) {
    return {
      title: "Mean competency lift 90 days post-completion",
      rows: [
        ["Programme", "Source", "Completions", "Mean lift", "Lift percentile"],
        ...v.effect.map((e) => [e.name, e.source, e.n, e.lift, e.pct]),
      ],
    };
  }
  if (/emerging/i.test(name)) {
    return {
      title: "Projected demand shift over 24 months",
      rows: [
        ["Skill", "Domain", "Projected demand shift"],
        ...v.emerging.map((m) => [m.name, m.domain, m.delta]),
      ],
    };
  }
  return { title: "", rows: [["Note", "Underlying dataset for this report is not wired yet."]] };
}

const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

export default function AdminReports({ v }) {
  const downloadReport = (r) => {
    const csv = sectionsToCsv([
      {
        title: "Report",
        rows: [
          ["Name", r.name],
          ["Period", r.period],
          ["Owner", r.owner],
          ["Status", r.status],
          ["Available formats", r.format],
          ["Generated", new Date().toLocaleString("en-IN")],
        ],
      },
      datasetSection(r.name, v),
    ]);
    downloadCsv(`${slug(r.name)}_${dateSlug()}`, csv);
  };

  return (
    <section style={css("padding:24px 0 0")}>
      <h1 style={css("font-family:'Poppins',sans-serif; font-size:28px; font-weight:700; color:#123E7C; margin:0 0 4px")}>Reports</h1>
      <div style={css("font-size:13.5px; color:#5A6472; margin-bottom:20px")}>Standing and scheduled reports for cadre controlling authorities. All exports are watermarked and logged.</div>
      <div style={css("background:#fff; border:1px solid #E3E9F2")}>
        <div style={css("overflow-x:auto")}>
          <div style={css("min-width:760px; display:grid; grid-template-columns:minmax(220px,2fr) 1fr 1fr 1fr auto; gap:1px; background:#E4E7EC")}>
            <div style={css("background:#F7F8FA; padding:12px 16px; font-size:11px; font-weight:700; letter-spacing:0.05em; text-transform:uppercase; color:#7A8492")}>Report</div>
            <div style={css("background:#F7F8FA; padding:12px 16px; font-size:11px; font-weight:700; letter-spacing:0.05em; text-transform:uppercase; color:#7A8492")}>Period</div>
            <div style={css("background:#F7F8FA; padding:12px 16px; font-size:11px; font-weight:700; letter-spacing:0.05em; text-transform:uppercase; color:#7A8492")}>Owner</div>
            <div style={css("background:#F7F8FA; padding:12px 16px; font-size:11px; font-weight:700; letter-spacing:0.05em; text-transform:uppercase; color:#7A8492")}>Status</div>
            <div style={css("background:#F7F8FA; padding:12px 16px")}></div>
            {v.reports.map((r, i) => (
              <Fragment key={i}>
                <div style={css("background:#fff; padding:14px 16px; font-size:14px; font-weight:600; color:#123E7C")}>{r.name}</div>
                <div style={css("background:#fff; padding:14px 16px; font-size:13px; color:#5A6472")}>{r.period}</div>
                <div style={css("background:#fff; padding:14px 16px; font-size:13px; color:#5A6472")}>{r.owner}</div>
                <div style={css("background:#fff; padding:14px 16px; font-size:13px; color:#3B424E")}>{r.status}</div>
                <div style={css("background:#fff; padding:10px 16px; display:flex; align-items:center; gap:8px")}>
                  <span style={css("font-family:'IBM Plex Mono',monospace; font-size:11px; color:#7A8492; white-space:nowrap")}>{r.format}</span>
                  <button onClick={() => downloadReport(r)} style={css("font:inherit; font-size:12.5px; font-weight:700; cursor:pointer; padding:8px 12px; border:1px solid #123E7C; background:#fff; color:#123E7C; border-radius:8px; white-space:nowrap")}>Download</button>
                </div>
              </Fragment>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
