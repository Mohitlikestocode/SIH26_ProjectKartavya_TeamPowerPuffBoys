// Thin fetch wrapper for the Kartavya backend (Phases 1-3). Foundation piece for wiring the
// frontend mockup to real data — see AGENTS.md / project prompt for the integration plan.

// Matches the backend's own CORS_ORIGIN convention (backend/.env's CORS_ORIGIN is the frontend's
// origin; this is the frontend's mirror of that relationship — where the backend actually lives).
// Default matches backend/.env.example's PORT (4000). If your local backend runs on a different
// port (e.g. because 4000 is already taken by something else on your machine), override this in
// frontend/.env.local.
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:4000";

// Placeholder identity — there is no real auth yet (backend/src/middleware/adminIdentity.ts and
// userIdentity.ts are themselves explicitly placeholders: any non-empty string is accepted as-is).
// This mirrors that on the frontend side rather than inventing a stronger scheme the backend
// doesn't actually enforce. `setIdentity` lets a later step (wiring the mock Sign-in screen to a
// role) update these; until then every request goes out under the same dev placeholder values.
let identity = {
  adminId: "dev-trainer",
  userId: "dev-officer",
};

export function setIdentity(next) {
  identity = { ...identity, ...next };
}

export function getIdentity() {
  return identity;
}

export class ApiError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

// `identityHeaders` picks which placeholder header(s) to attach: "admin" for Phase 2 admin-review
// endpoints (x-admin-id), "user" for Phase 3 attempt/assessment endpoints (x-user-id), or "none"
// for ungated endpoints (e.g. GET /api/questions, GET /health). Sending a header an endpoint
// doesn't ask for is harmless, but omitting one it requires produces a 400 from the backend's own
// requireAdminIdentity/requireUserIdentity middleware — see backend/src/middleware/.
export async function apiFetch(path, { method = "GET", body, identityHeaders = "none" } = {}) {
  const isFormData = body instanceof FormData;
  const headers = {};
  // FormData must NOT get an explicit Content-Type — the browser sets one itself (with the
  // multipart boundary), and overriding it here would break the backend's multer parser.
  if (body !== undefined && !isFormData) headers["Content-Type"] = "application/json";
  if (identityHeaders === "admin") headers["x-admin-id"] = identity.adminId;
  if (identityHeaders === "user") headers["x-user-id"] = identity.userId;

  let res;
  try {
    res = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : isFormData ? body : JSON.stringify(body),
    });
  } catch (err) {
    // Network-level failure (backend down, CORS rejection, wrong port) — distinct from the
    // backend responding with an error status, which is handled below.
    throw new ApiError(0, `Could not reach the backend at ${API_BASE_URL}: ${err.message}`);
  }

  const contentType = res.headers.get("content-type") ?? "";
  const payload = contentType.includes("application/json") ? await res.json() : await res.text();

  if (!res.ok) {
    const message = typeof payload === "object" && payload?.error ? payload.error : String(payload);
    throw new ApiError(res.status, message);
  }

  return payload;
}

export function checkHealth() {
  return apiFetch("/health");
}

// POST /api/documents — multipart upload, field name "file" (backend/src/modules/documents,
// multer memoryStorage, 25MB limit). Returns the created SourceDocument with its chunks.
// Ungated — the backend places no admin/user-identity requirement on ingestion.
export function uploadDocument(file) {
  const formData = new FormData();
  formData.append("file", file);
  return apiFetch("/api/documents", { method: "POST", body: formData });
}

// POST /api/documents/:id/generate — runs MCQ generation for every chunk of the document.
// This is a single blocking request on the backend (questions.service.ts awaits the full
// per-chunk loop before responding), not a fire-and-forget job — there is no separate
// "check generation status" endpoint to poll, so the caller just awaits this promise. For a
// large document (e.g. the 57-chunk nssta_manual.pdf) this can take several minutes.
// Returns { generated, failedChunkIds }.
export function generateForDocument(documentId) {
  return apiFetch(`/api/documents/${documentId}/generate`, { method: "POST" });
}

// GET /api/questions — list/filter, paginated. Ungated (no identity header required for reads).
// Returns { data, page, pageSize, total, totalPages }.
export function listQuestions({ status, documentId, chunkId, isNegatedStem, page, pageSize } = {}) {
  const params = new URLSearchParams();
  if (status !== undefined) params.set("status", status);
  if (documentId !== undefined) params.set("documentId", documentId);
  if (chunkId !== undefined) params.set("chunkId", chunkId);
  if (isNegatedStem !== undefined) params.set("isNegatedStem", String(isNegatedStem));
  if (page !== undefined) params.set("page", String(page));
  if (pageSize !== undefined) params.set("pageSize", String(pageSize));
  const qs = params.toString();
  return apiFetch(`/api/questions${qs ? `?${qs}` : ""}`);
}

// PATCH /api/questions/:id — admin edit. `patch` may include any subset of: question, options
// (all 4), isNegatedStem, optionEvaluations (all 4, full replace — {optionIndex, isTrueStatement,
// text}, where `text` is that option's explanation, not its answer-choice label), domain, skill.
// Re-derives correctOption server-side; throws ApiError(422, ...) if the result would be an
// inconsistent answer key — the caller should show that message, not swallow it.
export function editQuestion(id, patch) {
  return apiFetch(`/api/questions/${id}`, { method: "PATCH", body: patch, identityHeaders: "admin" });
}

// POST /api/questions/:id/approve | /reject — optional { reason } in body.
export function approveQuestion(id, reason) {
  return apiFetch(`/api/questions/${id}/approve`, { method: "POST", body: reason ? { reason } : {}, identityHeaders: "admin" });
}
export function rejectQuestion(id, reason) {
  return apiFetch(`/api/questions/${id}/reject`, { method: "POST", body: reason ? { reason } : {}, identityHeaders: "admin" });
}

// POST /api/questions — manual creation, no source chunk. `payload`: { question, options[4],
// isNegatedStem, optionEvaluations[4], domain?, skill?, approve? }. Defaults to `draft` status
// unless `approve: true` is explicitly passed — never pass approve:true silently.
export function createQuestion(payload) {
  return apiFetch("/api/questions", { method: "POST", body: payload, identityHeaders: "admin" });
}
