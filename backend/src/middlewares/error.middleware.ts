import type { Request, Response, NextFunction } from "express";
import { AppError } from "../domain/errors.js";

export function errorMiddleware(err: any, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof AppError) {
    return res.status(err.status).json({ error: err.message });
  }
  if (err?.message === "not_found") {
    return res.status(404).json({ error: "Resource not found" });
  }
  console.error(err);
  return res.status(500).json({ error: "Internal Server Error" });
}
