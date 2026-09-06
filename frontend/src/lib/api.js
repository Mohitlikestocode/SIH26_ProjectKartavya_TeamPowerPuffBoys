export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? import.meta.env.VITE_API_BASE ?? "http://localhost:4000";

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

async function request(path, { method = "GET", token, body } = {}) {
  let res;
  try {
    res = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: "Bearer " + token } : {}),
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch (err) {
    // Without this, a network failure (e.g. VITE_API_BASE_URL not set at build time, so this
    // still points at localhost:4000 in a deployed build) surfaces as a bare "Failed to fetch"
    // with no indication of which URL it tried — same fix as apiFetch() below already has.
    throw new ApiError(0, `Could not reach the backend at ${API_BASE_URL}: ${err.message}`);
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new ApiError(res.status, data.error || `Request failed (${res.status})`);
  return data;
}

export async function apiFetch(path, { method = "GET", body, identityHeaders = "none" } = {}) {
  const isFormData = body instanceof FormData;
  const headers = {};
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

export function uploadDocument(file) {
  const formData = new FormData();
  formData.append("file", file);
  return apiFetch("/api/documents", { method: "POST", body: formData });
}

export function generateForDocument(documentId) {
  return apiFetch(`/api/documents/${documentId}/generate`, { method: "POST" });
}

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

export function editQuestion(id, patch) {
  return apiFetch(`/api/questions/${id}`, { method: "PATCH", body: patch, identityHeaders: "admin" });
}

export function approveQuestion(id, reason) {
  return apiFetch(`/api/questions/${id}/approve`, {
    method: "POST",
    body: reason ? { reason } : {},
    identityHeaders: "admin",
  });
}

export function rejectQuestion(id, reason) {
  return apiFetch(`/api/questions/${id}/reject`, {
    method: "POST",
    body: reason ? { reason } : {},
    identityHeaders: "admin",
  });
}

export function createQuestion(payload) {
  return apiFetch("/api/questions", { method: "POST", body: payload, identityHeaders: "admin" });
}

// Trainer "create test -> QR" flow — same identity-header shortcut TrainerStudio.jsx already uses
// (backend/src/middleware/resolveTrainerAuth.ts resolves x-admin-id against a real User row).
// Include a `session` block in the payload to get {assessment, session, joinUrl, qrDataUrl} back
// in one call instead of creating the assessment and the session as two separate steps.
export function createMcqAssessment(payload) {
  return apiFetch("/api/assessments/mcq", { method: "POST", body: payload, identityHeaders: "admin" });
}

export function createSimulationAssessment(payload) {
  return apiFetch("/api/simulations/assessments", { method: "POST", body: payload, identityHeaders: "admin" });
}

export function listScenarios() {
  return apiFetch("/api/simulations/scenarios", { identityHeaders: "admin" });
}

export function listTargetRoles() {
  return apiFetch("/api/users/target-roles", { identityHeaders: "admin" });
}

// --- Kartavya assistant (text + speech, Sarvam) -----------------------------

export function assistantChat(message, history = []) {
  return apiFetch("/api/i18n/assistant/chat", {
    method: "POST",
    body: { message, history },
    identityHeaders: "user",
  });
}

export function assistantTranscribe(audioBlob) {
  const formData = new FormData();
  formData.append("audio", audioBlob, "voice-note.webm");
  return apiFetch("/api/i18n/assistant/transcribe", {
    method: "POST",
    body: formData,
    identityHeaders: "user",
  });
}

// Bypasses apiFetch(): its content-type check would route a non-JSON response through
// res.text(), which mangles binary audio (text() decodes as UTF-8, lossy for arbitrary bytes).
// Speech responses need res.blob() instead, so this talks to fetch() directly.
export async function assistantSpeak(text, languageCode) {
  let res;
  try {
    res = await fetch(`${API_BASE_URL}/api/i18n/assistant/speak`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-user-id": identity.userId },
      body: JSON.stringify({ text, languageCode }),
    });
  } catch (err) {
    throw new ApiError(0, `Could not reach the backend at ${API_BASE_URL}: ${err.message}`);
  }
  if (!res.ok) {
    const payload = await res.json().catch(() => ({}));
    throw new ApiError(res.status, payload.error || `Request failed (${res.status})`);
  }
  return res.blob();
}

export const api = {
  base: API_BASE_URL,
  login: (email, password) => request("/api/auth/login", { method: "POST", body: { email, password } }),
  me: (token) => request("/api/auth/me", { token }),
  createAssessment: (token, body) => request("/api/assessments", { method: "POST", token, body }),
  getDiagnostic: (token) => request("/api/assessments/diagnostic", { token }),
  createSession: (token, body) => request("/api/sessions", { method: "POST", token, body }),
  getSession: (token, sessionId) => request(`/api/sessions/${sessionId}`, { token }),
  joinSession: (token, sessionId, joinToken) =>
    request(`/api/sessions/${sessionId}/join`, { method: "POST", token, body: { token: joinToken } }),
  startAttempt: (token, assessmentId) => request("/api/attempts", { method: "POST", token, body: { assessmentId } }),
  getAttempt: (token, attemptId) => request(`/api/attempts/${attemptId}`, { token }),
  getEmployeeDashboard: (token) => request("/api/dashboards/employee", { token }),
  getMyAttempts: (token) => request("/api/attempts/mine", { token }),
  getDefaultSimulation: (token) => request("/api/simulations/assessments/default", { token }),
  submitAttempt: (token, attemptId, answers) =>
    request(`/api/attempts/${attemptId}/submit`, { method: "POST", token, body: { answers } }),
  logViolation: (token, attemptId, type) =>
    request("/api/violations", { method: "POST", token, body: { attemptId, type } }),
};
