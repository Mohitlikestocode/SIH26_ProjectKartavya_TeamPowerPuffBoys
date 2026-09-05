import { useState } from "react";
import { css } from "./lib/css";
import { qr } from "./components/QrCode";
import { uploadDocument, generateForDocument } from "./lib/api";
import {
  D, DOM, SRC, LOGIN, TARGETS, SUBS, SUBOFF, ITEMS, SKILLPATH, STAGE_META,
  CATALOGUE, INPROGRESS, CERTS, HEAT, RAMP, EFFECT, EMERGING,
  REPORTS, SESSIONS, FLOW, ASSIST,
} from "./data";

import Header from "./components/Header";
import Footer from "./components/Footer";
import PrefsPopover from "./components/PrefsPopover";
import AcctPopover from "./components/AcctPopover";
import Scanner from "./components/Scanner";
import ScanInfo from "./components/ScanInfo";
import Assistant from "./components/Assistant";

import Landing from "./pages/Landing";
import Signin from "./pages/Signin";
import Dashboard from "./pages/Dashboard";
import Catalogue from "./pages/Catalogue";
import AssessmentRunner from "./pages/AssessmentRunner";
import Scoring from "./pages/Scoring";
import Result from "./pages/Result";
import LearningPath from "./pages/LearningPath";
import AssessmentsHub from "./pages/AssessmentsHub";
import TrainerUpload from "./pages/TrainerUpload";
import TrainerStudio from "./pages/TrainerStudio";
import TrainerSessions from "./pages/TrainerSessions";
import AdminReports from "./pages/AdminReports";
import AdminAnalytics from "./pages/AdminAnalytics";
import SystemReference from "./pages/SystemReference";

const START_ROLE = "guest"; // guest | learner | trainer | admin

const initialState = {
  role: START_ROLE !== "guest" ? START_ROLE : null,
  loginTab: START_ROLE !== "guest" ? START_ROLE : "learner",
  screen: START_ROLE === "guest" ? "landing"
    : START_ROLE === "learner" ? "ldash"
    : START_ROLE === "trainer" ? "tstudio" : "oanalytics",
  target: 2, assessed: false, cursor: 0, answers: {}, essay: "",
  catDomain: "All", catSource: "All",
  lang: "EN", scale: 1, contrast: false,
  scanner: false, scanInfo: false, assistant: false,
  prefs: false, acct: false,
  genCount: "20", genCourse: 1, genLang: "English",
  // Real upload/generation state (Step 2 of the frontend/backend integration) — replaces the old
  // fake `generated` flag + setTimeout simulation.
  uploadFile: null, uploadStatus: "idle", uploadedDoc: null, uploadError: null,
  generateStatus: "idle", generateResult: null, generateError: null,
  session: 0,
};

function levels(state) {
  const out = {};
  D.forEach((d) => {
    let sum = 0, n = 0;
    ITEMS.filter((i) => i.domain === d).forEach((it) => {
      if (it.essay) {
        const w = state.essay.trim() ? state.essay.trim().split(/\s+/).length : 0;
        if (w > 0) { sum += w < 40 ? 2.2 : w < 110 ? 3.4 : w < 260 ? 4.3 : 4.0; n++; }
      } else {
        const a = state.answers[it.id];
        if (a !== undefined) { sum += it.options[a][2]; n++; }
      }
    });
    out[d] = n ? Math.min(5, sum / n) : 0;
  });
  return out;
}

export default function App() {
  const [state, setStateRaw] = useState(initialState);
  const setState = (patch) => {
    setStateRaw((prev) => ({ ...prev, ...(typeof patch === "function" ? patch(prev) : patch) }));
  };

  const st = state;
  const L = LOGIN[st.role || st.loginTab];
  const t = TARGETS[st.target];
  const lv = levels(st);
  const go = (s) => () => setState({ screen: s });

  const nav = st.role === "learner"
    ? [["ldash", "Dashboard"], ["lcat", "Courses"], ["lpath", "Learning path"], ["lassess", "Assessments"]]
    : st.role === "trainer"
      ? [["tupload", "Upload & generate"], ["tstudio", "Review items"], ["tsessions", "Sessions & QR"]]
      : st.role === "admin"
        ? [["oanalytics", "Workforce analytics"], ["oreports", "Reports"]]
        : [["landing", "Overview"], ["lcat", "Course catalogue"]];
  const navItems = nav.map((n) => {
    const on = st.screen === n[0];
    return { label: n[1], go: go(n[0]), bg: "transparent", underline: on ? "#F58220" : "transparent", fg: on ? "#123E7C" : "#3B424E", weight: on ? "700" : "500" };
  });

  const answeredCount = ITEMS.filter((i) => (i.essay ? st.essay.trim().length > 0 : st.answers[i.id] !== undefined)).length;
  const cx = 220, cy = 210, R = 150;
  const pt = (i, v) => {
    const f = (v / 5) * R;
    return i === 0 ? cx + "," + (cy - f) : i === 1 ? (cx + f) + "," + cy : i === 2 ? cx + "," + (cy + f) : (cx - f) + "," + cy;
  };
  const curPoints = D.map((d, i) => pt(i, lv[d])).join(" ");
  const reqPoints = D.map((d, i) => pt(i, t.req[i])).join(" ");
  const gapVals = D.map((d, i) => Math.max(0, t.req[i] - lv[d]));
  const gapIndexNum = gapVals.reduce((a, b) => a + b, 0) / 4;
  const meanLevelNum = D.reduce((a, d) => a + lv[d], 0) / 4;

  const domainCards = D.map((d, i) => {
    const g = gapVals[i];
    return {
      label: d === "Digital Governance" ? "Digital Governance" : d,
      color: DOM[d].color, cur: lv[d].toFixed(1), req: t.req[i].toFixed(1),
      gapColor: g >= 1.2 ? "#9A3412" : g > 0.4 ? "#B45309" : "#166534",
      gapText: g <= 0.15 ? "At required level" : "Gap of " + g.toFixed(1) + " to close",
    };
  });

  const subGaps = [];
  D.forEach((d, di) => SUBS[d].forEach((name, si) => {
    const level = Math.max(0.5, Math.min(5, lv[d] + SUBOFF[d][si]));
    const req = Math.min(5, t.req[di] + 0.1);
    subGaps.push({ name, domain: d, level, req, gap: req - level });
  }));
  subGaps.sort((a, b) => b.gap - a.gap);
  const topGaps = subGaps.slice(0, 6);
  const gaps = topGaps.map((g, i) => ({
    rank: String(i + 1).padStart(2, "0"), name: g.name, domain: DOM[g.domain].label,
    gap: g.gap.toFixed(1), readout: g.level.toFixed(1) + " / " + g.req.toFixed(1),
    barPct: Math.max(4, Math.min(100, g.gap / 3 * 100)).toFixed(0) + "%",
    color: DOM[g.domain].color, tint: DOM[g.domain].tint, border: DOM[g.domain].border,
  }));

  const pathGaps = [];
  topGaps.forEach((g) => { if (pathGaps.length < 2 && !pathGaps.some((p) => p.domain === g.domain)) pathGaps.push(g); });
  const stages = STAGE_META.map((m, si) => ({
    n: String(si + 1), title: m.title, gate: m.gate,
    accent: si === 0 ? "#1B5CB8" : si === 1 ? "#E9761B" : "#F58220",
    items: pathGaps.map((g) => {
      const it = (SKILLPATH[g.name] || SKILLPATH["Sampling methodology"])[si];
      return Object.assign({}, SRC[it.src], {
        title: it.title, duration: it.duration, format: it.format, match: it.match,
        why: si === 0
          ? "Entry point for your " + g.name + " gap (assessed " + g.level.toFixed(1) + " against " + g.req.toFixed(1) + " required)."
          : si === 1
            ? "Applies " + g.name + " to live survey work; assumes Stage 1 is complete."
            : "Consolidates " + g.name + " to the level " + t.name + " requires.",
      });
    }),
  }));
  const stageHeads = STAGE_META.map((m, si) => ({
    n: String(si + 1), phase: m.phase, title: m.title, note: m.note,
    meta: stages[si].items.length + " items · " + (si === 0 ? "start now" : si === 1 ? "next quarter" : "within 12 months"),
    dotBg: si === 0 ? "#123E7C" : "#fff", dotFg: si === 0 ? "#fff" : "#123E7C", dotBorder: si === 0 ? "#123E7C" : "#C9CFD8",
  }));

  const recSkills = topGaps.slice(0, 3).map((g) => g.name);
  const catFiltered = CATALOGUE.filter((c) =>
    (st.catDomain === "All" || c.domain === st.catDomain) &&
    (st.catSource === "All" || c.src === st.catSource));
  const courses = catFiltered.map((c) => {
    const rec = st.assessed && recSkills.indexOf(c.skill) >= 0;
    const g = topGaps.find((x) => x.name === c.skill);
    return Object.assign({}, SRC[c.src], {
      title: c.title, duration: c.duration, format: c.format, level: c.level, meta: c.meta,
      domain: DOM[c.domain].label, domColor: DOM[c.domain].color, domTint: DOM[c.domain].tint, domBorder: DOM[c.domain].border,
      recommended: rec,
      recNote: rec && g ? "Recommended for you — closes your " + g.name + " gap (" + g.level.toFixed(1) + " of " + g.req.toFixed(1) + " required)" : "",
      cardBorder: rec ? "#123E7C" : "#D9DDE4",
      cta: st.role ? (c.src === "iGOT" ? "Enrol on iGOT" : "Apply for intake") : "Sign in to enrol",
      onCta: st.role ? () => {} : go("signin"),
    });
  });
  const catChip = (k) => ({
    bg: st.catDomain === k ? "#123E7C" : "#fff", fg: st.catDomain === k ? "#fff" : "#3B424E",
    border: st.catDomain === k ? "#123E7C" : "#C9CFD8",
  });
  const srcChip = (k) => ({
    bg: st.catSource === k ? "#123E7C" : "#fff", fg: st.catSource === k ? "#fff" : "#3B424E",
    border: st.catSource === k ? "#123E7C" : "#C9CFD8",
  });
  const cAll = catChip("All"), cS = catChip("Statistical"), cT = catChip("Technical"), cD = catChip("Digital Governance"), cB = catChip("Behavioural");
  const sAll = srcChip("All"), sI = srcChip("iGOT"), sN = srcChip("NSSTA");

  const item = ITEMS[st.cursor];
  const setAnswer = (id, idx) => setState((s) => ({ answers: Object.assign({}, s.answers, { [id]: idx }) }));
  const itemOptions = (item.options || []).map((o, i) => {
    const on = st.answers[item.id] === i;
    return {
      key: o[0], text: o[1], pick: () => setAnswer(item.id, i),
      border: on ? "2px solid #123E7C" : "1px solid #DDE1E7", bg: on ? "#E8F0FA" : "#fff", keyFg: on ? "#123E7C" : "#7A8492",
    };
  });
  const itemNav = ITEMS.map((it, i) => {
    const done = it.essay ? st.essay.trim().length > 0 : st.answers[it.id] !== undefined;
    return {
      no: String(i + 1).padStart(2, "0"), label: it.skill, go: () => setState({ cursor: i }),
      border: i === st.cursor ? "1px solid #123E7C" : "1px solid #EEF0F3", bg: i === st.cursor ? "#E8F0FA" : "#fff",
      weight: i === st.cursor ? "700" : "400", dot: done ? "#166534" : "#DDE1E7",
    };
  });
  const review = ITEMS.map((it, i) => {
    if (it.essay) {
      const w = st.essay.trim() ? st.essay.trim().split(/\s+/).length : 0;
      const sc = w === 0 ? 0 : w < 40 ? 2.2 : w < 110 ? 3.4 : w < 260 ? 4.3 : 4.0;
      return {
        no: String(i + 1).padStart(2, "0"), skill: it.skill, stem: it.stem, explain: it.explain,
        domain: DOM[it.domain].label, domColor: DOM[it.domain].color, domTint: DOM[it.domain].tint, domBorder: DOM[it.domain].border,
        verdict: w === 0 ? "Not answered" : "Scored " + sc.toFixed(1) + " / 5",
        verdictColor: w === 0 ? "#991B1B" : sc >= 4 ? "#166534" : "#9A3412",
        verdictBg: w === 0 ? "#FBECEC" : sc >= 4 ? "#EBF5EE" : "#FDF0E4",
        yours: w === 0 ? "—" : st.essay.slice(0, 220) + (st.essay.length > 220 ? "…" : ""),
        best: "Verify the estimate internally → inform the release-calendar authority and the state DES → offer a joint methodological reconciliation → publicly confirm only the method and the reconciliation date, never a rebuttal of the state.",
      };
    }
    const a = st.answers[it.id];
    const best = it.options.reduce((bi, o, oi) => (o[2] > it.options[bi][2] ? oi : bi), 0);
    const val = a === undefined ? 0 : it.options[a][2];
    return {
      no: String(i + 1).padStart(2, "0"), skill: it.skill, stem: it.stem, explain: it.explain,
      domain: DOM[it.domain].label, domColor: DOM[it.domain].color, domTint: DOM[it.domain].tint, domBorder: DOM[it.domain].border,
      verdict: a === undefined ? "Not answered" : a === best ? "Correct" : val >= 2.4 ? "Partially correct" : "Incorrect",
      verdictColor: a === undefined ? "#991B1B" : a === best ? "#166534" : val >= 2.4 ? "#9A3412" : "#991B1B",
      verdictBg: a === undefined ? "#FBECEC" : a === best ? "#EBF5EE" : val >= 2.4 ? "#FDF0E4" : "#FBECEC",
      yours: a === undefined ? "—" : it.options[a][0] + " · " + it.options[a][1],
      best: it.options[best][0] + " · " + it.options[best][1],
    };
  });

  // Question review data now lives entirely inside TrainerStudio.jsx (real fetch/approve/reject/
  // edit/create against the backend) — same self-contained-component pattern already used for
  // Footer.jsx's health check, rather than routing async backend state through this shared `v`
  // object the way the old mock data was.

  const heatRows = HEAT.map((r) => {
    const o = { name: r.name, count: r.count };
    r.vals.forEach((v, i) => {
      const band = RAMP[Math.min(4, Math.floor(v / 0.75))];
      o["c" + i] = v.toFixed(1); o["c" + i + "bg"] = band[0]; o["c" + i + "fg"] = band[1];
    });
    return o;
  });

  const tab = (k) => {
    const on = st.loginTab === k;
    return { fg: on ? "#fff" : "#41506B", border: on ? "#123E7C" : "#C9D6E8", bg: on ? "#123E7C" : "#fff", w: on ? "700" : "600" };
  };
  const tl = tab("learner"), tt = tab("trainer"), ta = tab("admin");
  const signIn = () => {
    const r = st.loginTab;
    setState({ role: r, acct: false, prefs: false, screen: r === "learner" ? "ldash" : r === "trainer" ? "tstudio" : "oanalytics" });
  };

  const v = {
    baseSize: (16 * st.scale).toFixed(1) + "px",
    contrastFilter: st.contrast ? "contrast(1.22) saturate(0.85)" : "none",
    isAuthed: !!st.role, isGuest: !st.role,
    navItems, userName: L.name, initials: L.initials, roleLabel: L.roleLabel, roleColor: L.color,
    userDesig: L.desig, userFirst: "Anandi",
    goHome: () => setState({ screen: st.role === "learner" ? "ldash" : st.role === "trainer" ? "tstudio" : st.role === "admin" ? "oanalytics" : "landing" }),
    goSignin: go("signin"), goCatalogue: go("lcat"), goSystem: go("system"),
    goDash: go("ldash"), goPath: go("lpath"), goAssess: go("lassess"), goReview: go("lresult"),
    goStudio: go("tstudio"), goUpload: go("tupload"),
    signOut: () => setState({ role: null, screen: "landing", acct: false, prefs: false, assistant: false }),
    openScanner: () => setState({ scanner: true }),
    closeScanner: () => setState({ scanner: false }),
    scannerOpen: st.scanner,
    openScanInfo: () => setState({ scanInfo: true }),
    closeScanInfo: () => setState({ scanInfo: false }),
    scanInfoOpen: st.scanInfo,
    assistantOpen: st.assistant,
    openAssistant: () => setState({ assistant: true }),
    closeAssistant: () => setState({ assistant: false }),
    assistLines: ASSIST,
    isLanding: st.screen === "landing", isSignin: st.screen === "signin",
    isDash: st.screen === "ldash", isCat: st.screen === "lcat", isPath: st.screen === "lpath",
    isAssess: st.screen === "lassess", isRunner: st.screen === "runner", isScoring: st.screen === "scoring",
    isResult: st.screen === "lresult", isUpload: st.screen === "tupload", isStudio: st.screen === "tstudio",
    isSessions: st.screen === "tsessions", isAnalytics: st.screen === "oanalytics",
    isReports: st.screen === "oreports", isSystem: st.screen === "system",
    isHindi: st.lang === "HI",
    assessed: st.assessed, notAssessed: !st.assessed,
    tabLearner: () => setState({ loginTab: "learner" }), tabTrainer: () => setState({ loginTab: "trainer" }), tabAdmin: () => setState({ loginTab: "admin" }),
    tabLFg: tl.fg, tabLBorder: tl.border, tabLW: tl.w, tabLBg: tl.bg,
    tabTFg: tt.fg, tabTBorder: tt.border, tabTW: tt.w, tabTBg: tt.bg,
    tabAFg: ta.fg, tabABorder: ta.border, tabAW: ta.w, tabABg: ta.bg,
    loginRoleTitle: L.title, loginRoleNote: L.note, loginRoleInitial: L.initial, loginRoleColor: L.color,
    loginIdLabel: L.idLabel, loginIdValue: L.idValue, doSignIn: signIn,
    onTargetSelect: (e) => setState({ target: parseInt(e.target.value, 10) }),
    targetIdx: String(st.target), targetName: t.name, targetTrack: t.track, targetNote: t.note,
    targetReqs: D.map((d, i) => ({ label: DOM[d].label, color: DOM[d].color, value: t.req[i].toFixed(1), pct: (t.req[i] / 5 * 100).toFixed(0) + "%" })),
    curPoints, reqPoints, domainCards, gaps, stages, stageHeads,
    gapIndex: gapIndexNum.toFixed(2),
    gapBand: gapIndexNum >= 1.3 ? "Significant" : gapIndexNum >= 0.6 ? "Moderate" : "Minor",
    gapBandColor: gapIndexNum >= 1.3 ? "#9A3412" : gapIndexNum >= 0.6 ? "#B45309" : "#166534",
    meanLevel: meanLevelNum.toFixed(1), assessedOn: "4 September 2026",
    firstStepTitle: stages[0].items[0].title,
    startAssessment: () => setState({ screen: "runner", cursor: 0 }),
    retakeAssessment: () => setState({ screen: "runner", cursor: 0, answers: {}, essay: "", assessed: false }),
    submitAssessment: () => { setState({ screen: "scoring" }); setTimeout(() => setState({ assessed: true, screen: "lresult" }), 1400); },
    itemNo: String(st.cursor + 1), itemTotal: String(ITEMS.length), answeredCount: String(answeredCount),
    runnerPct: (answeredCount / ITEMS.length * 100).toFixed(0) + "%",
    itemDomain: item.domain, itemColor: DOM[item.domain].color, itemTint: DOM[item.domain].tint, itemBorder: DOM[item.domain].border,
    itemKind: item.kind, itemSkill: item.skill, itemStem: item.stem,
    hasContext: !!item.context, itemContext: item.context || "",
    isEssayItem: !!item.essay, isChoiceItem: !item.essay, itemOptions, itemNav, review,
    essayText: st.essay, essayWords: String(st.essay.trim() ? st.essay.trim().split(/\s+/).length : 0),
    onEssay: (e) => setState({ essay: e.target.value }),
    prevItem: () => setState((s) => ({ cursor: Math.max(0, s.cursor - 1) })),
    nextItem: () => setState((s) => ({ cursor: Math.min(ITEMS.length - 1, s.cursor + 1) })),
    notLastItem: st.cursor < ITEMS.length - 1, isLastItem: st.cursor === ITEMS.length - 1,
    courses, courseCount: String(courses.length),
    catAllBg: cAll.bg, catAllFg: cAll.fg, catAllBorder: cAll.border,
    catSBg: cS.bg, catSFg: cS.fg, catSBorder: cS.border,
    catTBg: cT.bg, catTFg: cT.fg, catTBorder: cT.border,
    catDBg: cD.bg, catDFg: cD.fg, catDBorder: cD.border,
    catBBg: cB.bg, catBFg: cB.fg, catBBorder: cB.border,
    srcAllBg: sAll.bg, srcAllFg: sAll.fg, srcAllBorder: sAll.border,
    srcIBg: sI.bg, srcIFg: sI.fg, srcIBorder: sI.border,
    srcNBg: sN.bg, srcNFg: sN.fg, srcNBorder: sN.border,
    setCatAll: () => setState({ catDomain: "All" }),
    setCatS: () => setState({ catDomain: "Statistical" }),
    setCatT: () => setState({ catDomain: "Technical" }),
    setCatD: () => setState({ catDomain: "Digital Governance" }),
    setCatB: () => setState({ catDomain: "Behavioural" }),
    setSrcAll: () => setState({ catSource: "All" }),
    setSrcI: () => setState({ catSource: "iGOT" }),
    setSrcN: () => setState({ catSource: "NSSTA" }),
    inProgress: INPROGRESS.map((c) => Object.assign({}, SRC[c.src], c)),
    certs: CERTS, heatRows, effect: EFFECT, reports: REPORTS, flowSteps: FLOW,
    emerging: EMERGING.map((m) => Object.assign({}, DOM[m.domain], { name: m.name, delta: m.delta, domain: DOM[m.domain].label })),
    // Real document upload + generation (Step 2 of the frontend/backend integration).
    selectedFileName: st.uploadFile ? st.uploadFile.name : null,
    uploadStatus: st.uploadStatus, uploadedDoc: st.uploadedDoc, uploadError: st.uploadError,
    onFileChange: (e) => setState({ uploadFile: e.target.files[0] || null, uploadError: null, uploadStatus: "idle" }),
    canUpload: !!st.uploadFile && st.uploadStatus !== "uploading",
    doUpload: async () => {
      if (!st.uploadFile) return;
      setState({ uploadStatus: "uploading", uploadError: null });
      try {
        const doc = await uploadDocument(st.uploadFile);
        setState({ uploadStatus: "uploaded", uploadedDoc: doc, uploadFile: null });
      } catch (err) {
        setState({ uploadStatus: "error", uploadError: err.message });
      }
    },
    generateStatus: st.generateStatus, generateResult: st.generateResult, generateError: st.generateError,
    canGenerate: !!st.uploadedDoc && st.generateStatus !== "generating",
    doGenerate: async () => {
      if (!st.uploadedDoc) return;
      setState({ generateStatus: "generating", generateError: null, generateResult: null });
      try {
        const result = await generateForDocument(st.uploadedDoc.id);
        setState({ generateStatus: "done", generateResult: result });
      } catch (err) {
        setState({ generateStatus: "error", generateError: err.message });
      }
    },
    sessions: SESSIONS.map((s, i) => {
      const on = st.session === i;
      const sc = s.status === "Live" ? ["#166534", "#EBF5EE", "#BBDEC7"] : s.status === "Scheduled" ? ["#9A4A0B", "#FDF0E1", "#F3CFA6"] : ["#5A6472", "#F1F3F6", "#DDE1E7"];
      return Object.assign({}, SRC[s.src], {
        id: s.id, name: s.name, quiz: s.quiz, items: s.items, course: s.course, venue: s.venue, when: s.when, expires: s.expires,
        joined: s.joined + " of " + s.total + " joined", pct: Math.round(s.joined / s.total * 100) + "%",
        status: s.status, statusFg: sc[0], statusBg: sc[1], statusBorder: sc[2],
        qr: qr(72, s.seed), select: () => setState({ session: i }),
        cardBg: on ? "#F6FAFF" : "#fff", cardBorder: on ? "#1B5CB8" : "#E3E9F2",
        selectedLabel: on ? "Showing" : "Show QR",
      });
    }),
    sess: (() => {
      const s = SESSIONS[st.session];
      return Object.assign({}, SRC[s.src], {
        id: s.id, name: s.name, quiz: s.quiz, items: s.items, course: s.course, venue: s.venue, when: s.when,
        expires: s.expires, joined: s.joined + " of " + s.total, pct: Math.round(s.joined / s.total * 100) + "%",
        status: s.status, qr: qr(196, s.seed),
      });
    })(),
    genCourseTitle: CATALOGUE[st.genCourse].title,
    genCourseSrc: SRC[CATALOGUE[st.genCourse].src].source,
    genCourseIdx: String(st.genCourse),
    courseOptions: CATALOGUE.map((c, i) => ({ i: String(i), title: c.title })),
    onGenCourse: (e) => setState({ genCourse: parseInt(e.target.value, 10) }),
    genCount: st.genCount,
    onGenCount: (e) => setState({ genCount: e.target.value.replace(/[^0-9]/g, "").slice(0, 3) }),
    setCount10: () => setState({ genCount: "10" }),
    setCount20: () => setState({ genCount: "20" }),
    setCount30: () => setState({ genCount: "30" }),
    c10Bg: st.genCount === "10" ? "#123E7C" : "#fff", c10Fg: st.genCount === "10" ? "#fff" : "#123E7C",
    c20Bg: st.genCount === "20" ? "#123E7C" : "#fff", c20Fg: st.genCount === "20" ? "#fff" : "#123E7C",
    c30Bg: st.genCount === "30" ? "#123E7C" : "#fff", c30Fg: st.genCount === "30" ? "#fff" : "#123E7C",
    genLang: st.genLang, onGenLang: (e) => setState({ genLang: e.target.value }),
    qrSmall: qr(96, 7717), qrMid: qr(130, 7717), qrLarge: qr(220, 7717),
    lang: st.lang,
    onLangSelect: (e) => setState({ lang: e.target.value }),
    textUp: () => setState({ scale: 1.25 }),
    textReset: () => setState({ scale: 1 }),
    textDown: () => setState({ scale: 0.92 }),
    sizeSmBg: st.scale < 1 ? "#123E7C" : "#fff", sizeSmFg: st.scale < 1 ? "#fff" : "#123E7C",
    sizeMdBg: st.scale >= 1 && st.scale < 1.2 ? "#123E7C" : "#fff", sizeMdFg: st.scale >= 1 && st.scale < 1.2 ? "#fff" : "#123E7C",
    sizeLgBg: st.scale >= 1.2 ? "#123E7C" : "#fff", sizeLgFg: st.scale >= 1.2 ? "#fff" : "#123E7C",
    langShort: st.lang,
    prefsOpen: st.prefs, acctOpen: st.acct,
    togglePrefs: () => setState((s) => ({ prefs: !s.prefs, acct: false })),
    toggleAcct: () => setState((s) => ({ acct: !s.acct, prefs: false })),
    closePopovers: () => setState({ prefs: false, acct: false }),
    prefsBg: st.prefs ? "#123E7C" : "#fff", prefsFg: st.prefs ? "#fff" : "#123E7C",
    prefsBorder: st.prefs ? "#123E7C" : "#C9CFD8",
    acctBorder: st.acct ? "#123E7C" : "transparent",
    contrastState: st.contrast ? "on" : "off",
    toggleContrast: () => setState((s) => ({ contrast: !s.contrast })),
    contrastBtnBg: st.contrast ? "#123E7C" : "#fff",
    contrastBtnFg: st.contrast ? "#fff" : "#123E7C",
    contrastBorder: st.contrast ? "#123E7C" : "#C9CFD8",
  };

  return (
    <div style={css(`min-height:100vh; display:flex; flex-direction:column; font-size:${v.baseSize}; filter:${v.contrastFilter}`)}>
      <Header v={v} />
      <main id="main" style={css("flex:1; width:100%")}>
        <div style={css("max-width:1500px; margin:0 auto; padding:0 32px 72px")}>
          {v.isLanding && <Landing v={v} />}
          {v.isSignin && <Signin v={v} />}
          {v.isDash && <Dashboard v={v} />}
          {v.isCat && <Catalogue v={v} />}
          {v.isRunner && <AssessmentRunner v={v} />}
          {v.isScoring && <Scoring v={v} />}
          {v.isResult && <Result v={v} />}
          {v.isPath && <LearningPath v={v} />}
          {v.isAssess && <AssessmentsHub v={v} />}
          {v.isUpload && <TrainerUpload v={v} />}
          {v.isStudio && <TrainerStudio v={v} />}
          {v.isSessions && <TrainerSessions v={v} />}
          {v.isReports && <AdminReports v={v} />}
          {v.isAnalytics && <AdminAnalytics v={v} />}
          {v.isSystem && <SystemReference v={v} />}
        </div>
      </main>

      {v.prefsOpen && <PrefsPopover v={v} />}
      {v.acctOpen && <AcctPopover v={v} />}
      {v.scannerOpen && <Scanner v={v} />}
      {v.scanInfoOpen && <ScanInfo v={v} />}
      {v.assistantOpen && <Assistant v={v} />}

      <Footer v={v} />
    </div>
  );
}
