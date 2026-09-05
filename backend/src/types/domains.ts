export const DOMAINS = [
  "Statistical",
  "Technical",
  "Digital Governance",
  "Behavioural/Managerial",
] as const;

export type Domain = (typeof DOMAINS)[number];

export interface ViolationEventDTO {
  type: "phone_detected" | "multiple_faces" | "no_face" | "tab_switch" | "fullscreen_exit";
  timestamp: string;
  attemptId: string;
}

export type AttemptStatus = "in_progress" | "submitted" | "kicked" | "expired";
export type AssessmentType = "mcq" | "simulation" | "diagnostic";
