import { Request, Response, NextFunction } from "express";

export const validateAuditRequest = (req: Request, res: Response, next: NextFunction) => {
  const { rulesId, question } = req.body;
  if (!rulesId || !question) {
    return res.status(400).json({ error: "Faltan campos requeridos: rulesId y question" });
  }
  next();
};
