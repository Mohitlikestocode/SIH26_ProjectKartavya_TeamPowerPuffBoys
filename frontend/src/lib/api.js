// Thin fetch wrapper for the real Kartavya backend (see ../../../backend).
// Used only by the live-demo flow (LiveDemo.jsx / JoinPage.jsx) — the rest
// of the app is still the design-fidelity mock driven by App.jsx's `v`
// object, untouched by any of this.
const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:4000";

class ApiError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

async function request(path, { method = "GET", token, body } = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new ApiError(res.status, data.error || `Request failed (${res.status})`);
  return data;
}

export const api = {
  base: API_BASE,
  login: (email, password) => request("/api/auth/login", { method: "POST", body: { email, password } }),
  me: (token) => request("/api/auth/me", { token }),
  createAssessment: (token, body) => request("/api/assessments", { method: "POST", token, body }),
  createSession: (token, body) => request("/api/sessions", { method: "POST", token, body }),
  getSession: (token, sessionId) => request(`/api/sessions/${sessionId}`, { token }),
  joinSession: (token, sessionId, joinToken) =>
    request(`/api/sessions/${sessionId}/join`, { method: "POST", token, body: { token: joinToken } }),
  getAttempt: (token, attemptId) => request(`/api/attempts/${attemptId}`, { token }),
  submitAttempt: (token, attemptId, answers) =>
    request(`/api/attempts/${attemptId}/submit`, { method: "POST", token, body: { answers } }),
  logViolation: (token, attemptId, type) =>
    request("/api/violations", { method: "POST", token, body: { attemptId, type } }),
};

export { ApiError };
