import { Request, Response } from "express";
import { getAnswerFromWebPage } from "../services/webPageQAService";

// ✔ No usar RequestHandler para evitar conflicto de tipos
export const handleWebPageQA = async (req: Request, res: Response) => {
  const { url, question } = req.body;

  if (!url || !question) {
    return res.status(400).json({ error: "Faltan la URL o la pregunta" });
  }

  try {
    const answer = await getAnswerFromWebPage(url, question);
    return res.json({ answer });
  } catch (error) {
    console.error("❌ Error en webPageQA:", error);
    return res.status(500).json({ error: "Error procesando la página web." });
  }
};
