import { prisma } from "../../config/db";
import { ApiError } from "../../middleware/errorHandler";

// ScenarioGraph: nodes are decision points (a prompt + 2-4 choices), each
// choice points at the next node; a node with no `choices` is terminal and
// carries the outcome text, explanatory feedback, and a 0-100 score for
// having reached it (prompt.md Phase 4, item 16).
export interface ScenarioChoice {
  id: string;
  label: string;
  nextNodeId: string;
}

export interface ScenarioNode {
  prompt?: string; // present on a decision node
  choices?: ScenarioChoice[]; // present on a decision node; absent => terminal
  outcome?: string; // present on a terminal node
  feedback?: string; // present on a terminal node
  score?: number; // 0-100, present on a terminal node
}

export interface ScenarioGraph {
  id: string;
  title: string;
  domainTag: string;
  subSkillTag: string;
  startNodeId: string;
  nodes: Record<string, ScenarioNode>;
}

export interface ScenarioPathStep {
  nodeId: string;
  choiceId: string;
}

// Depth over breadth (per prompt.md item 17): two fully fleshed scenarios
// rather than a shallow library of many.
export const SCENARIOS: Record<string, ScenarioGraph> = {
  "data-quality-check": {
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
  },
  "survey-design": {
    id: "survey-design",
    title: "Survey Design — Sampling Method Under Constraints",
    domainTag: "Statistical",
    subSkillTag: "Sampling",
    startNodeId: "start",
    nodes: {
      start: {
        prompt:
          "You're designing a household survey to estimate district-level access to a public service. Budget covers roughly 3,000 households. The population is geographically clustered into villages of very different sizes, and travel between villages is costly. Coverage needs to be state-representative, not just district-representative. Which sampling approach do you start from?",
        choices: [
          { id: "srs", label: "Simple random sampling of households across the state", nextNodeId: "srs-path" },
          { id: "cluster", label: "Multi-stage cluster sampling (villages, then households within selected villages)", nextNodeId: "cluster-path" },
          { id: "convenience", label: "Purposive selection of easily accessible villages to control cost", nextNodeId: "convenience-outcome" },
        ],
      },
      "srs-path": {
        prompt:
          "With SRS across the whole state, your 3,000 households land in hundreds of scattered villages. Field teams flag that travel costs alone would consume most of the budget before any interviewing starts. Do you proceed or reconsider?",
        choices: [
          { id: "proceed-srs", label: "Proceed with SRS — statistical purity matters most", nextNodeId: "srs-proceed-outcome" },
          { id: "switch-to-cluster", label: "Switch to multi-stage cluster sampling to control travel cost", nextNodeId: "cluster-path" },
        ],
      },
      "cluster-path": {
        prompt:
          "You select villages via probability-proportional-to-size (to avoid under-representing large villages), then households within each. A colleague suggests fixing the same number of households per village regardless of village size, to simplify field logistics. Do you agree?",
        choices: [
          { id: "keep-pps-varying", label: "No — keep household counts proportional to village size, preserving PPS logic through both stages", nextNodeId: "sound-cluster-outcome" },
          { id: "fixed-per-village", label: "Yes — fix households per village for simpler logistics", nextNodeId: "logistics-compromise-outcome" },
        ],
      },
      "convenience-outcome": {
        outcome: "Cost is controlled, but the sample is not statistically representative of the state.",
        feedback:
          "Purposive selection of convenient villages breaks representativeness entirely — there is no valid way to generalize the result to state level, no matter how well-run the fieldwork is. This is the sampling design failure mode: optimizing for cost while abandoning the survey's actual objective.",
        score: 15,
      },
      "srs-proceed-outcome": {
        outcome: "Statistically clean design, but the survey runs out of budget partway through fieldwork.",
        feedback:
          "SRS is the textbook-correct baseline for representativeness, but ignoring the operational constraint (clustered population, high travel cost) here means the survey likely doesn't finish. A design that can't be executed within budget doesn't produce usable estimates either — good sampling theory has to account for field feasibility.",
        score: 45,
      },
      "sound-cluster-outcome": {
        outcome: "Multi-stage PPS cluster sampling, consistently applied at both stages, within budget and state-representative.",
        feedback:
          "This is the correct design for the constraints given: PPS sampling of villages controls for size bias, and keeping household counts proportional to village size (rather than fixing them) preserves the self-weighting property through both stages — avoiding a design-weight correction headache later. Travel cost is contained by clustering, and representativeness is preserved.",
        score: 95,
      },
      "logistics-compromise-outcome": {
        outcome: "Simpler fieldwork logistics, but the sample now over-represents small villages and under-represents large ones.",
        feedback:
          "Fixing household counts per village after PPS village selection breaks the self-weighting design — small villages get over-sampled relative to their population share. It's not unsalvageable (design weights can correct it at analysis time), but it adds complexity and variance that the sound design avoids from the start.",
        score: 68,
      },
    },
  },
};

export function listScenarios() {
  return Object.values(SCENARIOS).map((s) => ({ id: s.id, title: s.title, domainTag: s.domainTag, subSkillTag: s.subSkillTag }));
}

export function getScenario(id: string): ScenarioGraph {
  const scenario = SCENARIOS[id];
  if (!scenario) throw new ApiError(404, "Unknown scenario");
  return scenario;
}

// Trainer creates an Assessment (type=simulation) from a scenario template —
// the graph is copied into Assessment.scenario so it's versioned per
// assessment even if the template changes later.
export async function createSimulationAssessment(createdById: string, scenarioId: string, timeLimitSeconds = 20 * 60) {
  const scenario = getScenario(scenarioId);
  return prisma.assessment.create({
    data: {
      type: "simulation",
      title: scenario.title,
      domainTags: [scenario.domainTag],
      subSkillTags: [scenario.subSkillTag],
      scenario: scenario as never,
      timeLimitSeconds,
      passingScore: 50,
      isProctored: false,
      createdById,
    },
  });
}

// Mirrors assessments.service.ts's getOrCreateDiagnostic: the learner-facing onboarding gate
// needs *some* real simulation Assessment to attempt without waiting on a trainer to create one
// first, same as the MCQ side has a system-owned diagnostic it can fall back to.
export async function getOrCreateDefaultSimulation(systemUserId: string) {
  const [firstScenario] = Object.values(SCENARIOS);
  const existing = await prisma.assessment.findFirst({
    where: { type: "simulation", title: firstScenario.title },
  });
  if (existing) return existing;

  return createSimulationAssessment(systemUserId, firstScenario.id);
}

// Walks a submitted path (start -> ... -> terminal) against the assessment's
// stored ScenarioGraph, validating each step actually follows the graph's
// edges (no skipping ahead / inventing outcomes), and returns the terminal
// node's score. Shared by attempts.service.ts's submitAttempt for
// type=simulation, so simulations feed the same Attempt/scoring pipeline as
// MCQ attempts (prompt.md Phase 4, item 18).
export function scoreSimulationPath(graph: ScenarioGraph, path: ScenarioPathStep[]) {
  if (!path.length) throw new ApiError(400, "Empty simulation path");

  let currentNodeId = graph.startNodeId;
  for (const step of path) {
    if (step.nodeId !== currentNodeId) {
      throw new ApiError(400, `Path is out of sequence at node "${step.nodeId}" (expected "${currentNodeId}")`);
    }
    const node = graph.nodes[currentNodeId];
    if (!node?.choices) throw new ApiError(400, `Node "${currentNodeId}" is terminal or unknown — path continues past the end`);
    const choice = node.choices.find((c) => c.id === step.choiceId);
    if (!choice) throw new ApiError(400, `Choice "${step.choiceId}" is not valid at node "${currentNodeId}"`);
    currentNodeId = choice.nextNodeId;
  }

  const terminal = graph.nodes[currentNodeId];
  if (!terminal || terminal.choices || terminal.score === undefined) {
    throw new ApiError(400, "Path did not end on a terminal (scored) node");
  }

  return {
    score: terminal.score,
    outcome: terminal.outcome ?? "",
    feedback: terminal.feedback ?? "",
    perDomainScore: { [graph.domainTag]: terminal.score },
    perSubSkillScore: { [graph.subSkillTag]: terminal.score },
  };
}
