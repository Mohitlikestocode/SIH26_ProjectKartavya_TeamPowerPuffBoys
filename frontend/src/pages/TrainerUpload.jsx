import { css } from "../lib/css";

export default function TrainerUpload({ v }) {
  return (
    <section style={css("padding:24px 0 0")}>
      <h1 style={css("font-family:'Poppins',sans-serif; font-size:28px; font-weight:700; color:#123E7C; margin:0 0 4px")}>Upload material &amp; generate assessment items</h1>
      <div style={css("font-size:13.5px; color:#5A6472; margin-bottom:20px")}>Documents, presentations and lecture recordings are parsed, mapped to competency sub-skills, and turned into draft items for your review. Nothing publishes without your approval.</div>
      <div style={css("display:grid; grid-template-columns:repeat(auto-fit,minmax(min(100%,340px),1fr)); gap:20px; align-items:start")}>
        <div style={css("background:#fff; border:1px solid #E3E9F2; padding:24px")}>
          <div style={css("border:2px dashed #B9C4D2; background:#F7F9FC; padding:34px 24px; text-align:center; border-radius:8px")}>
            <div style={css("font-size:15.5px; font-weight:700; color:#123E7C")}>Drop files here, or choose from your device</div>
            <div style={css("font-size:12.5px; color:#5A6472; margin-top:6px; line-height:1.5")}>PDF · PPTX · DOCX · MP4 · up to 500 MB per file. Hindi and regional-language material is supported.</div>
            <button style={css("font:inherit; font-size:13.5px; font-weight:700; cursor:pointer; padding:11px 18px; border:1px solid #123E7C; background:#fff; color:#123E7C; border-radius:8px; margin-top:16px")}>Choose files</button>
          </div>
          <div style={css("display:grid; gap:9px; margin-top:18px")}>
            <div style={css("display:grid; grid-template-columns:1fr auto; gap:12px; align-items:center; border:1px solid #DDE1E7; background:#FCFCFD; padding:12px 14px")}>
              <div style={css("min-width:0")}>
                <div style={css("font-size:13.5px; font-weight:600; color:#1A1D23")}>NSSTA_Sampling_Methodology_Module4.pdf</div>
                <div style={css("font-size:11.5px; color:#7A8492; margin-top:2px")}>62 pages · parsed · mapped to Statistical → Sampling methodology</div>
              </div>
              <span style={css("font-size:11px; font-weight:700; padding:4px 8px; color:#166534; background:#EBF5EE; border:1px solid #BBDEC7; white-space:nowrap")}>Ready</span>
            </div>
            <div style={css("display:grid; grid-template-columns:1fr auto; gap:12px; align-items:center; border:1px solid #DDE1E7; background:#FCFCFD; padding:12px 14px")}>
              <div style={css("min-width:0")}>
                <div style={css("font-size:13.5px; font-weight:600; color:#1A1D23")}>Estimation_Lecture_Batch41.mp4</div>
                <div style={css("font-size:11.5px; color:#7A8492; margin-top:2px")}>48 min · transcribing (Saaras STT) · 72%</div>
              </div>
              <span style={css("font-size:11px; font-weight:700; padding:4px 8px; color:#9A3412; background:#FDF0E4; border:1px solid #EFCFAC; white-space:nowrap")}>Processing</span>
            </div>
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
              <div style={css("font-size:11.5px; color:#5A6C86; margin-top:6px; line-height:1.5")}>Source: <strong style={css("color:#123E7C")}>{v.genCourseSrc}</strong>. Learners who take this course get these items as its quiz, and any session you run inherits the mapping.</div>
            </div>
            <div>
              <label style={css("display:block; font-size:12.5px; font-weight:700; color:#123E7C; margin-bottom:6px")}>Number of items</label>
              <div style={css("display:flex; gap:8px; flex-wrap:wrap; align-items:center")}>
                <button onClick={v.setCount10} style={css(`font:inherit; font-size:13px; font-weight:700; cursor:pointer; padding:9px 16px; border:1px solid #C9D6E8; background:${v.c10Bg}; color:${v.c10Fg}; border-radius:24px`)}>10</button>
                <button onClick={v.setCount20} style={css(`font:inherit; font-size:13px; font-weight:700; cursor:pointer; padding:9px 16px; border:1px solid #C9D6E8; background:${v.c20Bg}; color:${v.c20Fg}; border-radius:24px`)}>20</button>
                <button onClick={v.setCount30} style={css(`font:inherit; font-size:13px; font-weight:700; cursor:pointer; padding:9px 16px; border:1px solid #C9D6E8; background:${v.c30Bg}; color:${v.c30Fg}; border-radius:24px`)}>30</button>
                <span style={css("font-size:12.5px; color:#5A6C86")}>or type</span>
                <input type="text" inputMode="numeric" value={v.genCount} onChange={v.onGenCount} aria-label="Custom number of items" style={css("width:88px; font:inherit; font-size:14px; padding:9px 11px; border:1px solid #C9D6E8; border-radius:8px; text-align:center")} />
                <span style={css("font-size:12.5px; color:#5A6C86")}>items</span>
              </div>
            </div>
            <div>
              <label style={css("display:block; font-size:12.5px; font-weight:700; color:#123E7C; margin-bottom:6px")}>Item types</label>
              <div style={css("display:flex; gap:8px; flex-wrap:wrap")}>
                <span style={css("font-size:12px; font-weight:600; padding:7px 12px; border:1px solid #123E7C; background:#E8F0FA; color:#123E7C; border-radius:20px")}>MCQ</span>
                <span style={css("font-size:12px; font-weight:600; padding:7px 12px; border:1px solid #123E7C; background:#E8F0FA; color:#123E7C; border-radius:20px")}>Multiple response</span>
                <span style={css("font-size:12px; font-weight:600; padding:7px 12px; border:1px solid #C9D6E8; background:#fff; color:#5A6C86; border-radius:20px")}>True / false</span>
                <span style={css("font-size:12px; font-weight:600; padding:7px 12px; border:1px solid #C9D6E8; background:#fff; color:#5A6C86; border-radius:20px")}>Short answer</span>
                <span style={css("font-size:12px; font-weight:600; padding:7px 12px; border:1px solid #C9D6E8; background:#fff; color:#5A6C86; border-radius:20px")}>Scenario</span>
              </div>
            </div>
            <div>
              <label style={css("display:block; font-size:12.5px; font-weight:700; color:#123E7C; margin-bottom:6px")}>Difficulty mix</label>
              <div style={css("display:flex; height:12px; border-radius:6px; overflow:hidden; border:1px solid #E3E9F2")}>
                <div style={css("width:30%; background:#BBDEC7")}></div><div style={css("width:45%; background:#F9C089")}></div><div style={css("width:25%; background:#E9761B")}></div>
              </div>
              <div style={css("display:flex; justify-content:space-between; font-size:11.5px; color:#7A8AA3; margin-top:5px")}><span>Easy 30%</span><span>Moderate 45%</span><span>Hard 25%</span></div>
            </div>
            <div>
              <label htmlFor="genLang" style={css("display:block; font-size:12.5px; font-weight:700; color:#123E7C; margin-bottom:6px")}>Output language</label>
              <select id="genLang" onChange={v.onGenLang} value={v.genLang} style={css("width:100%; font:inherit; font-size:14px; padding:11px 12px; border:1px solid #C9D6E8; background:#fff; border-radius:8px")}>
                <option value="English">English</option>
                <option value="Hindi">हिंदी (Hindi)</option>
                <option value="Bilingual">English + हिंदी (bilingual)</option>
                <option value="Marathi">मराठी (Marathi)</option>
              </select>
              <div style={css("font-size:11.5px; color:#7A8AA3; margin-top:5px")}>Generation and translation use the Sarvam sovereign LLM layer.</div>
            </div>
            <div style={css("background:#F6FAFF; border:1px solid #B9CFEC; border-radius:10px; padding:12px 14px; font-size:12.5px; color:#41506B; line-height:1.55")}>
              Every generated item carries a confidence score and a source page reference. Items below 0.70 confidence are flagged for mandatory faculty review, and nothing publishes until you approve it.
            </div>
            <div style={css("display:grid; gap:9px")}>
              <button onClick={v.doGenerate} className="btn-accent" style={css("font:inherit; font-size:15px; font-weight:700; cursor:pointer; padding:14px 18px; border:0; background:#F58220; color:#fff; border-radius:24px")}>Generate {v.genCount} draft items</button>
              <button onClick={v.goStudio} style={css("font:inherit; font-size:14px; font-weight:700; cursor:pointer; padding:13px 18px; border:1.5px solid #123E7C; background:#fff; color:#123E7C; border-radius:24px")}>Skip generation — write items myself</button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
