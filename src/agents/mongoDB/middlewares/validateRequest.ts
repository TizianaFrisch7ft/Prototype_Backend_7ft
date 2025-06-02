// src/middlewares/validateRequest.ts
import { Request, Response, NextFunction } from "express";

export const validateRequest = (req: Request, res: Response, next: NextFunction): void => {
  const { question, userId } = req.body;

  if (!question || !userId) {
    res.status(400).json({ error: "Missing question or recordId" });
    return;
  }

  next(); // ✅ continuar al siguiente middleware
};
