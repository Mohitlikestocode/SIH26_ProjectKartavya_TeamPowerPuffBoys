import { useEffect, useState } from "react";
import { css } from "../lib/css";
import { D as DOMAINS } from "../data";
import { listQuestions, approveQuestion, rejectQuestion, editQuestion, createQuestion, ApiError } from "../lib/api";

// Same structural invariant as backend/src/lib/mcq/deriveCorrectOption.ts: for a plain stem,
// exactly one option's isTrueStatement must be true; for a negated stem, exactly one must be
// false. Mirrored here so the form can validate before submitting, rather than only finding out
// via a 422 after a round trip.
function findOutlier(trueFlags, isNegatedStem) {
  const winningValue = !isNegatedStem;
  const matches = trueFlags.reduce((acc, v, i) => (v === winningValue ? [...acc, i] : acc), []);
  return matches.length === 1 ? matches[0] : null;
}

// Mirrors the backend's createManualSchema/editSchema requirement that every
// optionEvaluations[i].text be non-empty (see questions.controller.ts's optionEvaluationSchema:
// z.string().min(1)) — caught here so the form can't even submit a blank explanation, same as the
// existing outlier check above.
function hasBlankExplanation(draft) {
  return draft.explanations.some((text) => !text.trim());
}

// Translates the backend's raw Zod validation error (a JSON array embedded in the message string)
// into plain language for the one case this form can actually still trigger despite client-side
// validation — a race where the draft passed validation locally but the request body ends up
// with a blank explanation anyway (e.g. a stale draft object). Falls back to the backend's own
// message for anything else, rather than inventing translations for errors we haven't seen.
function friendlyError(message) {
  if (/optionEvaluations/.test(message) && /"text"/.test(message) && /at least 1 character/.test(message)) {
    return "Every option needs an explanation.";
  }
  return message;
}

function blankDraft() {
  return {
    question: "",
    options: ["", "", "", ""],
    explanations: ["", "", "", ""],
    trueFlags: [true, false, false, false],
    isNegatedStem: false,
    domain: DOMAINS[0],
    skill: "",
  };
}

function draftFromQuestion(q) {
  const sorted = [...q.explanations].sort((a, b) => a.optionIndex - b.optionIndex);
  return {
    question: q.question,
    options: [...q.options],
    explanations: sorted.map((e) => e.text),
    trueFlags: sorted.map((e) => e.isTrueStatement),
    isNegatedStem: q.isNegatedStem,
    domain: q.domain,
    skill: q.skill,
  };
}

function draftToPayload(draft) {
  return {
    question: draft.question,
    options: draft.options,
    isNegatedStem: draft.isNegatedStem,
    optionEvaluations: draft.options.map((_, i) => ({
      optionIndex: i,
      isTrueStatement: draft.trueFlags[i],
      text: draft.explanations[i],
    })),
    domain: draft.domain,
    skill: draft.skill,
  };
}

function QuestionForm({ draft, onChange, outlier, saving, error, onCancel, onSave, saveLabel }) {
  const blankExplanation = hasBlankExplanation(draft);
  const canSave = !saving && outlier !== null && !blankExplanation && draft.question.trim() && draft.options.every((o) => o.trim());
  const setField = (field, value) => onChange({ ...draft, [field]: value });
  const setOption = (i, value) => {
    const options = draft.options.slice();
    options[i] = value;
    onChange({ ...draft, options });
  };
  const setExplanation = (i, value) => {
    const explanations = draft.explanations.slice();
    explanations[i] = value;
    onChange({ ...draft, explanations });
  };
  const setTrueFlag = (i, value) => {
    const trueFlags = draft.trueFlags.slice();
    trueFlags[i] = value;
    onChange({ ...draft, trueFlags });
  };

  return (
    <div style={css("padding:20px; border:1px solid #DDE1E7; background:#FBFCFD; display:grid; gap:14px")}>
      <div>
        <label style={css("display:block; font-size:12px; font-weight:700; color:#123E7C; margin-bottom:5px")}>Question stem</label>
        <textarea
          value={draft.question}
          onChange={(e) => setField("question", e.target.value)}
          style={css("width:100%; min-height:64px; font:inherit; font-size:13.5px; padding:10px; border:1px solid #C9CFD8; border-radius:6px; resize:vertical")}
        />
      </div>

      <label style={css("display:flex; align-items:center; gap:8px; font-size:12.5px; color:#3B424E")}>
        <input type="checkbox" checked={draft.isNegatedStem} onChange={(e) => setField("isNegatedStem", e.target.checked)} />
        This is a negated / "NOT" / "EXCEPT" style question
      </label>

      <div style={css("display:grid; gap:10px")}>
        {draft.options.map((opt, i) => (
          <div key={i} style={css(`border:1px solid ${i === outlier ? "#BBDEC7" : "#E4E7EC"}; background:${i === outlier ? "#F4FAF6" : "#fff"}; padding:10px 12px; border-radius:6px; display:grid; gap:7px`)}>
            <div style={css("display:flex; gap:8px; align-items:center")}>
              <span style={css("font-family:'IBM Plex Mono',monospace; font-size:12px; color:#7A8492; width:16px")}>{["A", "B", "C", "D"][i]}</span>
              <input
                value={opt}
                onChange={(e) => setOption(i, e.target.value)}
                placeholder="Option text"
                style={css("flex:1; font:inherit; font-size:13px; padding:8px 10px; border:1px solid #C9CFD8; border-radius:5px")}
              />
              <label style={css("display:flex; align-items:center; gap:5px; font-size:11.5px; color:#5A6472; white-space:nowrap")}>
                <input type="checkbox" checked={draft.trueFlags[i]} onChange={(e) => setTrueFlag(i, e.target.checked)} />
                Statement is true
              </label>
            </div>
            <input
              value={draft.explanations[i]}
              onChange={(e) => setExplanation(i, e.target.value)}
              placeholder="Explanation for this option"
              style={css("font:inherit; font-size:12px; padding:7px 10px; border:1px solid #DDE1E7; border-radius:5px; color:#5A6472")}
            />
          </div>
        ))}
      </div>

      <div style={css("font-size:12px; color:#5A6472; display:grid; gap:4px")}>
        {outlier !== null
          ? <span style={css("color:#166534; font-weight:600")}>Derived correct answer: {["A", "B", "C", "D"][outlier]}</span>
          : <span style={css("color:#9A3412; font-weight:600")}>Not saveable yet — exactly one option must have a different "Statement is true" value from the other three.</span>}
        {blankExplanation && <span style={css("color:#9A3412; font-weight:600")}>Not saveable yet — every option needs an explanation.</span>}
      </div>

      <div style={css("display:flex; gap:12px; flex-wrap:wrap")}>
        <div style={css("flex:1; min-width:160px")}>
          <label style={css("display:block; font-size:12px; font-weight:700; color:#123E7C; margin-bottom:5px")}>Domain</label>
          <select value={draft.domain} onChange={(e) => setField("domain", e.target.value)} style={css("width:100%; font:inherit; font-size:13px; padding:9px 10px; border:1px solid #C9CFD8; border-radius:6px")}>
            {DOMAINS.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>
        <div style={css("flex:1; min-width:160px")}>
          <label style={css("display:block; font-size:12px; font-weight:700; color:#123E7C; margin-bottom:5px")}>Skill</label>
          <input
            value={draft.skill}
            onChange={(e) => setField("skill", e.target.value)}
            placeholder="e.g. Sampling methodology"
            style={css("width:100%; font:inherit; font-size:13px; padding:9px 10px; border:1px solid #C9CFD8; border-radius:6px")}
          />
        </div>
      </div>

      {error && (
        <div style={css("padding:10px 12px; border:1px solid #EBC4C4; background:#FBECEC; color:#991B1B; font-size:12.5px; border-radius:6px")}>{error}</div>
      )}

      <div style={css("display:flex; gap:10px")}>
        <button
          onClick={onSave}
          disabled={!canSave}
          style={css(`font:inherit; font-size:13px; font-weight:700; cursor:${canSave ? "pointer" : "not-allowed"}; padding:10px 18px; border:0; border-radius:20px; background:${canSave ? "#123E7C" : "#E4E7EC"}; color:${canSave ? "#fff" : "#9AA3AF"}`)}
        >
          {saving ? "Saving…" : saveLabel}
        </button>
        <button onClick={onCancel} disabled={saving} style={css("font:inherit; font-size:13px; font-weight:600; cursor:pointer; padding:10px 16px; border:1px solid #C9D6E8; background:#fff; color:#123E7C; border-radius:20px")}>Cancel</button>
      </div>
    </div>
  );
}

export default function TrainerStudio({ v }) {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [sessionCounts, setSessionCounts] = useState({ approved: 0, rejected: 0 });
  const [rowErrors, setRowErrors] = useState({});
  const [editingId, setEditingId] = useState(null);
  const [editDraft, setEditDraft] = useState(null);
  const [editSaving, setEditSaving] = useState(false);
  const [editError, setEditError] = useState(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [createDraft, setCreateDraft] = useState(blankDraft());
  const [createSaving, setCreateSaving] = useState(false);
  const [createError, setCreateError] = useState(null);

  const loadPage = (targetPage) => {
    setLoading(true);
    setLoadError(null);
    listQuestions({ status: "draft", page: targetPage, pageSize: 20 })
      .then((res) => {
        setQuestions((prev) => (targetPage === 1 ? res.data : [...prev, ...res.data]));
        setPage(res.page);
        setTotalPages(res.totalPages);
        setTotal(res.total);
      })
      .catch((err) => setLoadError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadPage(1); }, []);

  const removeFromList = (id) => {
    setQuestions((prev) => prev.filter((q) => q.id !== id));
    setTotal((t) => Math.max(0, t - 1));
  };

  const doApprove = (id) => {
    setRowErrors((e) => ({ ...e, [id]: null }));
    approveQuestion(id)
      .then(() => { removeFromList(id); setSessionCounts((c) => ({ ...c, approved: c.approved + 1 })); })
      .catch((err) => setRowErrors((e) => ({ ...e, [id]: err.message })));
  };
  const doReject = (id) => {
    setRowErrors((e) => ({ ...e, [id]: null }));
    rejectQuestion(id)
      .then(() => { removeFromList(id); setSessionCounts((c) => ({ ...c, rejected: c.rejected + 1 })); })
      .catch((err) => setRowErrors((e) => ({ ...e, [id]: err.message })));
  };

  const openEdit = (q) => { setEditingId(q.id); setEditDraft(draftFromQuestion(q)); setEditError(null); };
  const closeEdit = () => { setEditingId(null); setEditDraft(null); setEditError(null); };
  const saveEdit = () => {
    const outlier = findOutlier(editDraft.trueFlags, editDraft.isNegatedStem);
    if (outlier === null || hasBlankExplanation(editDraft)) return;
    setEditSaving(true);
    setEditError(null);
    editQuestion(editingId, draftToPayload(editDraft))
      .then((updated) => {
        setQuestions((prev) => prev.map((q) => (q.id === editingId ? updated : q)));
        closeEdit();
      })
      .catch((err) => setEditError(friendlyError(err instanceof ApiError ? err.message : String(err))))
      .finally(() => setEditSaving(false));
  };

  const saveCreate = () => {
    const outlier = findOutlier(createDraft.trueFlags, createDraft.isNegatedStem);
    if (outlier === null || hasBlankExplanation(createDraft)) return;
    setCreateSaving(true);
    setCreateError(null);
    createQuestion({ ...draftToPayload(createDraft), approve: false }) // always draft — never auto-approved
      .then((created) => {
        setQuestions((prev) => [created, ...prev]);
        setTotal((t) => t + 1);
        setCreateOpen(false);
        setCreateDraft(blankDraft());
      })
      .catch((err) => setCreateError(friendlyError(err instanceof ApiError ? err.message : String(err))))
      .finally(() => setCreateSaving(false));
  };

  return (
    <section style={css("padding:24px 0 0")}>
      <div style={css("display:flex; justify-content:space-between; align-items:flex-end; gap:20px; flex-wrap:wrap; margin-bottom:18px")}>
        <div>
          <h1 style={css("font-family:'Poppins',sans-serif; font-size:28px; font-weight:700; color:#123E7C; margin:0")}>Review draft items</h1>
          <div style={css("font-size:13.5px; color:#5A6C86; margin-top:4px")}>{total} draft question(s) awaiting review · {sessionCounts.approved} approved and {sessionCounts.rejected} rejected this session</div>
        </div>
        <button onClick={() => setCreateOpen((o) => !o)} style={css("font:inherit; font-size:13px; font-weight:700; cursor:pointer; padding:10px 16px; border:0; background:#F58220; color:#fff; border-radius:24px; white-space:nowrap")}>
          {createOpen ? "Close" : "+ Write a question"}
        </button>
      </div>

      {createOpen && (
        <div style={css("margin-bottom:20px")}>
          <QuestionForm
            draft={createDraft}
            onChange={setCreateDraft}
            outlier={findOutlier(createDraft.trueFlags, createDraft.isNegatedStem)}
            saving={createSaving}
            error={createError}
            onCancel={() => { setCreateOpen(false); setCreateDraft(blankDraft()); setCreateError(null); }}
            onSave={saveCreate}
            saveLabel="Save as draft"
          />
        </div>
      )}

      {loadError && (
        <div style={css("padding:12px 14px; border:1px solid #EBC4C4; background:#FBECEC; color:#991B1B; font-size:12.5px; border-radius:8px; margin-bottom:14px")}>
          Could not load draft questions: {loadError}
        </div>
      )}

      <div style={css("display:grid; gap:12px")}>
        {questions.map((q) => (
          <div key={q.id} style={css("background:#fff; border:1px solid #E3E9F2; padding:18px 20px")}>
            {editingId === q.id ? (
              <QuestionForm
                draft={editDraft}
                onChange={setEditDraft}
                outlier={findOutlier(editDraft.trueFlags, editDraft.isNegatedStem)}
                saving={editSaving}
                error={editError}
                onCancel={closeEdit}
                onSave={saveEdit}
                saveLabel="Save changes"
              />
            ) : (
              <>
                <div style={css("display:flex; gap:9px; align-items:center; flex-wrap:wrap; margin-bottom:9px")}>
                  <span style={css("font-size:10.5px; font-weight:700; padding:3px 7px; border-radius:6px; color:#1B5CB8; background:#E8F0FA; border:1px solid #B9CFEC")}>{q.domain}</span>
                  {q.skill && q.skill !== "TBD" && <span style={css("font-size:11.5px; color:#7A8492")}>{q.skill}</span>}
                  {q.isNegatedStem && <span style={css("font-size:10.5px; font-weight:700; padding:3px 7px; border-radius:6px; color:#9A3412; background:#FDF0E4; border:1px solid #EFCFAC")}>Negated stem</span>}
                  <span style={css("margin-left:auto; font-size:11px; color:#7A8AA3")}>{q.sourceDocumentId ? "AI-generated" : "Written by you"}</span>
                </div>
                <div style={css("font-size:14.5px; font-weight:600; color:#1A1D23; line-height:1.45")}>{q.question}</div>
                <div style={css("display:grid; gap:6px; margin-top:12px")}>
                  {q.options.map((opt, i) => (
                    <div key={i} style={css(`display:grid; grid-template-columns:20px 1fr; gap:8px; padding:7px 10px; border-radius:5px; border:1px solid ${i === q.correctOption ? "#BBDEC7" : "#E4E7EC"}; background:${i === q.correctOption ? "#F4FAF6" : "#fff"}`)}>
                      <span style={css("font-family:'IBM Plex Mono',monospace; font-size:11.5px; color:#7A8492")}>{["A", "B", "C", "D"][i]}</span>
                      <span style={css("font-size:13px; color:#1A1D23")}>{opt}</span>
                    </div>
                  ))}
                </div>
                {rowErrors[q.id] && (
                  <div style={css("margin-top:10px; padding:9px 11px; border:1px solid #EBC4C4; background:#FBECEC; color:#991B1B; font-size:12px; border-radius:6px")}>{rowErrors[q.id]}</div>
                )}
                <div style={css("display:flex; gap:9px; margin-top:12px")}>
                  <button onClick={() => doApprove(q.id)} style={css("font:inherit; font-size:12.5px; font-weight:700; cursor:pointer; padding:9px 14px; border:1px solid #166534; background:#fff; color:#166534; border-radius:18px")}>Approve</button>
                  <button onClick={() => doReject(q.id)} style={css("font:inherit; font-size:12.5px; font-weight:700; cursor:pointer; padding:9px 14px; border:1px solid #991B1B; background:#fff; color:#991B1B; border-radius:18px")}>Reject</button>
                  <button onClick={() => openEdit(q)} style={css("font:inherit; font-size:12.5px; font-weight:600; cursor:pointer; padding:9px 14px; border:1px solid #C9CFD8; background:#fff; color:#123E7C; border-radius:18px")}>Edit</button>
                </div>
              </>
            )}
          </div>
        ))}

        {!loading && questions.length === 0 && !loadError && (
          <div style={css("padding:30px; text-align:center; color:#7A8492; font-size:13.5px; border:1px dashed #C9CFD8; border-radius:8px")}>No draft questions to review right now.</div>
        )}
      </div>

      {loading && <div style={css("padding:20px; text-align:center; color:#7A8492; font-size:13px")}>Loading…</div>}

      {!loading && page < totalPages && (
        <button onClick={() => loadPage(page + 1)} style={css("font:inherit; font-size:13px; font-weight:600; cursor:pointer; padding:10px 18px; border:1px solid #C9CFD8; background:#fff; color:#123E7C; border-radius:8px; margin-top:16px")}>
          Load more
        </button>
      )}
    </section>
  );
}
