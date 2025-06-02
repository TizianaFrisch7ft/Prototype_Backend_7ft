import { Router, Request, Response } from "express";
import { generateAnswer } from "../services/aiService";
import { validateRequest } from "../middlewares/validateRequest";
import { createUser, handleUserQuery } from "../controllers/userController";


const router = Router();

// Ruta base (manual input de info)
router.post("/", async (req: Request, res: Response): Promise<void> => {
  try {
    const { question, info } = req.body;

    if (!question || !info) {
      res.status(400).json({ error: "Missing question or info" });
      return;
    }

    const answer = await generateAnswer(info, question);
    res.json({ answer });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal error generating answer" });
  }
});

// Ruta que usa Mongo
router.post("/ask", validateRequest, handleUserQuery);
router.post("/create", createUser); 

export default router;
