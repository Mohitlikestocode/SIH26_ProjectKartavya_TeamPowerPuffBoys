import { useEffect, useState } from "react";
import { css } from "../lib/css";
import { checkHealth, API_BASE_URL } from "../lib/api";

const PARTNERS = [
  ["MoSPI", "MINISTRY OF STATISTICS"],
  ["iGOT", "KARMAYOGI BHARAT"],
  ["NSSTA", "TRAINING ACADEMY"],
  ["NDAP", "NATIONAL DATA PLATFORM"],
  ["Digital India", "POWER TO EMPOWER"],
];

export default function Footer({ v }) {
  // Step 1 of the frontend/backend integration: a real call to the backend, proven visibly
  // rather than just asserted. Not meant as permanent UX polish — a genuine connectivity check
  // that later steps (real fetches for questions/assessments/attempts) can build on.
  const [backendStatus, setBackendStatus] = useState("checking");
  useEffect(() => {
    let cancelled = false;
    checkHealth()
      .then(() => { if (!cancelled) setBackendStatus("ok"); })
      .catch(() => { if (!cancelled) setBackendStatus("unreachable"); });
    return () => { cancelled = true; };
  }, []);
  const backendLabel =
    backendStatus === "checking" ? `Checking backend at ${API_BASE_URL}…`
      : backendStatus === "ok" ? `Backend connected (${API_BASE_URL})`
      : `Backend unreachable (${API_BASE_URL})`;
  const backendColor = backendStatus === "ok" ? "#8FD6A8" : backendStatus === "unreachable" ? "#F3A6A6" : "#AFC6E6";

  return (
    <footer style={css("background:#123E7C; color:#D3E1F3")}>
      <div style={css("max-width:1500px; margin:0 auto; padding:40px 32px 20px; display:grid; grid-template-columns:repeat(auto-fit,minmax(min(100%,300px),1fr)); gap:32px")}>
        <div>
          <div style={css("display:flex; align-items:center; gap:11px")}>
            <div style={css("width:38px; height:38px; border-radius:50%; background:#fff; border:3px solid #F58220; display:flex; align-items:center; justify-content:center")}>
              <span style={css("font-family:'Noto Sans Devanagari',sans-serif; font-size:19px; font-weight:700; color:#123E7C; line-height:1; margin-top:2px")}>क</span>
            </div>
            <span style={css("font-family:'Poppins',sans-serif; font-size:22px; font-weight:700; color:#fff")}>Kartavya</span>
          </div>
          <p style={css("font-size:12.5px; line-height:1.65; margin:12px 0 0; max-width:330px")}>
            AI-enabled competency and learning platform for the Official Statistical System. Content owned and maintained by the Data Informatics &amp; Innovation Division, Ministry of Statistics &amp; Programme Implementation, Government of India.
          </p>
          <div style={css("font-size:12px; color:#AFC6E6; margin-top:12px")}>Smart India Hackathon problem statement SIH26101.</div>
        </div>
        <div>
          <div style={css("font-size:11px; font-weight:700; letter-spacing:0.09em; text-transform:uppercase; color:#AFC6E6; margin-bottom:11px")}>Ministry</div>
          <div style={css("display:grid; gap:8px; font-size:12.5px")}>
            <a href="#main" style={css("color:#DCE8F7")}>MoSPI</a>
            <a href="#main" style={css("color:#DCE8F7")}>National Statistical Office</a>
            <a href="#main" style={css("color:#DCE8F7")}>NSSTA</a>
            <a href="#main" style={css("color:#DCE8F7")}>NDAP</a>
            <a href="#main" style={css("color:#DCE8F7")}>iGOT Karmayogi</a>
          </div>
        </div>
        <div>
          <div style={css("font-size:11px; font-weight:700; letter-spacing:0.09em; text-transform:uppercase; color:#AFC6E6; margin-bottom:11px")}>Platform</div>
          <div style={css("display:grid; gap:8px; font-size:12.5px; justify-items:start")}>
            <button onClick={v.goCatalogue} style={css("font:inherit; font-size:12.5px; cursor:pointer; padding:0; border:0; background:none; color:#DCE8F7; text-decoration:underline")}>Course catalogue</button>
            <a href="#main" style={css("color:#DCE8F7")}>Competency framework</a>
            <a href="#main" style={css("color:#DCE8F7")}>NSSTA training calendar</a>
            <a href="#main" style={css("color:#DCE8F7")}>Install as app (PWA)</a>
            <button onClick={v.goSystem} style={css("font:inherit; font-size:12.5px; cursor:pointer; padding:0; border:0; background:none; color:#DCE8F7; text-decoration:underline")}>Design reference</button>
          </div>
        </div>
        <div>
          <div style={css("font-size:11px; font-weight:700; letter-spacing:0.09em; text-transform:uppercase; color:#AFC6E6; margin-bottom:11px")}>Compliance</div>
          <div style={css("display:grid; gap:8px; font-size:12.5px")}>
            <a href="#main" style={css("color:#DCE8F7")}>Accessibility statement (GIGW 3.0)</a>
            <a href="#main" style={css("color:#DCE8F7")}>Terms of use</a>
            <a href="#main" style={css("color:#DCE8F7")}>Privacy policy</a>
            <a href="#main" style={css("color:#DCE8F7")}>DPDP notice</a>
            <a href="#main" style={css("color:#DCE8F7")}>RTI</a>
          </div>
        </div>
      </div>
      <div style={css("max-width:1500px; margin:0 auto; padding:0 32px 24px")}>
        <div style={css("border-top:1px solid #2C5A9E; padding-top:20px; display:flex; align-items:center; gap:18px; flex-wrap:wrap")}>
          <span style={css("font-size:11px; font-weight:700; letter-spacing:0.08em; text-transform:uppercase; color:#AFC6E6")}>In partnership with</span>
          <div style={css("display:flex; gap:12px; flex-wrap:wrap")}>
            {PARTNERS.map(([name, sub], i) => (
              <div key={i} style={css("background:#fff; border-radius:10px; padding:9px 14px; text-align:center; min-width:104px")}>
                <div style={css("font-family:'Poppins',sans-serif; font-size:14px; font-weight:800; color:#123E7C; line-height:1.1")}>{name}</div>
                <div style={css("font-size:9px; color:#6B7A93; letter-spacing:0.04em; margin-top:2px")}>{sub}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div style={css("border-top:1px solid #2C5A9E")}>
        <div style={css("max-width:1500px; margin:0 auto; padding:14px 32px; display:flex; justify-content:space-between; gap:16px; flex-wrap:wrap; font-size:11.5px; color:#AFC6E6")}>
          <span>© 2026 Ministry of Statistics &amp; Programme Implementation, Government of India.</span>
          <span>Last updated: 4 September 2026 · v1.0 (pre-production) · Multilingual &amp; assistant layer: Sarvam AI</span>
          <span style={css(`color:${backendColor}; font-family:'IBM Plex Mono',monospace; font-size:10.5px`)}>{backendLabel}</span>
        </div>
      </div>
    </footer>
  );
}
