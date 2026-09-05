import { Router } from "express";
import multer from "multer";
import * as controller from "./documents.controller";
import * as questionsController from "../questions/questions.controller";

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 25 * 1024 * 1024 } });

export const documentsRouter = Router();

documentsRouter.post("/", upload.single("file"), controller.upload);
documentsRouter.get("/:id", controller.getById);
documentsRouter.post("/:id/generate", questionsController.generateForDocument);
