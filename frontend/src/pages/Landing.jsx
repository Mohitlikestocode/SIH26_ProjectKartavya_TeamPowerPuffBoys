import { css } from "../lib/css";
import ImageSlot from "../components/ImageSlot";

const STATS = [
  ["18k", "#F58220", "18,442", "Officials profiled"],
  ["iG", "#2C5A9E", "2,400+", "iGOT courses mapped"],
  ["NS", "#2C5A9E", "318", "NSSTA / TPAC programmes"],
  ["4", "#2C5A9E", "4 / 22", "Domains & sub-skills assessed"],
  ["16", "#F58220", "16", "Target roles across cadres"],
];

const ANNOUNCEMENTS = [
  ["04 Sep 26", "NSSTA calendar for Q3 FY 26-27 published — 28 new programmes"],
  ["28 Aug 26", "Competency Directory v3.1 in force from 1 October 2026"],
  ["19 Aug 26", "Annual 60-hour learning requirement — compliance advisory"],
];

const FEATURE_CARDS = [
  {
    header: "Learn without an assessment", headerBg: "#1B5CB8",
    items: [
      ["1", "Browse the full catalogue", "Every iGOT course and NSSTA programme, filterable by domain and source."],
      ["2", "Track hours & Karma Points", "Completions and certificates sync back from iGOT automatically."],
      ["3", "Join classroom quizzes by QR", "Scan the code your trainer projects — no prior enrolment needed."],
    ],
    iconBg: "#FDF0E1", iconFg: "#C25E10",
  },
  {
    header: "What the assessment unlocks", headerBg: "#F58220",
    items: [
      ["★", "A four-domain gap map", "Your assessed level against the requirement for your target role."],
      ["★", "Ranked sub-skill gaps", "Twenty-two sub-skills, ordered by impact on your eligibility."],
      ["★", "A three-stage learning path", "Foundation → Application → Specialisation, each item naming the gap it closes."],
    ],
    iconBg: "#E8F0FA", iconFg: "#123E7C",
  },
  {
    header: "Two authoritative sources", headerBg: "#1B5CB8", custom: "sources",
  },
  {
    header: "For trainers & administrators", headerBg: "#0F766E",
    items: [
      ["Q", "Generate or write assessments", "Upload a PDF, PPT or lecture recording and review AI-drafted items — or author them yourself. Nothing publishes unapproved."],
      ["⌗", "Run classroom sessions by QR", "Each session names the test it serves and the course it maps to, with live participation counts."],
      ["▤", "See the workforce, not just the officer", "Cadre × domain heatmaps, training effectiveness and skill forecasts for DIID and HR — aggregates only."],
    ],
    iconBg: "#E4F2F0", iconFg: "#0F766E",
  },
  {
    header: "Works in your language", headerBg: "#9D2449",
    items: [
      ["अ", "Thirteen languages, not just English", "Interface, course metadata and assessment items translate through the Sarvam sovereign LLM layer.", true],
      ["◍", "Ask by voice or text", "The assistant answers questions about your gaps, mandatory courses and NSSTA intakes — in Hindi or code-mixed input."],
      ["◐", "Built for every office", "GIGW 3.0 structure, screen-reader support, text-size and high-contrast controls, and a low-bandwidth mode for state offices."],
    ],
    iconBg: "#FBEAEE", iconFg: "#9D2449",
  },
  {
    header: "Secure by design", headerBg: "#15803D",
    items: [
      ["⚿", "Parichay SSO, role-based access", "Officers see only their own record; administrators see cohort aggregates, never individual answer sheets."],
      ["§", "DPDP Act, 2023 compliant", "Purpose-bound processing, audited exports and no repurposing of assessment data for administrative action."],
      ["⇄", "Interoperable and cloud-ready", "Standard APIs to iGOT and NDAP, deployable on government cloud, installable as a PWA on any phone."],
    ],
    iconBg: "#EBF5EE", iconFg: "#15803D",
  },
];

const GALLERY = [
  ["gal-1", "NSSTA classroom", "NSSTA Greater Noida · residential programme"],
  ["gal-2", "Field enumeration", "HCES field supervision · NSSO"],
  ["gal-3", "Computer lab", "Computational statistics lab · Python & R"],
  ["gal-4", "State DES workshop", "State DES coordination workshop"],
  ["gal-5", "QR assessment in class", "Scan-to-join assessment · Batch 41"],
  ["gal-6", "NDAP data stewardship", "NDAP data-stewardship briefing · DIID"],
];

const STEPS = [
  ["1", "#F58220", "Profile", "Cadre, designation, posting and prior training pulled from MoSPI HR and iGOT — no forms."],
  ["2", "#1B5CB8", "Assess", "MCQs, two branching job simulations and a written judgement question, AI-evaluated."],
  ["3", "#1B5CB8", "Gap score", "Scored against the competency requirement of your target role, sub-skill by sub-skill."],
  ["4", "#F58220", "Personalised path", "Three sequenced stages from both sources, each stating the gap it closes."],
];

function FeatureCard({ card }) {
  return (
    <div style={css("background:#fff; border:1px solid #E3E9F2; border-radius:14px; overflow:hidden; box-shadow:0 4px 14px rgba(18,62,124,0.07)")}>
      <div style={css(`background:${card.headerBg}; padding:14px 20px; text-align:center; font-size:18px; font-weight:700; color:#fff`)}>{card.header}</div>
      {card.custom === "sources" ? (
        <div style={css("padding:20px 22px 24px; display:grid; gap:14px")}>
          <div style={css("border:1px solid #B9CFEC; background:#F6FAFF; border-radius:10px; padding:14px")}>
            <span style={css("display:inline-flex; align-items:center; gap:7px; border:1px solid #B9CFEC; background:#E8F0FA; padding:4px 9px; border-radius:20px; font-size:11px; font-weight:700; color:#123E7C")}><span style={css("width:8px; height:8px; background:#1B5CB8; border-radius:50%")}></span>iGOT Karmayogi</span>
            <div style={css("font-size:13px; color:#41506B; line-height:1.55; margin-top:8px")}>Self-paced modules and virtual labs in 16 languages, with Karma Points and certificates.</div>
          </div>
          <div style={css("border:1px solid #F3CFA6; background:#FFFAF3; border-radius:10px; padding:14px")}>
            <span style={css("display:inline-flex; align-items:center; gap:7px; border:1px solid #F3CFA6; background:#FDF0E1; padding:4px 9px; border-radius:20px; font-size:11px; font-weight:700; color:#9A4A0B")}><span style={css("width:8px; height:8px; background:#F58220; border-radius:50%")}></span>NSSTA / TPAC</span>
            <div style={css("font-size:13px; color:#41506B; line-height:1.55; margin-top:8px")}>Residential and specialist programmes from the NSSTA calendar, with intake dates and seats.</div>
          </div>
          <div style={css("font-size:11.5px; color:#7A8AA3; line-height:1.5")}>Kartavya holds no catalogue of its own — every item is labelled with its source.</div>
        </div>
      ) : (
        <div style={css("padding:20px 22px 24px; display:grid; gap:12px")}>
          {card.items.map(([icon, title, body, devanagari], i) => (
            <div key={i} style={css("display:grid; grid-template-columns:38px 1fr; gap:13px; align-items:start")}>
              <span style={css(`width:38px; height:38px; border-radius:10px; background:${card.iconBg}; color:${card.iconFg}; display:flex; align-items:center; justify-content:center; font-size:15px; font-weight:700${devanagari ? "; font-family:'Noto Sans Devanagari',sans-serif; font-size:16px" : ""}`)}>{icon}</span>
              <div><div style={css("font-size:14.5px; font-weight:700; color:#123E7C")}>{title}</div><div style={css("font-size:13px; color:#5A6C86; line-height:1.55; margin-top:2px")}>{body}</div></div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Landing({ v }) {
  return (
    <section style={css("margin:0 -32px")}>
      <div style={css("background:linear-gradient(#FDF6EE,#FFFBF6); padding:26px 32px 54px")}>
        <div style={css("max-width:1420px; margin:0 auto; display:grid; grid-template-columns:repeat(auto-fit,minmax(min(100%,340px),1fr)); gap:44px; align-items:center")}>
          <div>
            <div style={css("display:inline-flex; align-items:center; gap:9px; background:#fff; border:1px solid #F3CFA6; padding:7px 14px; border-radius:24px; font-size:12px; font-weight:700; color:#C25E10; box-shadow:0 2px 8px rgba(245,130,32,0.10)")}>
              <span style={css("width:7px; height:7px; background:#138808; border-radius:50%")}></span>
              MoSPI · Data Informatics &amp; Innovation Division
            </div>
            <h1 style={css("font-size:46px; line-height:1.14; font-weight:800; color:#123E7C; margin:20px 0 0; letter-spacing:-0.01em; text-wrap:balance")}>
              Welcome to Kartavya<br /><span style={css("color:#F58220")}>Know your gap.</span> <span style={css("border-bottom:5px solid #F58220; padding-bottom:2px")}>Close it.</span>
            </h1>
            {v.isHindi && (
              <p style={css("font-family:'Noto Sans Devanagari',sans-serif; font-size:18px; color:#123E7C; margin:14px 0 0; line-height:1.55; font-weight:600")}>क्षमता का आकलन करें, अंतर जानें और उसे भरने के लिए निर्धारित प्रशिक्षण प्राप्त करें।</p>
            )}
            <p style={css("font-size:16.5px; line-height:1.68; color:#41506B; max-width:600px; margin:16px 0 0; text-wrap:pretty")}>
              Take courses from <strong style={css("color:#123E7C")}>iGOT Karmayogi</strong> and <strong style={css("color:#C25E10")}>NSSTA / TPAC</strong> in one place. Sit a competency assessment when you are ready, and Kartavya turns it into a ranked gap map and a sequenced learning path for the role you are working toward.
            </p>
            <div style={css("display:flex; gap:12px; margin-top:26px; flex-wrap:wrap")}>
              <button onClick={v.goSignin} className="btn-accent" style={css("font:inherit; font-size:15px; font-weight:700; cursor:pointer; padding:15px 30px; border:0; background:#F58220; color:#fff; border-radius:28px; box-shadow:0 6px 16px rgba(245,130,32,0.28)")}>Log in to Kartavya</button>
              <button onClick={v.goCatalogue} style={css("font:inherit; font-size:15px; font-weight:700; cursor:pointer; padding:15px 30px; border:1.5px solid #123E7C; background:#fff; color:#123E7C; border-radius:28px")}>Browse courses</button>
            </div>
            <div style={css("display:flex; align-items:center; gap:10px; margin-top:20px; font-size:13px; color:#5A6C86; flex-wrap:wrap")}>
              <span style={css("font-size:11px; font-weight:700; letter-spacing:0.06em; text-transform:uppercase; color:#123E7C; background:#E8F0FA; border:1px solid #B9CFEC; padding:4px 9px; border-radius:20px")}>For officials</span>
              ISS · SSS · State DES · MoSPI / NSO. Not a public course portal.
            </div>
          </div>
          <div style={css("position:relative")}>
            <div style={css("position:absolute; top:-18px; right:-6px; width:120px; height:120px; border-radius:50%; background:#FCE3C6; z-index:0")}></div>
            <div style={css("position:absolute; bottom:-22px; left:-14px; width:90px; height:90px; border-radius:50%; background:#DCE8F7; z-index:0")}></div>
            <div style={css("position:relative; z-index:1; background:#fff; border-radius:20px; padding:12px; box-shadow:0 10px 30px rgba(18,62,124,0.12)")}>
              <ImageSlot shape="rounded" radius={14} style={{ width: "100%", height: 340 }} placeholder="Drop a workplace photo — officials at a statistical office / NSSTA classroom" />
            </div>
          </div>
        </div>
      </div>

      <div style={css("background:#123E7C; padding:26px 32px")}>
        <div style={css("max-width:1420px; margin:0 auto; display:grid; grid-template-columns:repeat(auto-fit,minmax(min(100%,132px),1fr)); gap:18px")}>
          {STATS.map(([icon, iconBg, value, label], i) => (
            <div key={i} style={css("display:flex; align-items:center; gap:14px")}>
              <span style={css(`width:48px; height:48px; border-radius:12px; background:${iconBg}; display:flex; align-items:center; justify-content:center; font-size:${icon.length > 1 ? 19 : 19}px; font-weight:700; color:#fff; flex-shrink:0`)}>{icon}</span>
              <div><div style={css("font-size:24px; font-weight:700; color:#fff; line-height:1.1")}>{value}</div><div style={css("font-size:12.5px; color:#CFE0F5; margin-top:2px")}>{label}</div></div>
            </div>
          ))}
        </div>
      </div>

      <div style={css("padding:0 32px")}>
        <div style={css("max-width:1420px; margin:24px auto 0; background:#fff; border:1px solid #E3E9F2; border-radius:14px; box-shadow:0 6px 20px rgba(18,62,124,0.10); display:grid; grid-template-columns:repeat(auto-fit,minmax(min(100%,300px),1fr)); overflow:hidden")}>
          <div style={css("padding:18px 22px; border-right:1px solid #EEF1F6")}>
            <div style={css("display:flex; align-items:center; gap:9px; margin-bottom:12px")}>
              <span style={css("font-size:10.5px; font-weight:700; letter-spacing:0.08em; text-transform:uppercase; color:#fff; background:#C0392B; padding:3px 8px; border-radius:20px")}>New</span>
              <span style={css("font-size:13px; font-weight:700; color:#123E7C")}>Announcements</span>
            </div>
            <div style={css("display:grid; gap:9px")}>
              {ANNOUNCEMENTS.map(([date, text], i) => (
                <div key={i} style={css("display:grid; grid-template-columns:78px 1fr; gap:10px; font-size:12.5px; align-items:baseline")}>
                  <span style={css("font-family:'IBM Plex Mono',monospace; color:#8A97AC")}>{date}</span>
                  <a href="#main">{text}</a>
                </div>
              ))}
            </div>
          </div>
          <div style={css("padding:18px 22px")}>
            <div style={css("font-size:13px; font-weight:700; color:#123E7C; margin-bottom:12px")}>Quick links</div>
            <div style={css("display:grid; grid-template-columns:repeat(auto-fit,minmax(min(100%,160px),1fr)); gap:9px")}>
              <button onClick={v.goCatalogue} className="quick-link-blue" style={css("font:inherit; cursor:pointer; text-align:left; font-size:12.5px; font-weight:600; color:#123E7C; background:#F6FAFF; border:1px solid #B9CFEC; border-radius:10px; padding:11px 12px")}>Course catalogue</button>
              <button onClick={v.openScanner} className="quick-link-orange" style={css("font:inherit; cursor:pointer; text-align:left; font-size:12.5px; font-weight:600; color:#9A4A0B; background:#FFFAF3; border:1px solid #F3CFA6; border-radius:10px; padding:11px 12px")}>Join session by QR</button>
              <a href="#main" style={css("font-size:12.5px; font-weight:600; color:#123E7C; background:#F6FAFF; border:1px solid #B9CFEC; border-radius:10px; padding:11px 12px")}>NSSTA calendar</a>
              <a href="#main" style={css("font-size:12.5px; font-weight:600; color:#123E7C; background:#F6FAFF; border:1px solid #B9CFEC; border-radius:10px; padding:11px 12px")}>Competency framework</a>
              <a href="#main" style={css("font-size:12.5px; font-weight:600; color:#123E7C; background:#F6FAFF; border:1px solid #B9CFEC; border-radius:10px; padding:11px 12px")}>Install as app</a>
              <a href="#main" style={css("font-size:12.5px; font-weight:600; color:#123E7C; background:#F6FAFF; border:1px solid #B9CFEC; border-radius:10px; padding:11px 12px")}>Help centre</a>
            </div>
          </div>
        </div>
      </div>

      <div style={css("padding:40px 32px 10px")}>
        <div style={css("max-width:1420px; margin:0 auto; display:grid; grid-template-columns:repeat(auto-fit,minmax(min(100%,362px),1fr)); gap:20px")}>
          {FEATURE_CARDS.map((card, i) => <FeatureCard key={i} card={card} />)}
        </div>
      </div>

      <div style={css("padding:36px 32px 0")}>
        <div style={css("max-width:1420px; margin:0 auto; background:#123E7C; border-radius:16px; overflow:hidden; display:grid; grid-template-columns:repeat(auto-fit,minmax(min(100%,300px),1fr))")}>
          <div style={css("padding:30px 32px")}>
            <div style={css("font-size:11px; font-weight:700; letter-spacing:0.09em; text-transform:uppercase; color:#F9C089")}>Message from the Secretary</div>
            <p style={css("font-size:19px; line-height:1.6; color:#fff; margin:14px 0 0; font-weight:500")}>"A statistical system is only as strong as the competence of the officers who run it. Kartavya makes each officer's development plan explicit, measurable and tied to the work they actually do."</p>
            <div style={css("display:flex; align-items:center; gap:13px; margin-top:20px")}>
              <div style={css("width:60px; height:60px; border-radius:50%; background:#fff; padding:3px; flex-shrink:0")}>
                <ImageSlot shape="circle" style={{ width: 54, height: 54 }} placeholder="Photo" />
              </div>
              <div>
                <div style={css("font-size:14.5px; font-weight:700; color:#fff")}>Secretary, MoSPI</div>
                <div style={css("font-size:12.5px; color:#B7CDEB")}>Ministry of Statistics &amp; Programme Implementation</div>
              </div>
            </div>
          </div>
          <div style={css("min-height:250px; padding:16px; background:#0F3568; display:flex")}>
            <div style={css("flex:1; min-width:0; background:#fff; border-radius:12px; padding:6px; display:flex")}>
              <ImageSlot shape="rounded" radius={8} style={{ width: "100%", minWidth: 0, minHeight: 218 }} placeholder="Drop a photo of a statistical office" />
            </div>
          </div>
        </div>
      </div>

      <div style={css("padding:36px 32px 0")}>
        <div style={css("max-width:1420px; margin:0 auto")}>
          <div style={css("display:flex; justify-content:space-between; align-items:baseline; gap:14px; flex-wrap:wrap; margin-bottom:16px")}>
            <div>
              <div style={css("font-size:12px; font-weight:700; letter-spacing:0.09em; text-transform:uppercase; color:#C25E10")}>Capacity building in action</div>
              <h2 style={css("font-size:26px; font-weight:800; color:#123E7C; margin:6px 0 0")}>Training across the statistical system</h2>
            </div>
            <a href="#main" style={css("font-size:13px; font-weight:600")}>View photo gallery</a>
          </div>
          <div style={css("display:grid; grid-template-columns:repeat(auto-fit,minmax(min(100%,362px),1fr)); gap:16px")}>
            {GALLERY.map(([id, placeholder, caption]) => (
              <div key={id} style={css("background:#fff; border:1px solid #E3E9F2; border-radius:14px; overflow:hidden; box-shadow:0 4px 14px rgba(18,62,124,0.06)")}>
                <ImageSlot shape="rect" style={{ width: "100%", height: 150 }} placeholder={placeholder} />
                <div style={css("padding:12px 14px; font-size:12.5px; font-weight:600; color:#123E7C")}>{caption}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={css("padding:34px 32px 56px")}>
        <div style={css("max-width:1420px; margin:0 auto")}>
          <div style={css("text-align:center; margin-bottom:26px")}>
            <div style={css("font-size:12px; font-weight:700; letter-spacing:0.09em; text-transform:uppercase; color:#C25E10")}>How it works</div>
            <h2 style={css("font-size:30px; font-weight:800; color:#123E7C; margin:8px 0 0")}>Profile → Assess → Gap score → Path</h2>
          </div>
          <div style={css("display:grid; grid-template-columns:repeat(auto-fit,minmax(min(100%,330px),1fr)); gap:20px")}>
            {STEPS.map(([n, bg, title, body], i) => (
              <div key={i} style={css("background:#fff; border:1px solid #E3E9F2; border-radius:14px; padding:24px; text-align:center; box-shadow:0 4px 14px rgba(18,62,124,0.06)")}>
                <div style={css(`width:52px; height:52px; margin:0 auto 14px; border-radius:50%; background:${bg}; color:#fff; display:flex; align-items:center; justify-content:center; font-size:20px; font-weight:700`)}>{n}</div>
                <h4 style={css("font-size:17px; font-weight:700; color:#123E7C; margin:0 0 6px")}>{title}</h4>
                <p style={css("font-size:13px; line-height:1.6; color:#5A6C86; margin:0")}>{body}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
