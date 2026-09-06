// Zero-dependency CSV export. Builds an RFC-4180-style CSV string from plain row
// arrays and triggers a browser download. The file opens directly in Excel and
// Google Sheets — no library, no format-mismatch warning (unlike a faked .xls).

const BOM = "﻿";

function cell(value) {
  const s = value === null || value === undefined ? "" : String(value);
  // Quote when the value contains a comma, quote, newline, or edge whitespace.
  return /[",\r\n]|^\s|\s$/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

function encodeRows(rows) {
  return rows.map((row) => row.map(cell).join(",")).join("\r\n");
}

// One flat table: `rows` is an array of arrays (first row is usually the header).
export function rowsToCsv(rows) {
  return encodeRows(rows);
}

// Several labelled blocks in one file — each `{ title?, rows }` is separated by a
// blank line, with the title (if given) on its own line above the block. Useful
// when a single screen shows more than one table and "export" means all of them.
export function sectionsToCsv(sections) {
  return sections
    .map((section) => {
      const lines = [];
      if (section.title) lines.push(cell(section.title));
      lines.push(encodeRows(section.rows));
      return lines.join("\r\n");
    })
    .join("\r\n\r\n");
}

// Triggers the download. A leading UTF-8 BOM makes Excel read ₹, ×, and accented
// names correctly instead of mojibake.
export function downloadCsv(filename, csv) {
  const blob = new Blob([BOM + csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename.endsWith(".csv") ? filename : `${filename}.csv`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  // Revoke on the next tick so the download has time to start (Safari).
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

// YYYY-MM-DD in local time, for filenames.
export function dateSlug(d = new Date()) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
