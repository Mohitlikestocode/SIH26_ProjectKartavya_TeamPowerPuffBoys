import type { Request, Response, NextFunction } from "express";
import * as service from "./documents.service";
import { ApiError } from "@/middleware/errorHandler";

export async function upload(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.file) throw new ApiError(400, "No file uploaded (expected multipart field 'file').");
    const document = await service.ingestDocument({
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      buffer: req.file.buffer,
    });
    res.status(201).json(document);
  } catch (err) {
    next(err);
  }
}

export async function getById(req: Request, res: Response, next: NextFunction) {
  try {
    const document = await service.getDocument(req.params.id);
    res.json(document);
  } catch (err) {
    next(err);
  }
}
