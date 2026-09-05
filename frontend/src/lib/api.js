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
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: "Bearer " + token } : {}),
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
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
  submitAttempt: (token, attemptId, answers) =>
    request(`/api/attempts/${attemptId}/submit`, { method: "POST", token, body: { answers } }),
  logViolation: (token, attemptId, type) =>
    request("/api/violations", { method: "POST", token, body: { attemptId, type } }),
};
