import { useEffect, useRef, useState } from "react";
import { ReactLenis } from "lenis/react";
import { css } from "../lib/css";
import ImageSlot from "../components/ImageSlot";
import { DOM } from "../data";

// Scoped to this page only: Lenis (and the reveal/magnetic effects below) are
// mounted inside Landing's own tree and torn down when it unmounts (App.jsx
// only ever renders one screen at a time), so none of it reaches the
// signed-in dashboard/assessment/trainer/admin screens.
function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(
    () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const handler = (e) => setReduced(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);
  return reduced;
}

// Same 4 domains/colors used everywhere else in the app (Dashboard's gap map,
// the feature-card headers below) — reusing DOM's palette here instead of
// picking a new color keeps the rotating word visually tied to the same
// domain system, not an arbitrary decoration.
const HERO_DOMAINS = ["Statistical", "Technical", "Digital Governance", "Behavioural"].map((d) => ({
  label: d,
  color: DOM[d].color,
}));

// Hero right-column visual: a static preview of the real gap-map radar chart
// (same cx/cy/radius/axis-formula as Dashboard.jsx's actual chart, same
// dashed-required-vs-filled-current convention) — illustrative numbers, not
// live data, but the same visual grammar so it reads as a preview of the
// real feature rather than generic decoration.
const HERO_GAP_CX = 220, HERO_GAP_CY = 210, HERO_GAP_R = 150;
function heroGapXY(i, val) {
  const f = (val / 5) * HERO_GAP_R;
  return i === 0 ? { x: HERO_GAP_CX, y: HERO_GAP_CY - f }
    : i === 1 ? { x: HERO_GAP_CX + f, y: HERO_GAP_CY }
    : i === 2 ? { x: HERO_GAP_CX, y: HERO_GAP_CY + f }
    : { x: HERO_GAP_CX - f, y: HERO_GAP_CY };
}
function heroGapPoint(i, val) {
  const { x, y } = heroGapXY(i, val);
  return `${x},${y}`;
}
const HERO_GAP_REQUIRED = [4.2, 3.6, 3.0, 4.0];
const HERO_GAP_CURRENT = [2.4, 2.0, 1.3, 2.7];
const HERO_GAP_REQ_POINTS = HERO_GAP_REQUIRED.map((val, i) => heroGapPoint(i, val)).join(" ");
const HERO_GAP_CUR_POINTS = HERO_GAP_CURRENT.map((val, i) => heroGapPoint(i, val)).join(" ");
// The "assessed level" shape's own 4 vertices, as points a marker can sit on
// (used for the small circle that pulses at each axis when the radar sweep
// passes it — see .radar-axis-label below).
const HERO_GAP_CUR_VERTICES = HERO_GAP_CURRENT.map((val, i) => heroGapXY(i, val));

// Radar sweep: one full rotation every HERO_SWEEP_DURATION_S seconds,
// starting pointing at Statistical (0deg = straight up, matching the grid's
// top axis) and sweeping clockwise. Each axis's pulse highlight is timed via
// animation-delay so it peaks at the exact moment the sweep passes that
// axis's angle: delay = (angle / 360) * duration.
const HERO_SWEEP_DURATION_S = 5;
const HERO_AXIS_DELAYS_S = [0, 90, 180, 270].map((deg) => (deg / 360) * HERO_SWEEP_DURATION_S);
// A short trailing fan of faint lines behind the sweep's bright leading edge
// (itself drawn separately, at angle 0 relative to the rotating group) —
// this is what reads as a "sweep" rather than a single spinning spoke.
const HERO_SWEEP_TRAIL = Array.from({ length: 6 }, (_, idx) => {
  const angleRad = (-(idx + 1) * 5 * Math.PI) / 180;
  return {
    x: HERO_GAP_CX + HERO_GAP_R * Math.sin(angleRad),
    y: HERO_GAP_CY - HERO_GAP_R * Math.cos(angleRad),
    opacity: 0.2 * (1 - idx / 6),
  };
});

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

const STEPS = [
  ["1", "#F58220", "Profile", "Cadre, designation, posting and prior training pulled from MoSPI HR and iGOT — no forms."],
  ["2", "#1B5CB8", "Assess", "MCQs, two branching job simulations and a written judgement question, AI-evaluated."],
  ["3", "#1B5CB8", "Gap score", "Scored against the competency requirement of your target role, sub-skill by sub-skill."],
  ["4", "#F58220", "Personalised path", "Three sequenced stages from both sources, each stating the gap it closes."],
];

// Lightens (positive percent) or darkens (negative) a hex color by shifting
// each RGB channel toward white/black — used to build each step-circle's
// own light-source gradient from its existing accent color, rather than
// introducing any new color into the palette.
function shadeColor(hex, percent) {
  const num = parseInt(hex.replace("#", ""), 16);
  const amt = Math.round(2.55 * percent);
  const clamp = (c) => Math.max(0, Math.min(255, c));
  const r = clamp((num >> 16) + amt);
  const g = clamp(((num >> 8) & 0x00ff) + amt);
  const b = clamp((num & 0x0000ff) + amt);
  return `#${(0x1000000 + r * 0x10000 + g * 0x100 + b).toString(16).slice(1)}`;
}

// Vertical center of each step circle relative to its card's top edge
// (24px card padding + half of the 52px circle) — used to align the
// connecting line/fill behind the circles.
const STEP_CIRCLE_CENTER_Y = 24 + 52 / 2;

// Animates every digit run found in `text` (e.g. "18,442" -> one run, "4 / 22"
// -> two runs) from 0 up to its real value, leaving every non-digit character
// (commas, "/", "+", spaces) exactly where it was — so this works unmodified
// for every shape of stat value in STATS without per-item special-casing.
function CountUp({ text, start, duration = 1400 }) {
  const [display, setDisplay] = useState(() => text.replace(/[\d,]/g, "0"));

  useEffect(() => {
    if (!start) return;
    const matches = [...text.matchAll(/[\d,]+/g)];
    if (matches.length === 0) {
      setDisplay(text);
      return;
    }
    const targets = matches.map((m) => parseInt(m[0].replace(/,/g, ""), 10));
    let raf;
    const startTime = performance.now();
    const tick = (now) => {
      const progress = Math.min(1, (now - startTime) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      let out = "";
      let cursor = 0;
      matches.forEach((m, i) => {
        out += text.slice(cursor, m.index);
        out += Math.round(targets[i] * eased).toLocaleString("en-IN");
        cursor = m.index + m[0].length;
      });
      out += text.slice(cursor);
      setDisplay(out);
      if (progress < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [start, text, duration]);

  return display;
}

// Cycles through `words` ({ label, color }), holding each one on screen for
// HOLD_MS, then fading out and back in on the next — a slow cross-dissolve
// rather than an instant swap, so it reads as calm background motion rather
// than something demanding attention.
const HERO_ROTATOR_HOLD_MS = 2000;
const HERO_ROTATOR_FADE_MS = 700;

function RotatingWord({ words }) {
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const holdTimer = setTimeout(() => {
      setVisible(false);
    }, HERO_ROTATOR_HOLD_MS);
    return () => clearTimeout(holdTimer);
  }, [index]);

  useEffect(() => {
    if (visible) return;
    const swapTimer = setTimeout(() => {
      setIndex((i) => (i + 1) % words.length);
      setVisible(true);
    }, HERO_ROTATOR_FADE_MS);
    return () => clearTimeout(swapTimer);
  }, [visible, words.length]);

  const word = words[index];
  return (
    <span
      style={{
        display: "inline-block",
        fontWeight: 700,
        color: word.color,
        opacity: visible ? 1 : 0,
        transition: `opacity ${HERO_ROTATOR_FADE_MS}ms ease-in-out`,
      }}
    >
      {word.label}
    </span>
  );
}

// Fades + slides a section up into place the first time it scrolls into
// view. Respects prefers-reduced-motion by rendering fully visible
// immediately rather than skipping the reveal silently.
function Reveal({ children }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  const reducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    if (reducedMotion) {
      setVisible(true);
      return;
    }
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          obs.disconnect();
        }
      },
      { threshold: 0.15 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [reducedMotion]);

  return (
    <div
      ref={ref}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(28px)",
        transition: "opacity 800ms ease-out, transform 800ms ease-out",
      }}
    >
      {children}
    </div>
  );
}

// A restrained magnetic-button effect: the element drifts a few pixels
// toward the cursor while hovered (capped well short of a dramatic snap) and
// eases back to rest on mouse-leave. Disabled entirely under
// prefers-reduced-motion.
const MAGNETIC_STRENGTH = 0.25;
const MAGNETIC_MAX_OFFSET = 10;

function Magnetic({ children }) {
  const ref = useRef(null);
  const reducedMotion = usePrefersReducedMotion();

  const handleMove = (e) => {
    if (reducedMotion || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const relX = e.clientX - (rect.left + rect.width / 2);
    const relY = e.clientY - (rect.top + rect.height / 2);
    const x = Math.max(-MAGNETIC_MAX_OFFSET, Math.min(MAGNETIC_MAX_OFFSET, relX * MAGNETIC_STRENGTH));
    const y = Math.max(-MAGNETIC_MAX_OFFSET, Math.min(MAGNETIC_MAX_OFFSET, relY * MAGNETIC_STRENGTH));
    ref.current.style.transform = `translate(${x}px, ${y}px)`;
  };
  const handleLeave = () => {
    if (ref.current) ref.current.style.transform = "translate(0, 0)";
  };

  return (
    <span
      ref={ref}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      style={{ display: "inline-block", transition: "transform 300ms ease-out" }}
    >
      {children}
    </span>
  );
}

function FeatureCard({ card }) {
  return (
    <div className="feature-card" style={css(`background:#fff; border:1px solid #E3E9F2; border-radius:14px; overflow:hidden; box-shadow:0 4px 14px rgba(18,62,124,0.07); --accent:${card.headerBg}`)}>
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
  const reducedMotion = usePrefersReducedMotion();
  const [statsVisible, setStatsVisible] = useState(false);
  const statsRef = useRef(null);
  useEffect(() => {
    const el = statsRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setStatsVisible(true);
          obs.disconnect();
        }
      },
      { threshold: 0.3 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const [stepsVisible, setStepsVisible] = useState(false);
  const stepsRef = useRef(null);
  useEffect(() => {
    const el = stepsRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setStepsVisible(true);
          obs.disconnect();
        }
      },
      { threshold: 0.2 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const page = (
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
            <p style={css("font-size:19px; font-weight:600; color:#41506B; margin:12px 0 0")}>
              …in <RotatingWord words={HERO_DOMAINS} /> skills
            </p>
            {v.isHindi && (
              <p style={css("font-family:'Noto Sans Devanagari',sans-serif; font-size:18px; color:#123E7C; margin:14px 0 0; line-height:1.55; font-weight:600")}>क्षमता का आकलन करें, अंतर जानें और उसे भरने के लिए निर्धारित प्रशिक्षण प्राप्त करें।</p>
            )}
            <p style={css("font-size:16.5px; line-height:1.68; color:#41506B; max-width:600px; margin:16px 0 0; text-wrap:pretty")}>
              Take courses from <strong style={css("color:#123E7C")}>iGOT Karmayogi</strong> and <strong style={css("color:#C25E10")}>NSSTA / TPAC</strong> in one place. Sit a competency assessment when you are ready, and Kartavya turns it into a ranked gap map and a sequenced learning path for the role you are working toward.
            </p>
            <div style={css("display:flex; gap:12px; margin-top:26px; flex-wrap:wrap")}>
              <Magnetic>
                <button onClick={v.goSignin} className="btn-accent" style={css("font:inherit; font-size:15px; font-weight:700; cursor:pointer; padding:15px 30px; border:0; background:#F58220; color:#fff; border-radius:28px; box-shadow:0 6px 16px rgba(245,130,32,0.28)")}>Log in to Kartavya</button>
              </Magnetic>
              <Magnetic>
                <button onClick={v.goCatalogue} style={css("font:inherit; font-size:15px; font-weight:700; cursor:pointer; padding:15px 30px; border:1.5px solid #123E7C; background:#fff; color:#123E7C; border-radius:28px")}>Browse courses</button>
              </Magnetic>
            </div>
            <div style={css("display:flex; align-items:center; gap:10px; margin-top:20px; font-size:13px; color:#5A6C86; flex-wrap:wrap")}>
              <span style={css("font-size:11px; font-weight:700; letter-spacing:0.06em; text-transform:uppercase; color:#123E7C; background:#E8F0FA; border:1px solid #B9CFEC; padding:4px 9px; border-radius:20px")}>For officials</span>
              ISS · SSS · State DES · MoSPI / NSO. Not a public course portal.
            </div>
          </div>
          <div style={css("position:relative")}>
            <div style={css("position:absolute; top:-18px; right:-6px; width:120px; height:120px; border-radius:50%; background:#FCE3C6; z-index:0")}></div>
            <div style={css("position:absolute; bottom:-22px; left:-14px; width:90px; height:90px; border-radius:50%; background:#DCE8F7; z-index:0")}></div>
            <div style={css("position:relative; z-index:1; background:#fff; border-radius:20px; padding:22px 22px 18px; box-shadow:0 10px 30px rgba(18,62,124,0.12)")}>
              <div style={css("font-size:11px; font-weight:700; letter-spacing:0.08em; text-transform:uppercase; color:#7A8492")}>Sample gap map</div>
              <svg viewBox="-45 0 530 420" style={css("width:100%; height:auto; margin-top:4px; display:block")} role="img" aria-label="Illustrative four-domain competency gap map">
                <defs>
                  <linearGradient id="heroSweepGradient" x1="0" y1="1" x2="0" y2="0">
                    <stop offset="0%" stopColor="#1B5CB8" stopOpacity="0.85" />
                    <stop offset="100%" stopColor="#1B5CB8" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <polygon points="220,60 370,210 220,360 70,210" fill="#fff" stroke="#D9DDE4"></polygon>
                <polygon points="220,90 340,210 220,330 100,210" fill="none" stroke="#E4E7EC"></polygon>
                <polygon points="220,120 310,210 220,300 130,210" fill="none" stroke="#E4E7EC"></polygon>
                <polygon points="220,150 280,210 220,270 160,210" fill="none" stroke="#E4E7EC"></polygon>
                <polygon points="220,180 250,210 220,240 190,210" fill="none" stroke="#E4E7EC"></polygon>
                <line x1="220" y1="210" x2="220" y2="60" stroke="#D9DDE4"></line>
                <line x1="220" y1="210" x2="370" y2="210" stroke="#D9DDE4"></line>
                <line x1="220" y1="210" x2="220" y2="360" stroke="#D9DDE4"></line>
                <line x1="220" y1="210" x2="70" y2="210" stroke="#D9DDE4"></line>
                {/* Rotating radar sweep: a faint trailing fan plus one bright leading
                    edge, all inside one <g> that CSS spins 360deg continuously
                    (see .radar-sweep in index.css) — the trail's own coordinates
                    are fixed (precomputed in HERO_SWEEP_TRAIL), only the group
                    itself rotates. */}
                <g className="radar-sweep" style={{ animationDuration: `${HERO_SWEEP_DURATION_S}s` }}>
                  {HERO_SWEEP_TRAIL.map((p, k) => (
                    <line key={k} x1="220" y1="210" x2={p.x} y2={p.y} stroke="#1B5CB8" strokeWidth="9" strokeOpacity={p.opacity} strokeLinecap="round" />
                  ))}
                  <line x1="220" y1="210" x2="220" y2="60" stroke="url(#heroSweepGradient)" strokeWidth="3" strokeLinecap="round" />
                </g>
                <polygon className="radar-required" points={HERO_GAP_REQ_POINTS} fill="rgba(10,34,64,0.06)" stroke="#123E7C" strokeWidth="1.5" strokeDasharray="5 4"></polygon>
                <polygon className="radar-current" points={HERO_GAP_CUR_POINTS} fill="rgba(31,90,166,0.16)" stroke="#1B5CB8" strokeWidth="2.5"></polygon>
                {HERO_GAP_CUR_VERTICES.map((p, i) => (
                  <circle key={i} className="radar-axis-label" style={{ animationDuration: `${HERO_SWEEP_DURATION_S}s`, animationDelay: `${HERO_AXIS_DELAYS_S[i]}s` }} cx={p.x} cy={p.y} r="4" fill="#1B5CB8" />
                ))}
                <text className="radar-axis-label" style={{ animationDuration: `${HERO_SWEEP_DURATION_S}s`, animationDelay: `${HERO_AXIS_DELAYS_S[0]}s` }} x="220" y="44" textAnchor="middle" fontFamily="Poppins, sans-serif" fontSize="13" fontWeight="700" fill="#1B5CB8">Statistical</text>
                <text className="radar-axis-label" style={{ animationDuration: `${HERO_SWEEP_DURATION_S}s`, animationDelay: `${HERO_AXIS_DELAYS_S[1]}s` }} x="378" y="206" textAnchor="start" fontFamily="Poppins, sans-serif" fontSize="13" fontWeight="700" fill="#0F766E">Technical</text>
                <text className="radar-axis-label" style={{ animationDuration: `${HERO_SWEEP_DURATION_S}s`, animationDelay: `${HERO_AXIS_DELAYS_S[2]}s` }} x="220" y="382" textAnchor="middle" fontFamily="Poppins, sans-serif" fontSize="13" fontWeight="700" fill="#9D2449">Digital Governance</text>
                <text className="radar-axis-label" style={{ animationDuration: `${HERO_SWEEP_DURATION_S}s`, animationDelay: `${HERO_AXIS_DELAYS_S[3]}s` }} x="62" y="204" textAnchor="end" fontFamily="Poppins, sans-serif" fontSize="13" fontWeight="700" fill="#15803D">Behavioural /</text>
                <text className="radar-axis-label" style={{ animationDuration: `${HERO_SWEEP_DURATION_S}s`, animationDelay: `${HERO_AXIS_DELAYS_S[3]}s` }} x="62" y="220" textAnchor="end" fontFamily="Poppins, sans-serif" fontSize="13" fontWeight="700" fill="#15803D">Managerial</text>
              </svg>
              <div style={css("display:flex; gap:16px; align-items:center; flex-wrap:wrap; margin-top:2px; padding-top:10px; border-top:1px solid #EEF0F3; font-size:11.5px; color:#5A6C86")}>
                <span style={css("display:flex; align-items:center; gap:6px")}><span style={css("width:14px; height:9px; background:rgba(31,90,166,0.2); border:2px solid #1B5CB8")}></span>Assessed level</span>
                <span style={css("display:flex; align-items:center; gap:6px")}><span style={css("width:14px; height:9px; background:rgba(10,34,64,0.06); border:1.5px dashed #123E7C")}></span>Required for role</span>
              </div>
              <div style={css("font-size:12px; color:#5A6472; margin-top:10px; line-height:1.5")}>This is what your own gap map looks like once you complete the baseline assessment.</div>
            </div>
          </div>
        </div>
      </div>

      <Reveal>
        <div ref={statsRef} style={css("background:#123E7C; padding:44px 32px")}>
          <div style={css("max-width:1420px; margin:0 auto; display:grid; grid-template-columns:repeat(auto-fit,minmax(min(100%,160px),1fr)); gap:28px")}>
            {STATS.map(([icon, iconBg, value, label], i) => (
              <div key={i} style={css("display:flex; align-items:center; gap:16px")}>
                <span style={css(`width:60px; height:60px; border-radius:14px; background:${iconBg}; display:flex; align-items:center; justify-content:center; font-size:22px; font-weight:700; color:#fff; flex-shrink:0`)}>{icon}</span>
                <div>
                  <div style={css("font-family:'IBM Plex Mono',monospace; font-size:32px; font-weight:700; color:#fff; line-height:1.1")}><CountUp text={value} start={statsVisible} /></div>
                  <div style={css("font-size:13.5px; color:#CFE0F5; margin-top:4px")}>{label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Reveal>

      <Reveal>
      <div style={css("padding:0 32px")}>
        <div style={css("max-width:1420px; margin:24px auto 0; display:grid; grid-template-columns:repeat(auto-fit,minmax(min(100%,300px),1fr)); gap:20px")}>
          <div style={css("background:#fff; border:1px solid #E3E9F2; border-radius:14px; box-shadow:0 6px 20px rgba(18,62,124,0.10); padding:18px 22px; min-width:0")}>
            <div style={css("display:flex; align-items:center; gap:9px; margin-bottom:14px")}>
              <span style={css("font-size:10.5px; font-weight:700; letter-spacing:0.08em; text-transform:uppercase; color:#fff; background:#C0392B; padding:3px 8px; border-radius:20px")}>New</span>
              <span style={css("font-size:13px; font-weight:700; color:#123E7C")}>Announcements</span>
            </div>
            <div style={css("overflow:hidden; -webkit-mask-image:linear-gradient(90deg,transparent,#000 24px,#000 calc(100% - 24px),transparent); mask-image:linear-gradient(90deg,transparent,#000 24px,#000 calc(100% - 24px),transparent)")}>
              <div className="announcement-ticker" style={css("display:inline-flex; gap:48px; white-space:nowrap")}>
                {[...ANNOUNCEMENTS, ...ANNOUNCEMENTS].map(([date, text], i) => (
                  <span key={i} style={css("display:inline-flex; gap:10px; align-items:baseline; font-size:12.5px")}>
                    <span style={css("font-family:'IBM Plex Mono',monospace; color:#8A97AC")}>{date}</span>
                    <a href="#main">{text}</a>
                  </span>
                ))}
              </div>
            </div>
          </div>
          <div style={css("background:#fff; border:1px solid #E3E9F2; border-radius:14px; box-shadow:0 6px 20px rgba(18,62,124,0.10); padding:18px 22px")}>
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
      </Reveal>

      <div ref={stepsRef} style={css("padding:40px 32px 0")}>
        <div style={css("max-width:1420px; margin:0 auto")}>
          <div
            style={{
              textAlign: "center",
              marginBottom: 26,
              opacity: stepsVisible ? 1 : 0,
              transform: stepsVisible ? "translateY(0)" : "translateY(20px)",
              transition: "opacity 600ms ease-out, transform 600ms ease-out",
            }}
          >
            <div style={css("font-size:12px; font-weight:700; letter-spacing:0.09em; text-transform:uppercase; color:#C25E10")}>How it works</div>
            <h2 style={css("font-size:30px; font-weight:800; color:#123E7C; margin:8px 0 0")}>Profile → Assess → Gap score → Path</h2>
          </div>
          <div style={css("position:relative")}>
            {/* Decorative connecting line behind the 4 circles — spans circle-center
                to circle-center only when exactly 4 equal columns are rendered, so
                it's hidden below that breakpoint (see .step-track in index.css)
                rather than risk misaligning when the grid wraps. */}
            <div
              className="step-track"
              style={css(`position:absolute; left:12.5%; width:75%; top:${STEP_CIRCLE_CENTER_Y}px; height:2px; background:#E4E7EC; z-index:0`)}
            ></div>
            <div
              className="step-track step-track-fill"
              style={{
                position: "absolute",
                left: "12.5%",
                top: STEP_CIRCLE_CENTER_Y,
                height: 2,
                zIndex: 0,
                background: "linear-gradient(90deg, #1B5CB8, #F58220)",
                width: stepsVisible ? "75%" : "0%",
                transition: reducedMotion ? "none" : "width 1300ms ease-in-out",
                transitionDelay: "150ms",
              }}
            ></div>
            <div style={css("position:relative; z-index:1; display:grid; grid-template-columns:repeat(auto-fit,minmax(min(100%,330px),1fr)); gap:20px")}>
              {STEPS.map(([n, bg, title, body], i) => (
                <div
                  key={i}
                  className={`step-reveal${stepsVisible ? " is-visible" : ""}`}
                  style={{
                    ...css("background:#fff; border:1px solid #E3E9F2; border-radius:14px; padding:24px; text-align:center; box-shadow:0 4px 14px rgba(18,62,124,0.06)"),
                    transitionDelay: reducedMotion ? "0ms" : `${150 + i * 150}ms`,
                  }}
                >
                  <div
                    className="step-number"
                    style={css(`width:52px; height:52px; margin:0 auto 14px; border-radius:50%; background:linear-gradient(135deg, ${shadeColor(bg, 18)}, ${shadeColor(bg, -18)}); box-shadow:0 6px 14px rgba(18,62,124,0.28), inset 0 1px 2px rgba(255,255,255,0.45); color:#fff; display:flex; align-items:center; justify-content:center; font-size:20px; font-weight:700`)}
                  >{n}</div>
                  <h4 style={css("font-size:17px; font-weight:700; color:#123E7C; margin:0 0 6px")}>{title}</h4>
                  <p style={css("font-size:13px; line-height:1.6; color:#5A6C86; margin:0")}>{body}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <Reveal>
      <div style={css("padding:40px 32px 10px")}>
        <div style={css("max-width:1420px; margin:0 auto; display:grid; grid-template-columns:repeat(auto-fit,minmax(min(100%,362px),1fr)); gap:20px")}>
          {FEATURE_CARDS.map((card, i) => <FeatureCard key={i} card={card} />)}
        </div>
      </div>
      </Reveal>

      <Reveal>
      <div style={css("padding:36px 32px 56px")}>
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
      </Reveal>
    </section>
  );

  // Lenis takes over window scrolling with a slight momentum/easing feel;
  // skipped entirely (page scrolls natively) when the user has asked the OS
  // for reduced motion.
  return reducedMotion ? page : (
    <ReactLenis root options={{ lerp: 0.1, duration: 1.1 }}>
      {page}
    </ReactLenis>
  );
}
