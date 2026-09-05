import { css } from "../lib/css";

export default function TrainerUpload({ v }) {
  const uploading = v.uploadStatus === "uploading";
  const uploaded = v.uploadStatus === "uploaded" && v.uploadedDoc;
  const generating = v.generateStatus === "generating";
  const generated = v.generateStatus === "done" && v.generateResult;

  return (
    <section style={css("padding:24px 0 0")}>
      <h1 style={css("font-family:'Poppins',sans-serif; font-size:28px; font-weight:700; color:#123E7C; margin:0 0 4px")}>Upload material &amp; generate assessment items</h1>
      <div style={css("font-size:13.5px; color:#5A6472; margin-bottom:20px")}>Documents are parsed, chunked and turned into draft items for your review via the real Kartavya ingestion pipeline. Nothing publishes without your approval.</div>
      <div style={css("display:grid; grid-template-columns:repeat(auto-fit,minmax(min(100%,340px),1fr)); gap:20px; align-items:start")}>
        <div style={css("background:#fff; border:1px solid #E3E9F2; padding:24px")}>
          <div style={css("border:2px dashed #B9C4D2; background:#F7F9FC; padding:34px 24px; text-align:center; border-radius:8px")}>
            <div style={css("font-size:15.5px; font-weight:700; color:#123E7C")}>Choose a PDF, PPTX or DOCX file</div>
            <div style={css("font-size:12.5px; color:#5A6472; margin-top:6px; line-height:1.5")}>Up to 25 MB. Scanned/image-only pages are automatically routed through OCR.</div>
            <label style={css("display:inline-block; font:inherit; font-size:13.5px; font-weight:700; cursor:pointer; padding:11px 18px; border:1px solid #123E7C; background:#fff; color:#123E7C; border-radius:8px; margin-top:16px")}>
              Choose file
              <input
                type="file"
                accept=".pdf,.pptx,.docx"
                onChange={v.onFileChange}
                style={css("position:absolute; width:1px; height:1px; overflow:hidden; opacity:0")}
              />
            </label>
            {v.selectedFileName && (
              <div style={css("font-size:12.5px; color:#123E7C; margin-top:10px; font-weight:600")}>{v.selectedFileName}</div>
            )}
          </div>

          {v.selectedFileName && v.uploadStatus !== "uploaded" && (
            <button
              onClick={v.doUpload}
              disabled={!v.canUpload}
              style={css(`font:inherit; width:100%; font-size:14.5px; font-weight:700; cursor:${v.canUpload ? "pointer" : "not-allowed"}; padding:13px 18px; border:0; background:${v.canUpload ? "#F58220" : "#E4E7EC"}; color:${v.canUpload ? "#fff" : "#9AA3AF"}; border-radius:8px; margin-top:16px`)}
            >
              {uploading ? "Uploading & ingesting…" : "Upload document"}
            </button>
          )}

          {v.uploadStatus === "error" && (
            <div style={css("margin-top:14px; padding:12px 14px; border:1px solid #EBC4C4; background:#FBECEC; color:#991B1B; font-size:12.5px; border-radius:8px")}>
              Upload failed: {v.uploadError}
            </div>
          )}

          <div style={css("display:grid; gap:9px; margin-top:18px")}>
            {uploaded && (
              <div style={css("display:grid; grid-template-columns:1fr auto; gap:12px; align-items:center; border:1px solid #DDE1E7; background:#FCFCFD; padding:12px 14px")}>
                <div style={css("min-width:0")}>
                  <div style={css("font-size:13.5px; font-weight:600; color:#1A1D23")}>{v.uploadedDoc.originalFilename}</div>
                  <div style={css("font-size:11.5px; color:#7A8492; margin-top:2px")}>
                    {v.uploadedDoc.pageCount} pages · {v.uploadedDoc.chunks.length} chunks
                    {v.uploadedDoc.ocrFlaggedPages.length > 0 && ` · OCR used on page(s) ${v.uploadedDoc.ocrFlaggedPages.join(", ")}`}
                  </div>
                </div>
                <span style={css(`font-size:11px; font-weight:700; padding:4px 8px; border:1px solid; white-space:nowrap; ${v.uploadedDoc.status === "processed" ? "color:#166534; background:#EBF5EE; border-color:#BBDEC7" : "color:#9A3412; background:#FDF0E4; border-color:#EFCFAC"}`)}>
                  {v.uploadedDoc.status === "processed" ? "Ready" : v.uploadedDoc.status}
                </span>
              </div>
            )}
          </div>
        </div>

        <div style={css("background:#fff; border:1px solid #E3E9F2; padding:24px")}>
          <h2 style={css("font-family:'Poppins',sans-serif; font-size:19px; font-weight:700; color:#123E7C; margin:0 0 4px")}>Generation settings</h2>
          <div style={css("font-size:12.5px; color:#5A6C86; margin-bottom:16px")}>Generation is a starting point, not the only route — you can also write items yourself on the review screen.</div>
          <div style={css("display:grid; gap:18px")}>
            <div>
              <label htmlFor="genCourse" style={css("display:block; font-size:12.5px; font-weight:700; color:#123E7C; margin-bottom:6px")}>Map this question set to a course</label>
              <select id="genCourse" onChange={v.onGenCourse} value={v.genCourseIdx} style={css("width:100%; font:inherit; font-size:14px; padding:11px 12px; border:1px solid #C9D6E8; background:#fff; border-radius:8px")}>
                {v.courseOptions.map((c) => (
                  <option key={c.i} value={c.i}>{c.title}</option>
                ))}
              </select>
              <div style={css("font-size:11.5px; color:#5A6C86; margin-top:6px; line-height:1.5")}>Course mapping is a display label only for now — the backend doesn't yet link generated questions to a course.</div>
            </div>
            <div style={css("background:#F7F9FC; border:1px solid #DDE1E7; border-radius:8px; padding:12px 14px; font-size:12px; color:#7A8492; line-height:1.6")}>
              Item count, item types, difficulty mix and output language below aren't wired to the backend yet — real generation produces one MCQ per chunk for the whole document (English only), decided by validation, not a target count.
            </div>
            <div style={css("opacity:0.5; pointer-events:none")}>
              <label style={css("display:block; font-size:12.5px; font-weight:700; color:#123E7C; margin-bottom:6px")}>Number of items</label>
              <div style={css("display:flex; gap:8px; flex-wrap:wrap; align-items:center")}>
                <button style={css(`font:inherit; font-size:13px; font-weight:700; padding:9px 16px; border:1px solid #C9D6E8; background:${v.c10Bg}; color:${v.c10Fg}; border-radius:24px`)}>10</button>
                <button style={css(`font:inherit; font-size:13px; font-weight:700; padding:9px 16px; border:1px solid #C9D6E8; background:${v.c20Bg}; color:${v.c20Fg}; border-radius:24px`)}>20</button>
                <button style={css(`font:inherit; font-size:13px; font-weight:700; padding:9px 16px; border:1px solid #C9D6E8; background:${v.c30Bg}; color:${v.c30Fg}; border-radius:24px`)}>30</button>
              </div>
            </div>
            <div style={css("display:grid; gap:9px")}>
              <button
                onClick={v.doGenerate}
                disabled={!v.canGenerate}
                className={v.canGenerate ? "btn-accent" : undefined}
                style={css(`font:inherit; font-size:15px; font-weight:700; cursor:${v.canGenerate ? "pointer" : "not-allowed"}; padding:14px 18px; border:0; background:${v.canGenerate ? "#F58220" : "#E4E7EC"}; color:${v.canGenerate ? "#fff" : "#9AA3AF"}; border-radius:24px`)}
              >
                {generating ? "Generating… this can take several minutes for large documents" : "Generate draft items from this document"}
              </button>
              <button onClick={v.goStudio} style={css("font:inherit; font-size:14px; font-weight:700; cursor:pointer; padding:13px 18px; border:1.5px solid #123E7C; background:#fff; color:#123E7C; border-radius:24px")}>Skip generation — write items myself</button>
            </div>

            {v.generateStatus === "error" && (
              <div style={css("padding:12px 14px; border:1px solid #EBC4C4; background:#FBECEC; color:#991B1B; font-size:12.5px; border-radius:8px")}>
                Generation failed: {v.generateError}
              </div>
            )}

            {generated && (
              <div style={css("padding:14px 16px; border:1px solid #BBDEC7; background:#F4FAF6; border-radius:8px")}>
                <div style={css("font-size:13.5px; font-weight:700; color:#166534")}>
                  Generated {v.generateResult.generated} question(s)
                  {v.generateResult.failedChunkIds.length > 0 && ` · ${v.generateResult.failedChunkIds.length} chunk(s) failed validation`}
                </div>
                <div style={css("font-size:12px; color:#3B424E; margin-top:4px")}>Review them on the next screen before anything is approved.</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
