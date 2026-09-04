import { css } from "../lib/css";

export default function TrainerUpload({ v }) {
  return (
    <section style={css("padding:24px 0 0")}>
      <h1 style={css("font-family:'Source Serif 4',serif; font-size:28px; font-weight:700; color:#0A2240; margin:0 0 4px")}>Upload material &amp; generate assessment items</h1>
      <div style={css("font-size:13.5px; color:#5A6472; margin-bottom:20px")}>Documents, presentations and lecture recordings are parsed, mapped to competency sub-skills, and turned into draft items for your review. Nothing publishes without your approval.</div>
      <div style={css("display:grid; grid-template-columns:repeat(auto-fit,minmax(340px,1fr)); gap:20px; align-items:start")}>
        <div style={css("background:#fff; border:1px solid #D9DDE4; padding:24px")}>
          <div style={css("border:2px dashed #B9C4D2; background:#F7F9FC; padding:34px 24px; text-align:center; border-radius:3px")}>
            <div style={css("font-size:15.5px; font-weight:700; color:#0A2240")}>Drop files here, or choose from your device</div>
            <div style={css("font-size:12.5px; color:#5A6472; margin-top:6px; line-height:1.5")}>PDF · PPTX · DOCX · MP4 · up to 500 MB per file. Hindi and regional-language material is supported.</div>
            <button style={css("font:inherit; font-size:13.5px; font-weight:700; cursor:pointer; padding:11px 18px; border:1px solid #0A2240; background:#fff; color:#0A2240; border-radius:3px; margin-top:16px")}>Choose files</button>
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
        <div style={css("background:#fff; border:1px solid #D9DDE4; padding:24px")}>
          <h2 style={css("font-family:'Source Serif 4',serif; font-size:19px; font-weight:700; color:#0A2240; margin:0 0 14px")}>Generation settings</h2>
          <div style={css("display:grid; gap:16px")}>
            <div>
              <label style={css("display:block; font-size:12.5px; font-weight:600; color:#3B424E; margin-bottom:6px")}>Number of items</label>
              <select style={css("width:100%; font:inherit; font-size:14px; padding:10px 12px; border:1px solid #C9CFD8; background:#fff; border-radius:2px")}>
                <option>14 items</option><option>20 items</option><option>30 items</option>
              </select>
            </div>
            <div>
              <label style={css("display:block; font-size:12.5px; font-weight:600; color:#3B424E; margin-bottom:6px")}>Item types</label>
              <div style={css("display:flex; gap:8px; flex-wrap:wrap")}>
                <span style={css("font-size:12px; font-weight:600; padding:6px 10px; border:1px solid #0A2240; background:#EAF0F8; color:#0A2240")}>MCQ</span>
                <span style={css("font-size:12px; font-weight:600; padding:6px 10px; border:1px solid #0A2240; background:#EAF0F8; color:#0A2240")}>Multiple response</span>
                <span style={css("font-size:12px; font-weight:600; padding:6px 10px; border:1px solid #C9CFD8; background:#fff; color:#5A6472")}>True / false</span>
                <span style={css("font-size:12px; font-weight:600; padding:6px 10px; border:1px solid #C9CFD8; background:#fff; color:#5A6472")}>Short answer</span>
              </div>
            </div>
            <div>
              <label style={css("display:block; font-size:12.5px; font-weight:600; color:#3B424E; margin-bottom:6px")}>Difficulty mix</label>
              <div style={css("display:flex; height:12px; border:1px solid #DDE1E7")}>
                <div style={css("width:30%; background:#BBDEC7")}></div><div style={css("width:45%; background:#EFC086")}></div><div style={css("width:25%; background:#DC8F4C")}></div>
              </div>
              <div style={css("display:flex; justify-content:space-between; font-size:11.5px; color:#7A8492; margin-top:5px")}><span>Easy 30%</span><span>Moderate 45%</span><span>Hard 25%</span></div>
            </div>
            <div>
              <label style={css("display:block; font-size:12.5px; font-weight:600; color:#3B424E; margin-bottom:6px")}>Output language</label>
              <select style={css("width:100%; font:inherit; font-size:14px; padding:10px 12px; border:1px solid #C9CFD8; background:#fff; border-radius:2px")}>
                <option>English</option><option>हिंदी (Hindi)</option><option>English + हिंदी (bilingual)</option>
              </select>
              <div style={css("font-size:11.5px; color:#7A8492; margin-top:5px")}>Generation and translation use the Sarvam sovereign LLM layer.</div>
            </div>
            <div style={css("background:#EEF1F6; border:1px solid #DDE1E7; padding:12px 14px; font-size:12.5px; color:#3B424E; line-height:1.55")}>
              Every generated item carries a confidence score and a source page reference. Items below 0.70 confidence are flagged for mandatory faculty review.
            </div>
            <button onClick={v.doGenerate} style={css("font:inherit; font-size:15px; font-weight:700; cursor:pointer; padding:14px 18px; border:0; background:#0A2240; color:#fff; border-radius:3px")}>Generate draft items</button>
          </div>
        </div>
      </div>
    </section>
  );
}
