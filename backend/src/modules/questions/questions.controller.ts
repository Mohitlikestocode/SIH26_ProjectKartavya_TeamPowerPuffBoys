import type { Request, Response, NextFunction } from "express";
import { z } from "zod";
import * as service from "./questions.service";
import { ApiError } from "@/middleware/errorHandler";

export async function generateForDocument(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await service.generateQuestionsForDocument(req.params.id);
    res.status(202).json(result);
  } catch (err) {
    next(err);
  }
}

const generateDiagnosticSchema = z.object({
  documentId: z.string(),
  stage: z.enum(["broad", "specific"]),
  targetRoleId: z.string().optional(),
  subSkillIds: z.array(z.string()).optional(),
});

export async function generateDiagnostic(req: Request, res: Response, next: NextFunction) {
  try {
    const parsed = generateDiagnosticSchema.safeParse(req.body);
    if (!parsed.success) throw new ApiError(400, `Invalid request body: ${parsed.error.message}`);
    const result = await service.generateDiagnosticBatch(parsed.data);
    res.status(202).json(result);
  } catch (err) {
    next(err);
  }
}

const statusEnum = z.enum(["draft", "approved", "rejected"]);

const listQuerySchema = z.object({
  documentId: z.string().optional(),
  chunkId: z.string().optional(),
  status: statusEnum.optional(),
  isNegatedStem: z.enum(["true", "false"]).optional(),
  page: z.coerce.number().int().min(1).optional(),
  pageSize: z.coerce.number().int().min(1).max(100).optional(),
});

export async function list(req: Request, res: Response, next: NextFunction) {
  try {
    const parsed = listQuerySchema.safeParse(req.query);
    if (!parsed.success) throw new ApiError(400, `Invalid query: ${parsed.error.message}`);
    const q = parsed.data;

    const result = await service.listQuestions({
      documentId: q.documentId,
      chunkId: q.chunkId,
      status: q.status,
      isNegatedStem: q.isNegatedStem === undefined ? undefined : q.isNegatedStem === "true",
      page: q.page,
      pageSize: q.pageSize,
    });
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function getById(req: Request, res: Response, next: NextFunction) {
  try {
    const question = await service.getQuestion(req.params.id);
    res.json(question);
  } catch (err) {
    next(err);
  }
}

const optionEvaluationSchema = z.object({
  optionIndex: z.number().int().min(0).max(3),
  isTrueStatement: z.boolean(),
  text: z.string().min(1),
});

const editSchema = z.object({
  question: z.string().min(1).optional(),
  options: z.tuple([z.string().min(1), z.string().min(1), z.string().min(1), z.string().min(1)]).optional(),
  isNegatedStem: z.boolean().optional(),
  optionEvaluations: z.array(optionEvaluationSchema).length(4).optional(),
  domain: z.string().min(1).optional(),
  skill: z.string().min(1).optional(),
});

export async function edit(req: Request, res: Response, next: NextFunction) {
  try {
    const parsed = editSchema.safeParse(req.body);
    if (!parsed.success) throw new ApiError(400, `Invalid request body: ${parsed.error.message}`);
    const updated = await service.editQuestion(req.params.id, parsed.data, req.adminId!);
    res.json(updated);
  } catch (err) {
    next(err);
  }
}

const createManualSchema = z.object({
  question: z.string().min(1),
  options: z.tuple([z.string().min(1), z.string().min(1), z.string().min(1), z.string().min(1)]),
  isNegatedStem: z.boolean(),
  optionEvaluations: z.array(optionEvaluationSchema).length(4),
  domain: z.string().min(1).optional(),
  skill: z.string().min(1).optional(),
  approve: z.boolean().optional(),
});

export async function createManual(req: Request, res: Response, next: NextFunction) {
  try {
    const parsed = createManualSchema.safeParse(req.body);
    if (!parsed.success) throw new ApiError(400, `Invalid request body: ${parsed.error.message}`);
    const created = await service.createManualQuestion(parsed.data, req.adminId!);
    res.status(201).json(created);
  } catch (err) {
    next(err);
  }
}

const statusChangeSchema = z.object({ reason: z.string().min(1).optional() });

export async function approve(req: Request, res: Response, next: NextFunction) {
  try {
    const parsed = statusChangeSchema.safeParse(req.body ?? {});
    if (!parsed.success) throw new ApiError(400, `Invalid request body: ${parsed.error.message}`);
    const updated = await service.setQuestionStatus(req.params.id, "approved", req.adminId!, parsed.data.reason);
    res.json(updated);
  } catch (err) {
    next(err);
  }
}

export async function reject(req: Request, res: Response, next: NextFunction) {
  try {
    const parsed = statusChangeSchema.safeParse(req.body ?? {});
    if (!parsed.success) throw new ApiError(400, `Invalid request body: ${parsed.error.message}`);
    const updated = await service.setQuestionStatus(req.params.id, "rejected", req.adminId!, parsed.data.reason);
    res.json(updated);
  } catch (err) {
    next(err);
  }
}
