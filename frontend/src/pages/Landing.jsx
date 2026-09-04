import { css } from "../lib/css";

export default function Landing({ v }) {
  return (
    <section>
      <div style={css("display:grid; grid-template-columns:repeat(auto-fit,minmax(360px,1fr)); gap:40px; padding:52px 0 44px; align-items:start")}>
        <div>
          <div style={css("display:inline-flex; align-items:center; gap:8px; border:1px solid #C4D0E0; background:#EAF0F8; padding:5px 11px; border-radius:2px; font-size:11.5px; font-weight:600; color:#14396B")}>
            <span style={css("width:6px; height:6px; background:#138808; border-radius:50%")}></span>
            MoSPI · Data Informatics &amp; Innovation Division · SIH26101
          </div>
          <h1 style={css("font-family:'Source Serif 4',Georgia,serif; font-size:50px; line-height:1.08; font-weight:700; color:#0A2240; margin:22px 0 0; letter-spacing:-0.02em; text-wrap:balance")}>The learning platform for India's statistical workforce</h1>
          {v.isHindi && (
            <p style={css("font-family:'Noto Sans Devanagari',sans-serif; font-size:19px; color:#14396B; margin:14px 0 0; line-height:1.5")}>पाठ्यक्रम ब्राउज़ करें, क्षमता का आकलन करें, और अपने पद के अनुरूप व्यक्तिगत प्रशिक्षण मार्ग प्राप्त करें।</p>
          )}
          <p style={css("font-size:17.5px; line-height:1.62; color:#3B424E; max-width:660px; margin:18px 0 0; text-wrap:pretty")}>
            Browse and take courses from <strong style={css("color:#0A2240")}>iGOT Karmayogi</strong> and <strong style={css("color:#0A2240")}>NSSTA / TPAC</strong> in one place. Sit a competency assessment when you are ready, and Kartavya turns it into a ranked gap map and a sequenced learning path for the role you are working toward.
          </p>
          <div style={css("display:flex; align-items:center; gap:12px; margin-top:22px; padding:12px 14px; border:1px solid #DDE1E7; background:#fff; border-radius:2px; max-width:660px; flex-wrap:wrap")}>
            <span style={css("font-size:10.5px; font-weight:700; letter-spacing:0.08em; text-transform:uppercase; color:#0A2240; border:1px solid #C4D0E0; background:#EAF0F8; padding:3px 7px; border-radius:2px")}>Who it is for</span>
            <span style={css("font-size:13.5px; color:#3B424E")}>ISS · SSS · State DES staff · MoSPI / NSO officials. Not a general public course portal.</span>
          </div>
          <div style={css("display:flex; gap:12px; margin-top:24px; flex-wrap:wrap")}>
            <button onClick={v.goSignin} style={css("font:inherit; font-size:15px; font-weight:700; cursor:pointer; padding:14px 22px; border:0; background:#0A2240; color:#fff; border-radius:3px")}>Sign in</button>
            <button onClick={v.goCatalogue} style={css("font:inherit; font-size:15px; font-weight:700; cursor:pointer; padding:14px 22px; border:1px solid #0A2240; background:#fff; color:#0A2240; border-radius:3px")}>Browse the catalogue</button>
          </div>
          <div style={css("font-size:12.5px; color:#7A8492; margin-top:10px")}>Sign-in uses your Parichay / iGOT credentials. Attending a classroom session? Use <strong style={css("color:#3B424E")}>Scan session QR</strong> in the header.</div>
          <div style={css("display:grid; grid-template-columns:repeat(auto-fit,minmax(190px,1fr)); gap:1px; background:#DDE1E7; border:1px solid #DDE1E7; margin-top:32px; max-width:660px")}>
            <div style={css("background:#fff; padding:18px 20px")}>
              <div style={css("font-family:'Source Serif 4',serif; font-size:29px; font-weight:700; color:#0A2240")}>2,400+</div>
              <div style={css("font-size:12px; color:#5A6472; margin-top:2px; line-height:1.4")}>iGOT courses mapped to competencies</div>
            </div>
            <div style={css("background:#fff; padding:18px 20px")}>
              <div style={css("font-family:'Source Serif 4',serif; font-size:29px; font-weight:700; color:#0A2240")}>4 / 22</div>
              <div style={css("font-size:12px; color:#5A6472; margin-top:2px; line-height:1.4")}>Competency domains and sub-skills assessed</div>
            </div>
            <div style={css("background:#fff; padding:18px 20px")}>
              <div style={css("font-family:'Source Serif 4',serif; font-size:29px; font-weight:700; color:#0A2240")}>16</div>
              <div style={css("font-size:12px; color:#5A6472; margin-top:2px; line-height:1.4")}>Target roles across ISS, SSS, DES and NSO tracks</div>
            </div>
          </div>
        </div>

        <div style={css("display:grid; gap:16px")}>
          <div style={css("background:#fff; border:1px solid #D9DDE4; border-top:3px solid #0A2240; padding:24px")}>
            <div style={css("font-size:10.5px; font-weight:700; letter-spacing:0.09em; text-transform:uppercase; color:#7A8492")}>What you can do without an assessment</div>
            <h3 style={css("font-family:'Source Serif 4',serif; font-size:21px; font-weight:700; color:#0A2240; margin:8px 0 8px")}>Learn straight away</h3>
            <div style={css("display:grid; gap:9px; font-size:13.5px; color:#3B424E")}>
              <div style={css("display:grid; grid-template-columns:18px 1fr; gap:9px")}><span style={css("color:#166534; font-weight:700")}>✓</span><span>Browse and enrol in any course from either source</span></div>
              <div style={css("display:grid; grid-template-columns:18px 1fr; gap:9px")}><span style={css("color:#166534; font-weight:700")}>✓</span><span>Track learning hours, certificates and Karma Points</span></div>
              <div style={css("display:grid; grid-template-columns:18px 1fr; gap:9px")}><span style={css("color:#166534; font-weight:700")}>✓</span><span>Join trainer-run quizzes by QR code</span></div>
              <div style={css("display:grid; grid-template-columns:18px 1fr; gap:9px")}><span style={css("color:#166534; font-weight:700")}>✓</span><span>Ask the multilingual AI assistant for guidance</span></div>
            </div>
          </div>
          <div style={css("background:#fff; border:1px solid #D9DDE4; border-top:3px solid #B08D2E; padding:24px")}>
            <div style={css("font-size:10.5px; font-weight:700; letter-spacing:0.09em; text-transform:uppercase; color:#7A8492")}>What the assessment unlocks</div>
            <h3 style={css("font-family:'Source Serif 4',serif; font-size:21px; font-weight:700; color:#0A2240; margin:8px 0 8px")}>Learn deliberately</h3>
            <div style={css("display:grid; gap:9px; font-size:13.5px; color:#3B424E")}>
              <div style={css("display:grid; grid-template-columns:18px 1fr; gap:9px")}><span style={css("color:#B08D2E; font-weight:700")}>★</span><span>A four-domain gap map against your target role</span></div>
              <div style={css("display:grid; grid-template-columns:18px 1fr; gap:9px")}><span style={css("color:#B08D2E; font-weight:700")}>★</span><span>Your weak sub-skills ranked by priority</span></div>
              <div style={css("display:grid; grid-template-columns:18px 1fr; gap:9px")}><span style={css("color:#B08D2E; font-weight:700")}>★</span><span>A three-stage learning path, each item naming the gap it closes</span></div>
              <div style={css("display:grid; grid-template-columns:18px 1fr; gap:9px")}><span style={css("color:#B08D2E; font-weight:700")}>★</span><span>Instant evaluation with explanations for every item</span></div>
            </div>
            <div style={css("font-size:12px; color:#7A8492; margin-top:14px; line-height:1.5")}>Twenty minutes, eight items: MCQs, two job simulations and one written judgement question. Retake it any time.</div>
          </div>
        </div>
      </div>

      <div style={css("border-top:1px solid #DDE1E7; padding:44px 0")}>
        <div style={css("font-size:10.5px; font-weight:700; letter-spacing:0.09em; text-transform:uppercase; color:#7A8492")}>How it works</div>
        <h2 style={css("font-family:'Source Serif 4',serif; font-size:32px; font-weight:700; color:#0A2240; margin:8px 0 26px")}>Profile → Assess → Gap score → Personalised path</h2>
        <div style={css("display:grid; grid-template-columns:repeat(auto-fit,minmax(235px,1fr)); gap:1px; background:#DDE1E7; border:1px solid #DDE1E7")}>
          <div style={css("background:#fff; padding:24px")}>
            <div style={css("font-family:'IBM Plex Mono',monospace; font-size:12px; color:#B45309")}>STEP 01</div>
            <h4 style={css("font-family:'Source Serif 4',serif; font-size:19px; font-weight:700; color:#0A2240; margin:8px 0 6px")}>Profile</h4>
            <p style={css("font-size:13px; line-height:1.55; color:#5A6472; margin:0")}>Cadre, designation, posting, qualifications and prior training pulled from MoSPI HR and iGOT records — no forms to fill.</p>
          </div>
          <div style={css("background:#fff; padding:24px")}>
            <div style={css("font-family:'IBM Plex Mono',monospace; font-size:12px; color:#B45309")}>STEP 02</div>
            <h4 style={css("font-family:'Source Serif 4',serif; font-size:19px; font-weight:700; color:#0A2240; margin:8px 0 6px")}>Assess</h4>
            <p style={css("font-size:13px; line-height:1.55; color:#5A6472; margin:0")}>Adaptive MCQs, branching job simulations and a written judgement question, all drawn from real statistical-office work.</p>
          </div>
          <div style={css("background:#fff; padding:24px")}>
            <div style={css("font-family:'IBM Plex Mono',monospace; font-size:12px; color:#B45309")}>STEP 03</div>
            <h4 style={css("font-family:'Source Serif 4',serif; font-size:19px; font-weight:700; color:#0A2240; margin:8px 0 6px")}>Gap score</h4>
            <p style={css("font-size:13px; line-height:1.55; color:#5A6472; margin:0")}>Your assessed level is scored against the competency requirement of your chosen target role, domain by domain and sub-skill by sub-skill.</p>
          </div>
          <div style={css("background:#fff; padding:24px")}>
            <div style={css("font-family:'IBM Plex Mono',monospace; font-size:12px; color:#B45309")}>STEP 04</div>
            <h4 style={css("font-family:'Source Serif 4',serif; font-size:19px; font-weight:700; color:#0A2240; margin:8px 0 6px")}>Personalised path</h4>
            <p style={css("font-size:13px; line-height:1.55; color:#5A6472; margin:0")}>Three sequenced stages of courses from both sources, each carrying a stated reason and the gap it closes.</p>
          </div>
        </div>
      </div>

      <div style={css("border-top:1px solid #DDE1E7; padding:44px 0")}>
        <div style={css("display:grid; grid-template-columns:repeat(auto-fit,minmax(340px,1fr)); gap:40px; align-items:start")}>
          <div>
            <div style={css("font-size:10.5px; font-weight:700; letter-spacing:0.09em; text-transform:uppercase; color:#7A8492")}>Two sources, one path</div>
            <h2 style={css("font-family:'Source Serif 4',serif; font-size:32px; font-weight:700; color:#0A2240; margin:8px 0 14px")}>Courses come from the systems you already use</h2>
            <p style={css("font-size:15px; line-height:1.6; color:#3B424E; margin:0")}>Kartavya holds no catalogue of its own. Every course is a live item from one of two authoritative sources and is always labelled — so you know whether the next step is a module at your desk or a residential programme you must apply for.</p>
          </div>
          <div style={css("display:grid; gap:14px")}>
            <div style={css("background:#fff; border:1px solid #D9DDE4; border-left:4px solid #1F5AA6; padding:20px; display:flex; gap:16px; align-items:start; flex-wrap:wrap")}>
              <span style={css("display:inline-flex; align-items:center; gap:7px; border:1px solid #B9CCE5; background:#EAF0F8; padding:5px 9px; border-radius:2px; font-size:11px; font-weight:700; color:#14396B; white-space:nowrap")}><span style={css("width:8px; height:8px; background:#1F5AA6")}></span>iGOT Karmayogi</span>
              <div style={css("flex:1; min-width:220px")}>
                <h4 style={css("font-size:15.5px; font-weight:700; color:#0A2240; margin:0 0 5px")}>Self-paced digital learning &amp; virtual labs</h4>
                <p style={css("font-size:13px; line-height:1.55; color:#5A6472; margin:0")}>The civil-service LMS, in 16 languages. Completions, certificates and Karma Points flow back into Kartavya automatically.</p>
              </div>
            </div>
            <div style={css("background:#fff; border:1px solid #D9DDE4; border-left:4px solid #6D28D9; padding:20px; display:flex; gap:16px; align-items:start; flex-wrap:wrap")}>
              <span style={css("display:inline-flex; align-items:center; gap:7px; border:1px solid #CDBDEC; background:#F2EDFB; padding:5px 9px; border-radius:2px; font-size:11px; font-weight:700; color:#4C1D95; white-space:nowrap")}><span style={css("width:8px; height:8px; background:#6D28D9")}></span>NSSTA / TPAC</span>
              <div style={css("flex:1; min-width:220px")}>
                <h4 style={css("font-size:15.5px; font-weight:700; color:#0A2240; margin:0 0 5px")}>Residential &amp; specialist programmes</h4>
                <p style={css("font-size:13px; line-height:1.55; color:#5A6472; margin:0")}>The NSSTA training calendar, including TPAC-approved in-service courses with intake dates and seat availability.</p>
              </div>
            </div>
            <div style={css("display:flex; align-items:center; gap:10px; font-size:12px; color:#5A6472; padding:10px 12px; background:#EEF1F6; border:1px solid #DDE1E7; flex-wrap:wrap")}>
              <span style={css("font-family:'IBM Plex Mono',monospace; font-size:9.5px; font-weight:500; letter-spacing:0.06em; border:1px solid #C9CFD8; background:#fff; padding:2px 6px")}>AI-ASSISTED</span>
              Gap scoring, item generation, ranking and explanations are model-generated and checked against the MoSPI competency framework. Course content is authored by the source institution.
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
