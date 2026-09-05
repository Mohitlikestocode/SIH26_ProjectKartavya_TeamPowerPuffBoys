import type { NextFunction, Request, Response } from "express";
import * as service from "./igot.service";

export async function searchHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const tags = typeof req.query.tag === "string" ? [req.query.tag] : (req.query.tag as string[] | undefined);
    const result = await service.searchCourses({
      tags,
      query: typeof req.query.q === "string" ? req.query.q : undefined,
      page: req.query.page ? Number(req.query.page) : undefined,
      size: req.query.size ? Number(req.query.size) : undefined,
    });
    res.json(result);
  } catch (err) {
    next(err);
  }
}
