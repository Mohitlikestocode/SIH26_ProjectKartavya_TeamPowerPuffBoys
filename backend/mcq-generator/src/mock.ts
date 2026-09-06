import type { Batch, Difficulty, FreeTextBatch, FreeTextItem } from "./schema";

// Offline sample output, so the pipeline — validation, tag resolution, file
// writing — can be demonstrated without a key, a network call, or a bill.
// The items are grounded in samples/sampling-module.txt.
const TEMPLATES: Omit<Batch["questions"][number], "domain" | "difficulty">[] = [
  {
    id: "samp-frame-staleness-01",
    cognitive_level: "analysis",
    scenario:
      "You are drawing a sample of registered manufacturing units in a district using a business register last updated four years ago. Field teams report that roughly a fifth of the selected units no longer operate at the listed address, while several large units that neighbours describe as recently opened do not appear on your list at all.",
    question: "What does this pattern indicate, and what is the appropriate response?",
    options: [
      { key: "A", text: "Only over-coverage is present; drop the dead units, treat them as ineligible, and report the achieved sample as complete." },
      { key: "B", text: "Both over-coverage and under-coverage are present; the frame needs updating or supplementing before estimates can be treated as representative." },
      { key: "C", text: "This is ordinary non-response; apply a non-response adjustment to the weights of the units that did respond." },
      { key: "D", text: "Increase the sample size in the affected district so the extra units compensate for the ones that could not be traced." },
    ],
    correct_option: "B",
    explanation: {
      correct:
        "Dead units on the list are over-coverage and unlisted operating units are under-coverage — two distinct frame errors appearing together. Neither is fixed by weighting or by drawing more units from the same defective list, so the frame itself must be updated or supplemented.",
      distractor_reasoning: {
        A: "Correctly identifies over-coverage but ignores the missing units entirely — the unlisted large units are exactly the ones most likely to distort a manufacturing estimate.",
        B: "Correct: it names both errors and directs the fix at the frame rather than at the weights.",
        C: "Confuses frame error with non-response. A unit that has closed or was never listed was never a reachable member of the frame, so a non-response adjustment misattributes the problem.",
        D: "A bigger sample from the same stale list reproduces the same coverage error at greater cost — sample size does not repair a frame.",
      },
    },
    source_grounding: "Section on sampling frames — over-coverage and under-coverage.",
  },
  {
    id: "samp-design-effect-02",
    cognitive_level: "application",
    scenario:
      "A colleague sizes a household survey by assuming simple random sampling and arrives at 2,400 households for the precision the ministry has asked for. The actual design selects villages first, then 12 households within each selected village, and past rounds of this survey have shown a design effect of about 2.0 for the main indicator.",
    question: "What sample size should you plan for, and why?",
    options: [
      { key: "A", text: "2,400 households — the design effect describes analysis-stage variance and does not change how many households you select." },
      { key: "B", text: "1,200 households, since clustering makes fieldwork more efficient and fewer households are needed per village." },
      { key: "C", text: "Roughly 4,800 households — the simple-random-sample size is multiplied by the design effect to hold precision constant under clustering." },
      { key: "D", text: "2,400 households, with the design effect applied afterwards as a correction to the reported standard errors." },
    ],
    correct_option: "C",
    explanation: {
      correct:
        "The design effect is the ratio of the variance under the actual design to the variance under simple random sampling. Holding precision fixed, the required sample is the simple-random-sample size multiplied by the design effect, so 2,400 × 2.0 ≈ 4,800 households.",
      distractor_reasoning: {
        A: "Treats the design effect as purely an analysis concern. It is a planning input: ignoring it at design stage guarantees the survey misses its precision target.",
        B: "Inverts the relationship. Clustering lowers field cost but raises variance, so it requires more households, not fewer.",
        C: "Correct: it applies the design effect at the design stage, which is what holds precision constant.",
        D: "Produces honest standard errors but an underpowered survey — the estimates arrive with wider intervals than the ministry asked for, and no correction recovers the lost precision.",
      },
    },
    source_grounding: "Section on cluster sampling and the design effect.",
  },
  {
    id: "samp-rotation-03",
    cognitive_level: "application",
    scenario:
      "A quarterly labour survey uses a rotational panel in which each selected household is interviewed for four consecutive quarters. A supervisor proposes replacing the whole sample every quarter instead, arguing that fresh households give a cleaner, more current picture and avoid tiring respondents.",
    question: "What is the strongest methodological objection to this proposal?",
    options: [
      { key: "A", text: "A fully fresh sample each quarter is more expensive to field, so the change fails on cost grounds." },
      { key: "B", text: "Overlap between consecutive rounds is what makes quarter-to-quarter change estimates precise; removing it inflates the variance of exactly the change measures the survey exists to produce." },
      { key: "C", text: "Rotational panels are required by the sampling frame, so the design cannot be altered without redrawing the frame." },
      { key: "D", text: "Fresh samples introduce panel conditioning, in which repeated interviewing changes how households answer." },
    ],
    correct_option: "B",
    explanation: {
      correct:
        "Partial overlap between rounds correlates the two estimates being differenced, and that positive correlation reduces the variance of the change estimate. A fully fresh sample sets the overlap to zero and makes change estimates markedly noisier, which is the main thing a quarterly labour survey is measuring.",
      distractor_reasoning: {
        A: "Cost is a real consideration but a secondary one — the proposal fails first on the statistical properties of the change estimate.",
        B: "Correct: it identifies overlap as the mechanism and change estimation as what is lost.",
        C: "Not true. The frame constrains which units can be selected, not whether the design rotates.",
        D: "Reverses the concept. Panel conditioning is a risk of repeated interviewing — an argument for the supervisor's proposal, not against it.",
      },
    },
    source_grounding: "Section on rotational panel designs and measurement of change.",
  },
];

// The hand-written items above are grounded in samples/sampling-module.txt and
// are only honest for the Sampling sub-skill. For any other sub-skill, mock
// mode emits items that say plainly that they are placeholders — a fake
// Python question dressed up as a real one would be worse than no question,
// because it would look reviewable when it is not.
function placeholder(subSkill: string, index: number): Batch["questions"][number] {
  const slug = subSkill.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  return {
    id: `mock-${slug}-${String(index + 1).padStart(2, "0")}`,
    domain: subSkill,
    difficulty: "intermediate",
    cognitive_level: "application",
    scenario: `[MOCK PLACEHOLDER] Mock mode has no hand-written sample items for ${subSkill}. A real run generates a 2-4 sentence work scenario here, grounded in the source document.`,
    question: `[MOCK PLACEHOLDER] Item ${index + 1} for ${subSkill}. Run without --mock to generate real items.`,
    options: [
      { key: "A", text: "[MOCK PLACEHOLDER] Option A" },
      { key: "B", text: "[MOCK PLACEHOLDER] Option B" },
      { key: "C", text: "[MOCK PLACEHOLDER] Option C" },
      { key: "D", text: "[MOCK PLACEHOLDER] Option D" },
    ],
    correct_option: (["A", "B", "C", "D"] as const)[index % 4],
    explanation: {
      correct: "[MOCK PLACEHOLDER] A real run explains in 2-3 sentences why the correct option is right.",
      distractor_reasoning: {
        A: "[MOCK PLACEHOLDER] Reasoning for A.",
        B: "[MOCK PLACEHOLDER] Reasoning for B.",
        C: "[MOCK PLACEHOLDER] Reasoning for C.",
        D: "[MOCK PLACEHOLDER] Reasoning for D.",
      },
    },
    source_grounding: "[MOCK PLACEHOLDER] No source was read.",
  };
}

export function mockBatch(subSkill: string, difficulty: Difficulty, count: number): Batch {
  if (subSkill.toLowerCase() !== "sampling") {
    return {
      questions: Array.from({ length: count }, (_, i) => ({
        ...placeholder(subSkill, i),
        difficulty,
      })),
      notes: `Mock mode: placeholder items for ${subSkill}. Only "Sampling" has hand-written sample content, since that is what samples/sampling-module.txt covers.`,
    };
  }

  const questions = TEMPLATES.slice(0, count).map((q) => ({ ...q, domain: subSkill, difficulty }));

  const notes =
    count > TEMPLATES.length
      ? `Mock mode holds ${TEMPLATES.length} sample items for Sampling; ${count} were requested. Real generation is bounded by the source material in the same way — it returns fewer items rather than padding.`
      : "Mock mode: deterministic sample output, no model call was made.";

  return { questions, notes };
}

// ---------------------------------------------------------------------------
// Written-answer sample. Grounded in samples/sampling-module.txt, and written
// to show what a rubric that resists gaming looks like — every claim is
// something the answer must assert, tied where possible to a detail of the
// scenario, and every not_met_example is a real misconception rather than an
// empty sentence.
// ---------------------------------------------------------------------------

const FREE_TEXT_TEMPLATE: Omit<FreeTextItem, "domain" | "difficulty"> = {
  id: "samp-frame-staleness-ft-01",
  scenario:
    "You are drawing a sample of registered manufacturing units in a district from a business register last updated four years ago. Field teams report that roughly a fifth of the selected units no longer operate at the listed address. Separately, they mention several sizeable units, described by neighbours as opened within the last two years, that do not appear on your list at all. Your deadline for the district estimate is in three weeks.",
  question:
    "Explain what these two field reports tell you about your sample, and set out what you would do before producing the district estimate.",
  reference_answer:
    "The two reports describe different errors that happen to have surfaced together. Units that have closed are over-coverage: they were on the frame but do not belong to the target population. Units operating but absent from the register are under-coverage: they belong to the population but were never eligible for selection. Over-coverage is visible from inside the survey, because an enumerator reaches the address and records the unit ineligible. Under-coverage is not, which makes it the more dangerous of the two, and here it involves large units whose absence would bias a manufacturing estimate substantially. Neither is repaired by weighting, because a non-response adjustment redistributes weight among units that were eligible, and neither of these groups was. Nor by drawing a larger sample, since additional units come from the same defective list. The correct response is to update or supplement the frame before estimating, most practically by listing operating units in the affected areas, and to state the residual coverage limitation alongside the estimate if the deadline does not permit a full update.",
  criteria: [
    {
      key: "c1",
      claim:
        "Identifies the closed units and the unlisted units as two distinct errors, rather than treating both as the same problem of untraceable units",
      met_example:
        "These are two separate problems: the closed units are over-coverage, while the operating units missing from the register are under-coverage.",
      not_met_example:
        "In both cases the register is out of date, so I would treat all the unusable units the same way and adjust for them together.",
      source_grounding: "Section 1 — over-coverage and under-coverage",
    },
    {
      key: "c2",
      claim:
        "States that this is frame error rather than non-response, and that a weighting adjustment does not fix it",
      met_example:
        "A non-response adjustment would be wrong here, because these units were never eligible for selection in the first place — that is a frame problem, not a response problem.",
      not_met_example:
        "I would apply a non-response weighting adjustment to the units that did respond so the estimate remains unbiased.",
      source_grounding: "Section 1 — non-response is a distinct problem and must not be confused with frame error",
    },
    {
      key: "c3",
      claim:
        "Recognises that increasing the sample size does not compensate, because the additional units come from the same defective register",
      met_example:
        "Sampling more units would not help, since every extra unit is drawn from the same out-of-date list and reproduces the same gap.",
      not_met_example:
        "I would increase the sample size in the affected district so that the extra units make up for the ones we could not trace.",
      source_grounding: "Section 1 — no increase in sample size compensates for under-coverage",
    },
    {
      key: "c4",
      claim:
        "Proposes updating or supplementing the frame itself, and connects the urgency to the fact that the missing units are large ones",
      met_example:
        "I would arrange a listing operation in the affected areas before estimating, particularly because the units missing are large enough to move a manufacturing total.",
      not_met_example:
        "I would note the problem in the metadata and proceed with the estimate as planned to meet the deadline.",
      source_grounding: "Section 1 — frame errors are corrected by updating or supplementing the frame",
    },
  ],
};

function freeTextPlaceholder(subSkill: string, index: number): Omit<FreeTextItem, "difficulty"> {
  const slug = subSkill.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  return {
    id: `mock-ft-${slug}-${String(index + 1).padStart(2, "0")}`,
    domain: subSkill,
    scenario: `[MOCK PLACEHOLDER] Mock mode has no hand-written written-answer item for ${subSkill}. A real run generates a work scenario here, grounded in the source document.`,
    question: `[MOCK PLACEHOLDER] Written item ${index + 1} for ${subSkill}. Run without --mock to generate real items.`,
    reference_answer: "[MOCK PLACEHOLDER] A real run writes what a strong answer contains.",
    criteria: [1, 2, 3].map((n) => ({
      key: `c${n}`,
      claim: `[MOCK PLACEHOLDER] Claim ${n} the answer must make.`,
      met_example: `[MOCK PLACEHOLDER] A sentence satisfying claim ${n}.`,
      not_met_example: `[MOCK PLACEHOLDER] A confident sentence that does not satisfy claim ${n}.`,
      source_grounding: "[MOCK PLACEHOLDER] No source was read.",
    })),
  };
}

export function mockFreeTextBatch(subSkill: string, difficulty: Difficulty, count: number): FreeTextBatch {
  if (subSkill.toLowerCase() !== "sampling") {
    return {
      items: Array.from({ length: count }, (_, i) => ({ ...freeTextPlaceholder(subSkill, i), difficulty })),
      notes: `Mock mode: placeholder written items for ${subSkill}. Only "Sampling" has hand-written sample content.`,
    };
  }

  const items = count >= 1 ? [{ ...FREE_TEXT_TEMPLATE, domain: subSkill, difficulty }] : [];
  const notes =
    count > 1
      ? `Mock mode holds 1 sample written item for Sampling; ${count} were requested.`
      : "Mock mode: deterministic sample written item, no model call was made.";

  return { items, notes };
}
