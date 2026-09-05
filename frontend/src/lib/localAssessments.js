import { ITEMS } from "../data";

// Fully client-side, zero-network, zero-auth fallback for the two-part baseline assessment
// (general MCQ + situation simulation). Used when there's no backend/token to talk to, so the
// prototype demo's core learner flow never dead-ends on "Not signed in." — mirrors the shape and
// scoring logic the real backend uses (Assessment.questions[] contract, scoreMcqLike,
// scoreSimulationPath) closely enough that swapping in a real backend later is seamless.

// --- MCQ diagnostic --------------------------------------------------------

function bestOptionIndex(options) {
  return options.reduce((bestI, o, i, arr) => (o[2] > arr[bestI][2] ? i : bestI), 0);
}

export function buildLocalDiagnostic() {
  const questions = ITEMS.filter((it) => !it.essay).map((it) => ({
    id: it.id,
    stem: it.stem,
    options: it.options.map((o) => o[1]),
    correctIndex: bestOptionIndex(it.options),
    domainTag: it.domain,
    subSkillTag: it.skill,
    isStub: true,
  }));
  return {
    id: "local-mock-diagnostic",
    type: "diagnostic",
    title: "Baseline Diagnostic (offline demo)",
    questions,
    timeLimitSeconds: 20 * 60,
    passingScore: 40,
  };
}

export function scoreLocalDiagnostic(assessment, answers) {
  const questions = assessment.questions;
  const answerByQuestion = new Map(Object.entries(answers));
  const domainTotals = new Map();
  const subSkillTotals = new Map();
  const results = [];
  let correctCount = 0;

  for (const q of questions) {
    const selectedIndex = answerByQuestion.has(q.id) ? Number(answerByQuestion.get(q.id)) : null;
    const isCorrect = selectedIndex === q.correctIndex;
    if (isCorrect) correctCount += 1;
    results.push({ questionId: q.id, selectedIndex, isCorrect });

    const d = domainTotals.get(q.domainTag) ?? { correct: 0, total: 0 };
    d.total += 1;
    if (isCorrect) d.correct += 1;
    domainTotals.set(q.domainTag, d);

    const s = subSkillTotals.get(q.subSkillTag) ?? { correct: 0, total: 0 };
    s.total += 1;
    if (isCorrect) s.correct += 1;
    subSkillTotals.set(q.subSkillTag, s);
  }

  const pct = (c, t) => (t > 0 ? Math.round((c / t) * 100) : 0);
  const perDomainScore = Object.fromEntries([...domainTotals].map(([k, v]) => [k, pct(v.correct, v.total)]));
  const perSubSkillScore = Object.fromEntries([...subSkillTotals].map(([k, v]) => [k, pct(v.correct, v.total)]));
  const score = pct(correctCount, questions.length);

  return {
    score,
    perDomainScore,
    perSubSkillScore,
    results,
    passed: score >= assessment.passingScore,
    status: "submitted",
  };
}

// --- Situation simulation ---------------------------------------------------
// Same content/shape as the "Data Quality Check" scenario in
// backend/src/modules/simulations/simulations.service.ts, kept in sync by hand — this is the
// no-backend fallback, not a replacement for the real scenario bank.

export const LOCAL_SIMULATION = {
  id: "data-quality-check",
  title: "Data Quality Check — Flawed District Dataset",
  domainTag: "Statistical",
  subSkillTag: "Data Quality Frameworks",
  startNodeId: "start",
  nodes: {
    start: {
      prompt:
        "You've received a district-level agricultural production dataset ahead of publication. A quick scan shows: (a) 6% of records have a yield value of exactly 0 for an otherwise-harvested crop, (b) three districts report identical decimal values to 4 places for 'area sown', and (c) the release is due in 48 hours. Which anomaly do you investigate first?",
      choices: [
        { id: "zero-yield", label: "The zero-yield records", nextNodeId: "zero-yield-path" },
        { id: "duplicate-decimals", label: "The suspiciously identical 'area sown' values", nextNodeId: "duplicate-decimals-path" },
        { id: "ignore-deadline", label: "Neither — flag both to your supervisor and let them decide, given the deadline", nextNodeId: "escalate-immediately" },
      ],
    },
    "zero-yield-path": {
      prompt:
        "You pull the raw enumerator sheets for the zero-yield records. Most trace to genuine crop failure (drought-affected blocks), but 4 records show the enumerator left the yield field blank and it was auto-filled to 0 by the entry system. What do you do?",
      choices: [
        { id: "fix-and-flag-duplicates", label: "Correct the 4 auto-filled records, then go back and check the decimal-value anomaly too", nextNodeId: "thorough-outcome" },
        { id: "fix-only", label: "Correct the 4 records and proceed to publish — the deadline is tight", nextNodeId: "partial-outcome" },
        { id: "blanket-exclude", label: "Exclude all 6% zero-yield records from the release as a precaution", nextNodeId: "overcorrection-outcome" },
      ],
    },
    "duplicate-decimals-path": {
      prompt:
        "You trace the three districts' identical 'area sown' decimals to a single enumerator who appears to have copy-pasted the previous block's figure under time pressure. The zero-yield anomaly is still unexamined. What now?",
      choices: [
        { id: "fix-and-check-zero", label: "Flag the copy-paste error to the field office, then go check the zero-yield records too", nextNodeId: "thorough-outcome" },
        { id: "fix-only-decimals", label: "Flag the copy-paste error and proceed — no time to check the other anomaly", nextNodeId: "partial-outcome" },
      ],
    },
    "escalate-immediately": {
      prompt:
        "Your supervisor asks what you've already verified yourself before escalating. You have not looked at either anomaly yet.",
      choices: [
        { id: "go-investigate", label: "Go investigate both anomalies yourself first, then come back", nextNodeId: "thorough-outcome" },
        { id: "insist-escalate", label: "Insist it's a supervisor-level call regardless", nextNodeId: "underprepared-outcome" },
      ],
    },
    "thorough-outcome": {
      outcome: "Both data quality issues identified and corrected before release; publication delayed by only a few hours.",
      feedback:
        "This is the strongest outcome: you traced both anomalies to root cause (a system auto-fill bug and an enumerator shortcut) rather than acting on the first one you saw. A tight deadline doesn't excuse an incomplete quality check — a wrong number published on time is worse than a right number published a few hours late.",
      score: 92,
    },
    "partial-outcome": {
      outcome: "One anomaly was root-caused and fixed; the other shipped unexamined.",
      feedback:
        "You did solid root-cause work on the anomaly you chose, but stopping there under deadline pressure means the other anomaly ships blind. In a real NQAF-aligned review, both would need at least a cursory check before sign-off, even if only one gets deep investigation.",
      score: 62,
    },
    "overcorrection-outcome": {
      outcome: "All zero-yield records excluded, including genuine drought-affected ones; the release now understates crop failure.",
      feedback:
        "Blanket exclusion avoided the auto-fill bug but destroyed real signal — most zero-yield records were genuine. This is a common failure mode: treating every anomaly as noise instead of checking whether it's real data. The decimal-value anomaly also went unexamined.",
      score: 35,
    },
    "underprepared-outcome": {
      outcome: "Escalated without doing any of the groundwork a supervisor would expect.",
      feedback:
        "Escalating isn't wrong in principle, but arriving with zero investigation of either anomaly signals you haven't done the basic due diligence expected before involving your supervisor's time.",
      score: 20,
    },
  },
};

export function scoreLocalSimulation(graph, path) {
  let currentNodeId = graph.startNodeId;
  for (const step of path) {
    const node = graph.nodes[currentNodeId];
    const choice = node?.choices?.find((c) => c.id === step.choiceId);
    if (!choice) break;
    currentNodeId = choice.nextNodeId;
  }
  const terminal = graph.nodes[currentNodeId];
  return {
    score: terminal?.score ?? 0,
    perDomainScore: { [graph.domainTag]: terminal?.score ?? 0 },
    perSubSkillScore: { [graph.subSkillTag]: terminal?.score ?? 0 },
    status: "submitted",
    passed: null, // no pass/fail threshold applies to a simulation outcome
  };
}
