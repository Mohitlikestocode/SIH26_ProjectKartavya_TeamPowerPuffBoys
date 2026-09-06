import { Router } from "express";
import multer from "multer";
import * as controller from "./multilingual.controller";

// Voice notes are short (a chat turn, not a lecture recording) — 15MB comfortably covers a few
// minutes of compressed audio. Matches the memory-storage pattern documents.routes.ts already
// uses for uploads.
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 15 * 1024 * 1024 } });

export const multilingualRouter = Router();

// No auth middleware here yet — see requireUserIdentity's own comment in
// src/middleware/userIdentity.ts. The rest of this app's routes guard with requireAuth (a real
// JWT), but nothing in the frontend currently acquires a token, so those routes are unreachable
// from the running app today. The assistant follows the placeholder identity pattern the
// documents/questions module actually wires end-to-end instead, so it works now; migrate
// alongside those once real auth exists.
multilingualRouter.post("/assistant/chat", controller.chatHandler);
multilingualRouter.post("/assistant/transcribe", upload.single("audio"), controller.transcribeHandler);
multilingualRouter.post("/assistant/speak", controller.speakHandler);
