import { useRef, useState } from "react";
import { css } from "./lib/css";
import { qr } from "./components/QrCode";
import { uploadDocument, generateForDocument, api, assistantChat, assistantTranscribe, assistantSpeak } from "./lib/api";
import LiveAssessmentRunner from "./pages/LiveAssessmentRunner";
import { buildLocalDiagnostic, scoreLocalDiagnostic, scoreLocalSimulation, LOCAL_SIMULATION } from "./lib/localAssessments";
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
  // Real diagnostic-attempt flow (the one real assessment endpoint that exists — see
  // MCQ_CONTRACT_PROPOSAL.md / the Phase-3-was-replaced context). authToken/authUser come from a
  // real POST /api/auth/login call made at sign-in time using the seeded demo credentials for
  // whichever role tab is selected — the rest of the app stays the pre-existing mock either way.
  authToken: null, authUser: null, authError: null, authBusy: false,
  diagAssessment: null, diagLoadError: null, diagLoading: false,
  attempt: null, attemptAnswers: {}, runnerCursor: 0,
  attemptSubmitting: false, attemptSubmitError: null, attemptResult: null,
  // Second real assessment (the situation simulation) — same pattern as the diagnostic fields
  // above, kept separate since a learner can be mid-diagnostic and mid-simulation independently.
  simulationDone: false, simAssessment: null, simAttemptId: null,
  simLoading: false, simLoadError: null,
  // Real assistant conversation (text + speech, Sarvam) — same real-state pattern as the
  // upload/generate fields above. assistTurns holds live {q,a} pairs, appended after the
  // static ASSIST seed lines from data.js rather than replacing them.
  assistTurns: [], assistInput: "", assistBusy: false, assistError: null,
  assistRecording: false, assistTranscribing: false, assistPlayingIdx: null, assistSpeechLang: null,
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
  // Imperative mic-recording state — a ref, not React state, since neither the recorder instance
  // nor its accumulating audio chunks should trigger a render on their own.
  const recorderRef = useRef(null);
  const audioChunksRef = useRef([]);

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
  // Seeded demo accounts (backend/prisma/seed/index.ts: "3 demo users, password: password123").
  // The mock sign-in screen has no real email/password inputs (they're readonly placeholders), so
  // this maps the selected role tab straight to its matching seeded account rather than adding
  // real credential fields to a screen that's otherwise still the design-fidelity mock.
  const DEMO_LOGIN_EMAIL = { learner: "learner@kartavya.gov.in", trainer: "trainer@kartavya.gov.in", admin: "admin@kartavya.gov.in" };
  const signIn = () => {
    const r = st.loginTab;
    const mockLandingScreen = r === "learner" ? "ldash" : r === "trainer" ? "tstudio" : "oanalytics";
    // No backend deployed yet for this prototype (frontend-only phase) — always land the demo on
    // its screen instead of dead-ending on a login error. When a real backend IS reachable, this
    // still authenticates for real and layers live data on top; when it isn't, it falls back to
    // exactly the same polished, fully-functional local-mock experience the app always had.
    api.login(DEMO_LOGIN_EMAIL[r], "password123")
      .then(({ token, user }) => {
        setState({
          role: r, acct: false, prefs: false, screen: mockLandingScreen,
          authToken: token, authUser: user, authError: null,
        });
        loadEmployeeDashboard(token);
        if (r === "learner") checkSimulationStatus(token);
      })
      .catch(() => {
        setState({ role: r, acct: false, prefs: false, screen: mockLandingScreen, authToken: null, authUser: null, authError: null });
      });
  };

  // Second half of the "two kinds of tests" onboarding: a situation simulation, alongside the MCQ
  // diagnostic above. Checked once at login (so a learner who already completed it isn't asked
  // again) via the same GET /api/attempts/mine the QR-join gate uses, and updated locally once a
  // simulation attempt is actually submitted in this session.
  const checkSimulationStatus = (token) => {
    api.getMyAttempts(token)
      .then((attempts) => {
        const done = attempts.some((a) => a.status === "submitted" && a.assessment.type === "simulation");
        setState({ simulationDone: done });
      })
      .catch(() => {});
  };

  // No-auth, no-backend fallback: whenever there's no token (this prototype phase has no backend
  // deployed at all), both assessments run entirely client-side against localAssessments.js
  // instead of erroring out with "Not signed in." — same UI, same screens, real backend used
  // instead the moment one is actually reachable (see signIn() above).
  const startSimulation = () => {
    const token = st.authToken;
    setState({ screen: "real-simulation", simLoadError: null, simLoading: true, simAssessment: null, simAttemptId: null });
    if (!token) {
      const localAssessment = { type: "simulation", title: LOCAL_SIMULATION.title, isProctored: false, scenario: LOCAL_SIMULATION };
      setState({ simAssessment: localAssessment, simAttemptId: "local", simLoading: false });
      return;
    }
    api.getDefaultSimulation(token)
      .then((assessment) => api.startAttempt(token, assessment.id).then((attempt) => ({ assessment, attempt })))
      .then(({ assessment, attempt }) => setState({ simAssessment: assessment, simAttemptId: attempt.id, simLoading: false }))
      .catch((err) => setState({ simLoading: false, simLoadError: err.message }));
  };

  const onSimulationSubmitted = (result) => {
    // Result.jsx is diagnostic-shaped (per-question results[]), which a simulation doesn't have —
    // it still renders sensibly off just perDomainScore/perSubSkillScore/score, so it's reused
    // here rather than building a second results page for one extra assessment type.
    setState({ simulationDone: true, attemptResult: result, screen: "lresult" });
    if (st.authToken) loadEmployeeDashboard(st.authToken); // simulation feeds competency scores too
  };

  // Real diagnostic-attempt flow. GET /api/assessments/diagnostic + POST /api/attempts (which
  // resumes an in_progress attempt or creates a fresh one — the backend has no separate "retake"
  // endpoint, calling this again after a submitted attempt just makes a new one).
  const startDiagnostic = () => {
    const token = st.authToken;
    setState({
      screen: "runner", runnerCursor: 0, attemptAnswers: {}, attemptResult: null,
      attemptSubmitError: null, diagLoadError: null, diagLoading: true,
    });
    if (!token) {
      setState({ diagAssessment: buildLocalDiagnostic(), attempt: { id: "local" }, diagLoading: false });
      return;
    }
    api.getDiagnostic(token)
      .then((assessment) => {
        setState({ diagAssessment: assessment, diagLoading: false });
        return api.startAttempt(token, assessment.id);
      })
      .then((attempt) => setState({ attempt }))
      .catch((err) => setState({ diagLoading: false, diagLoadError: err.message }));
  };

  // There is no per-answer save endpoint (see the confirmed API surface) — answers accumulate
  // here in local state and go out in one shot on final submit.
  const selectDiagAnswer = (questionId, selectedIndex) =>
    setState((s) => ({ attemptAnswers: { ...s.attemptAnswers, [questionId]: selectedIndex } }));

  const submitDiagnostic = () => {
    const token = st.authToken;
    const attemptId = st.attempt?.id;
    if (!attemptId) return;
    const answers = Object.entries(st.attemptAnswers).map(([questionId, selectedIndex]) => ({ questionId, selectedIndex }));
    setState({ attemptSubmitting: true, attemptSubmitError: null, screen: "scoring" });

    if (!token) {
      const result = scoreLocalDiagnostic(st.diagAssessment, st.attemptAnswers);
      setTimeout(() => setState({ attemptSubmitting: false, attemptResult: result, screen: "lresult" }), 1000);
      return;
    }

    api.submitAttempt(token, attemptId, answers)
      .then((result) => {
        setState({ attemptSubmitting: false, attemptResult: result, screen: "lresult" });
        loadEmployeeDashboard(token); // refresh the real gap map with this attempt's blended scores
        // submitAttempt's own response doesn't embed the assessment (no correctIndex) — the
        // revealed shape only comes back from GET /api/attempts/:id once status !== in_progress.
        // Follow up to get it so Result.jsx can show the correct answer even when a question has
        // no explanations (true for all current stub content). Best-effort: if this follow-up
        // fails, results just falls back to the pre-submission (redacted) question copy rather
        // than failing the submission itself.
        api.getAttempt(token, attemptId)
          .then((attempt) => {
            if (attempt?.assessment?.questions) setState({ diagAssessment: attempt.assessment });
          })
          .catch(() => {});
      })
      .catch((err) => setState({ attemptSubmitting: false, attemptSubmitError: err.message, screen: "runner" }));
  };

  // Real GET /api/dashboards/employee — replaces the frozen mock gap map (Dashboard.jsx) with
  // getGapMap()'s persistent, role-requirement-based computation, itself fed by
  // UserCompetencyScore rows that feedCompetencyScores() blends in on every real submitted
  // attempt. Called once after login and again after every real submission so the numbers are
  // never more than one action stale.
  const loadEmployeeDashboard = (token) => {
    api.getEmployeeDashboard(token)
      .then((dash) => setState({ employeeDashboard: dash, employeeDashboardError: null }))
      .catch((err) => setState({ employeeDashboard: null, employeeDashboardError: err.message }));
  };

  // getGapMap()'s domain/current/required/gap are on a 0-100 scale (UserCompetencyScore.level /
  // RoleCompetencyRequirement.requiredLevel); the existing radar chart + domain cards were built
  // for 0-5 (R=150 radius, "X.X" formatting). Dividing by 20 is a pure unit conversion — it
  // preserves every ratio/relative-gap exactly, just recalibrates to the chart's existing scale
  // rather than reworking the SVG geometry for a 0-100 axis.
  const REAL_SCALE = 20;
  // "Behavioural" (this app's canonical 4-domain key, used by the SVG's fixed corner order and
  // DOM/SUBS lookups) vs "Behavioural/Managerial" (the real seeded CompetencyDomain name) — same
  // domain, different string, only mismatch between the two naming schemes.
  const REAL_DOMAIN_NAME = { Statistical: "Statistical", Technical: "Technical", "Digital Governance": "Digital Governance", Behavioural: "Behavioural/Managerial" };
  const realGapMap = st.employeeDashboard?.gapMap ?? [];
  const realGapMapByDomain = Object.fromEntries(realGapMap.map((g) => [g.domain, g]));
  const realDomainGap = (mockDomainName) => realGapMapByDomain[REAL_DOMAIN_NAME[mockDomainName]] ?? { current: 0, required: 0, gap: 0 };

  const realCurPoints = D.map((d, i) => pt(i, realDomainGap(d).current / REAL_SCALE)).join(" ");
  const realReqPoints = D.map((d, i) => pt(i, realDomainGap(d).required / REAL_SCALE)).join(" ");
  const realDomainCards = D.map((d) => {
    const rg = realDomainGap(d);
    const cur = rg.current / REAL_SCALE, req = rg.required / REAL_SCALE, g = rg.gap / REAL_SCALE;
    return {
      label: d, color: DOM[d].color, cur: cur.toFixed(1), req: req.toFixed(1),
      gapColor: g >= 1.2 ? "#9A3412" : g > 0.4 ? "#B45309" : "#166534",
      gapText: g <= 0.15 ? "At required level" : "Gap of " + g.toFixed(1) + " to close",
    };
  });
  const realGapIndexNum = D.reduce((sum, d) => sum + realDomainGap(d).gap / REAL_SCALE, 0) / 4;

  const realSubGaps = realGapMap.flatMap((dg) =>
    dg.subSkills.map((s) => ({ ...s, mockDomainKey: Object.keys(REAL_DOMAIN_NAME).find((k) => REAL_DOMAIN_NAME[k] === dg.domain) ?? dg.domain })),
  );
  realSubGaps.sort((a, b) => b.gap - a.gap);
  const realGaps = realSubGaps.slice(0, 6).map((s, i) => {
    const domMeta = DOM[s.mockDomainKey] ?? { color: "#5A6472", tint: "#F1F3F6", border: "#DDE1E7", label: s.domain };
    return {
      rank: String(i + 1).padStart(2, "0"), name: s.subSkill, domain: domMeta.label ?? s.domain,
      gap: (s.gap / REAL_SCALE).toFixed(1), readout: (s.current / REAL_SCALE).toFixed(1) + " / " + (s.required / REAL_SCALE).toFixed(1),
      barPct: Math.max(4, Math.min(100, (s.gap / REAL_SCALE) / 3 * 100)).toFixed(0) + "%",
      color: domMeta.color, tint: domMeta.tint, border: domMeta.border,
    };
  });
  // "Assessed" now means "has a real submitted/kicked attempt on record" — gapMap itself is
  // always non-empty once a target role is set (current defaults to 0 per sub-skill), so it can't
  // be used as the "have they actually taken anything" signal.
  // With no backend (this prototype phase), employeeDashboard never loads — "assessed" instead
  // reflects the local, in-session mock diagnostic result so the dashboard still unlocks properly.
  const realAssessed = (st.employeeDashboard?.progressHistory?.length ?? 0) > 0 || (!st.authToken && !!st.attemptResult);
  const realTargetRoleTitle = st.employeeDashboard?.targetRole?.title ?? t.name;
  const realProgressHistory = st.employeeDashboard?.progressHistory ?? [];
  const realLastSubmittedAt = realProgressHistory.length
    ? realProgressHistory[realProgressHistory.length - 1].submittedAt
    : null;
  const realAssessedOn = realLastSubmittedAt
    ? new Date(realLastSubmittedAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })
    : "—";

  // --- Assistant: text + speech (Sarvam) --------------------------------
  const doAssistSend = async () => {
    const text = st.assistInput.trim();
    if (!text || st.assistBusy) return;
    setState({ assistBusy: true, assistError: null, assistInput: "" });
    // Flatten prior turns into the {role, content} pairs the backend expects — each past turn
    // contributes both sides of the exchange, in order.
    const history = st.assistTurns.flatMap((turn) => [
      { role: "user", content: turn.q },
      { role: "assistant", content: turn.a },
    ]);
    try {
      const { reply } = await assistantChat(text, history);
      setState((s) => ({ assistTurns: [...s.assistTurns, { q: text, a: reply }], assistBusy: false }));
    } catch (err) {
      setState({ assistBusy: false, assistError: err.message, assistInput: text });
    }
  };

  const doAssistVoiceToggle = async () => {
    if (st.assistRecording) {
      recorderRef.current?.stop(); // onstop below does the rest
      return;
    }
    setState({ assistError: null });
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      audioChunksRef.current = [];
      recorder.ondataavailable = (e) => { if (e.data.size > 0) audioChunksRef.current.push(e.data); };
      recorder.onstop = async () => {
        stream.getTracks().forEach((track) => track.stop());
        setState({ assistRecording: false, assistTranscribing: true });
        const blob = new Blob(audioChunksRef.current, { type: recorder.mimeType || "audio/webm" });
        try {
          const { transcript, languageCode } = await assistantTranscribe(blob);
          setState({ assistTranscribing: false, assistInput: transcript, assistSpeechLang: languageCode || null });
        } catch (err) {
          setState({ assistTranscribing: false, assistError: err.message });
        }
      };
      recorderRef.current = recorder;
      recorder.start();
      setState({ assistRecording: true });
    } catch (err) {
      setState({ assistError: "Microphone unavailable: " + err.message });
    }
  };

  const doPlayReply = async (idx, text) => {
    if (st.assistPlayingIdx === idx) return;
    setState({ assistPlayingIdx: idx, assistError: null });
    try {
      const blob = await assistantSpeak(text, st.assistSpeechLang || undefined);
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      audio.onended = () => { setState({ assistPlayingIdx: null }); URL.revokeObjectURL(url); };
      audio.onerror = () => { setState({ assistPlayingIdx: null, assistError: "Could not play the reply." }); URL.revokeObjectURL(url); };
      await audio.play();
    } catch (err) {
      setState({ assistPlayingIdx: null, assistError: err.message });
    }
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
    // Seed demo lines first, then real conversation appended below them.
    // Seed demo lines first, then real conversation appended below them. Every line — seed or
    // real — can be synthesized on demand; TTS doesn't care where the text came from.
    assistLines: [...ASSIST, ...st.assistTurns].map((turn, i) => ({
      q: turn.q, a: turn.a,
      isPlaying: st.assistPlayingIdx === i,
      onPlay: () => doPlayReply(i, turn.a),
    })),
    assistInput: st.assistInput,
    onAssistInput: (e) => setState({ assistInput: e.target.value }),
    onAssistKeyDown: (e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); doAssistSend(); } },
    onAssistSend: doAssistSend,
    canAssistSend: st.assistInput.trim().length > 0 && !st.assistBusy,
    assistBusy: st.assistBusy,
    assistRecording: st.assistRecording,
    assistTranscribing: st.assistTranscribing,
    onAssistVoiceToggle: doAssistVoiceToggle,
    assistVoiceLabel: st.assistRecording ? "Stop" : st.assistTranscribing ? "Transcribing…" : "Voice",
    assistError: st.assistError,
    isLanding: st.screen === "landing", isSignin: st.screen === "signin",
    isDash: st.screen === "ldash", isCat: st.screen === "lcat", isPath: st.screen === "lpath",
    isAssess: st.screen === "lassess", isRunner: st.screen === "runner", isScoring: st.screen === "scoring",
    isResult: st.screen === "lresult", isUpload: st.screen === "tupload", isStudio: st.screen === "tstudio",
    isSessions: st.screen === "tsessions", isAnalytics: st.screen === "oanalytics",
    isReports: st.screen === "oreports", isSystem: st.screen === "system",
    isRealSimulation: st.screen === "real-simulation",
    needsSimulation: !st.simulationDone,
    startSimulation, simLoading: st.simLoading, simLoadError: st.simLoadError,
    isHindi: st.lang === "HI",
    assessed: realAssessed, notAssessed: !realAssessed,
    tabLearner: () => setState({ loginTab: "learner" }), tabTrainer: () => setState({ loginTab: "trainer" }), tabAdmin: () => setState({ loginTab: "admin" }),
    tabLFg: tl.fg, tabLBorder: tl.border, tabLW: tl.w, tabLBg: tl.bg,
    tabTFg: tt.fg, tabTBorder: tt.border, tabTW: tt.w, tabTBg: tt.bg,
    tabAFg: ta.fg, tabABorder: ta.border, tabAW: ta.w, tabABg: ta.bg,
    loginRoleTitle: L.title, loginRoleNote: L.note, loginRoleInitial: L.initial, loginRoleColor: L.color,
    loginIdLabel: L.idLabel, loginIdValue: L.idValue,
    doSignIn: signIn, signInBusy: st.authBusy, signInError: st.authError,
    signInLabel: st.authBusy ? "Signing in…" : "Login",
    onTargetSelect: (e) => setState({ target: parseInt(e.target.value, 10) }),
    targetIdx: String(st.target), targetName: t.name, targetTrack: t.track, targetNote: t.note,
    targetReqs: D.map((d, i) => ({ label: DOM[d].label, color: DOM[d].color, value: t.req[i].toFixed(1), pct: (t.req[i] / 5 * 100).toFixed(0) + "%" })),
    curPoints: realCurPoints, reqPoints: realReqPoints, domainCards: realDomainCards, gaps: realGaps, stages, stageHeads,
    gapIndex: realGapIndexNum.toFixed(2),
    gapBand: realGapIndexNum >= 1.3 ? "Significant" : realGapIndexNum >= 0.6 ? "Moderate" : "Minor",
    gapBandColor: realGapIndexNum >= 1.3 ? "#9A3412" : realGapIndexNum >= 0.6 ? "#B45309" : "#166534",
    realTargetRoleTitle,
    employeeDashboardError: st.employeeDashboardError,
    meanLevel: meanLevelNum.toFixed(1), assessedOn: realAssessedOn,
    firstStepTitle: stages[0].items[0].title,
    // Real diagnostic flow (replaces the old fake ITEMS-based startAssessment/retakeAssessment/
    // submitAssessment). Dashboard now reads live data from GET /api/dashboards/employee, refreshed
    // after login and after every submission, so st.answers/st.essay no longer affect learner views.
    startDiagnostic, submitDiagnostic,
    diagLoading: st.diagLoading, diagLoadError: st.diagLoadError,
    diagQuestions: st.diagAssessment?.questions ?? [],
    diagCursor: st.runnerCursor,
    diagAnswers: st.attemptAnswers,
    selectDiagAnswer,
    diagGoPrev: () => setState((s) => ({ runnerCursor: Math.max(0, s.runnerCursor - 1) })),
    diagGoNext: () => setState((s) => ({ runnerCursor: Math.min((s.diagAssessment?.questions?.length ?? 1) - 1, s.runnerCursor + 1) })),
    diagGoToIndex: (i) => setState({ runnerCursor: i }),
    attemptSubmitting: st.attemptSubmitting, attemptSubmitError: st.attemptSubmitError,
    diagResult: st.attemptResult,
    diagCompleted: !!st.attemptResult,
    diagScore: st.attemptResult ? st.attemptResult.score : 0,
    diagPassedLabel:
      !st.attemptResult || st.attemptResult.passed === null ? "· no pass/fail threshold set"
        : st.attemptResult.passed ? "· Passed" : "· Not passed",
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
          {v.isRealSimulation && (
            <div>
              <div style={css("font-size:12.5px; color:#7A8AA3; margin-bottom:10px")}>Situation simulation — the second half of your baseline assessment, alongside the MCQ diagnostic.</div>
              {v.simLoading && <div style={css("padding:40px; text-align:center; color:#5A6472")}>Loading…</div>}
              {v.simLoadError && <div style={css("color:#991B1B; font-size:13px")}>{v.simLoadError}</div>}
              {st.simAssessment && (
                <LiveAssessmentRunner
                  assessment={st.simAssessment}
                  attemptId={st.simAttemptId}
                  token={st.authToken}
                  onSubmitted={onSimulationSubmitted}
                  localScorer={(path) => scoreLocalSimulation(LOCAL_SIMULATION, path)}
                />
              )}
            </div>
          )}
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
