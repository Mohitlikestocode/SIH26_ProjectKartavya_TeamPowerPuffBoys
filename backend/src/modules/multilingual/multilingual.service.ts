// Multilingual business logic — no Express types here, keep this layer testable in isolation.
import { chatText } from "@/lib/llm/sarvamClient";
import { synthesizeSpeech, transcribeAudio } from "@/lib/llm/sarvamSpeech";

export interface ChatTurn {
  role: "user" | "assistant";
  content: string;
}

// Grounds the assistant in what this platform actually is, so it doesn't invent features or
// answer as a generic chatbot. Sarvam's chat models are natively multilingual, so the instruction
// to mirror the learner's language does real work without any translation step of our own.
const SYSTEM_PROMPT = `You are the Kartavya assistant — a support assistant for India's Official Statistical System competency platform (MoSPI / iGOT Karmayogi ecosystem).

What this platform does:
- A learner works toward a target role. Each role requires a level (0-100) in ~28 sub-skills across 4 domains: Statistical, Technical, Digital Governance, Behavioural/Managerial.
- Stage 1 is a broad screening test (few questions per sub-skill) that ranks sub-skills weakest-first — it does not measure precisely.
- Stage 2 is a deep dive on the weakest sub-skills only: multiple-choice items produce the measured competency score; written-answer items diagnose which specific misconception a learner holds, and do not affect the score themselves.
- The gap (required minus measured) drives course recommendations from iGOT Karmayogi and NSSTA/TPAC, each with a stated reason.
- Trainers create assessments and sessions (QR-joined, optionally proctored); org admins see workforce-wide dashboards.

Rules:
- Reply in the same language the learner wrote in. If they mix languages, mirror that.
- Keep replies short — 2-4 sentences, chat-bubble length, not an essay.
- You do not have access to this specific learner's personal scores or attempt history in this conversation. If asked about their personal gap map, scores, or recommendations, say so plainly and point them to their Dashboard rather than guessing a number.
- If a question is outside this platform (general chit-chat, unrelated topics), redirect briefly to what you can help with.
- Never invent a feature, course, or policy that isn't described above.`;

export async function chatWithAssistant(message: string, history: ChatTurn[] = []): Promise<string> {
  const trimmed = message.trim();
  if (!trimmed) throw new Error("Message cannot be empty.");

  // Bound the history sent, not just its own length — a runaway conversation shouldn't grow the
  // per-request cost of a single call without limit.
  const recentHistory = history.slice(-8);

  const reply = await chatText({
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      ...recentHistory.map((turn) => ({
        role: turn.role === "user" ? ("user" as const) : ("system" as const),
        content: turn.role === "assistant" ? `[Your earlier reply] ${turn.content}` : turn.content,
      })),
      { role: "user", content: trimmed },
    ],
  });

  return reply.trim();
}

export async function transcribe(buffer: Buffer, filename: string, mimeType: string) {
  return transcribeAudio({ buffer, filename, mimeType });
}

export async function synthesize(text: string, languageCode?: string) {
  return synthesizeSpeech(text, languageCode);
}
