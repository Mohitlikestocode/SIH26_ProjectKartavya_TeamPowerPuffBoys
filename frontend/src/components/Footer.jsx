import { css } from "../lib/css";

export default function Footer({ v }) {
  return (
    <footer style={css("background:#0A2240; color:#B9C7DA")}>
      <div style={css("max-width:1500px; margin:0 auto; padding:40px 32px 20px; display:grid; grid-template-columns:repeat(auto-fit,minmax(200px,1fr)); gap:32px")}>
        <div>
          <div style={css("display:flex; align-items:center; gap:11px")}>
            <div style={css("width:38px; height:38px; border-radius:50%; background:#fff; border:2px solid #B08D2E; display:flex; align-items:center; justify-content:center")}>
              <span style={css("font-family:'Noto Sans Devanagari',sans-serif; font-size:19px; font-weight:700; color:#0A2240; line-height:1; margin-top:2px")}>क</span>
            </div>
            <span style={css("font-family:'Source Serif 4',serif; font-size:22px; font-weight:700; color:#fff")}>Kartavya</span>
          </div>
          <p style={css("font-size:12.5px; line-height:1.65; margin:12px 0 0; max-width:330px")}>
            AI-enabled competency and learning platform for the Official Statistical System. Content owned and maintained by the Data Informatics &amp; Innovation Division, Ministry of Statistics &amp; Programme Implementation, Government of India.
          </p>
          <div style={css("font-size:12px; color:#8FA3BE; margin-top:12px")}>Smart India Hackathon problem statement SIH26101.</div>
        </div>
        <div>
          <div style={css("font-size:11px; font-weight:700; letter-spacing:0.09em; text-transform:uppercase; color:#8FA3BE; margin-bottom:11px")}>Ministry</div>
          <div style={css("display:grid; gap:8px; font-size:12.5px")}>
            <a href="#main" style={css("color:#C6D2E2")}>MoSPI</a>
            <a href="#main" style={css("color:#C6D2E2")}>National Statistical Office</a>
            <a href="#main" style={css("color:#C6D2E2")}>NSSTA</a>
            <a href="#main" style={css("color:#C6D2E2")}>NDAP</a>
            <a href="#main" style={css("color:#C6D2E2")}>iGOT Karmayogi</a>
          </div>
        </div>
        <div>
          <div style={css("font-size:11px; font-weight:700; letter-spacing:0.09em; text-transform:uppercase; color:#8FA3BE; margin-bottom:11px")}>Platform</div>
          <div style={css("display:grid; gap:8px; font-size:12.5px; justify-items:start")}>
            <button onClick={v.goCatalogue} style={css("font:inherit; font-size:12.5px; cursor:pointer; padding:0; border:0; background:none; color:#C6D2E2; text-decoration:underline")}>Course catalogue</button>
            <a href="#main" style={css("color:#C6D2E2")}>Competency framework</a>
            <a href="#main" style={css("color:#C6D2E2")}>NSSTA training calendar</a>
            <a href="#main" style={css("color:#C6D2E2")}>Install as app (PWA)</a>
            <button onClick={v.goSystem} style={css("font:inherit; font-size:12.5px; cursor:pointer; padding:0; border:0; background:none; color:#C6D2E2; text-decoration:underline")}>Design reference</button>
          </div>
        </div>
        <div>
          <div style={css("font-size:11px; font-weight:700; letter-spacing:0.09em; text-transform:uppercase; color:#8FA3BE; margin-bottom:11px")}>Compliance</div>
          <div style={css("display:grid; gap:8px; font-size:12.5px")}>
            <a href="#main" style={css("color:#C6D2E2")}>Accessibility statement (GIGW 3.0)</a>
            <a href="#main" style={css("color:#C6D2E2")}>Terms of use</a>
            <a href="#main" style={css("color:#C6D2E2")}>Privacy policy</a>
            <a href="#main" style={css("color:#C6D2E2")}>DPDP notice</a>
            <a href="#main" style={css("color:#C6D2E2")}>RTI</a>
          </div>
        </div>
      </div>
      <div style={css("border-top:1px solid #1E3A5F")}>
        <div style={css("max-width:1500px; margin:0 auto; padding:14px 32px; display:flex; justify-content:space-between; gap:16px; flex-wrap:wrap; font-size:11.5px; color:#8FA3BE")}>
          <span>© 2026 Ministry of Statistics &amp; Programme Implementation, Government of India.</span>
          <span>Last updated: 4 September 2026 · v1.0 (pre-production) · Multilingual &amp; assistant layer: Sarvam AI</span>
        </div>
      </div>
    </footer>
  );
}
