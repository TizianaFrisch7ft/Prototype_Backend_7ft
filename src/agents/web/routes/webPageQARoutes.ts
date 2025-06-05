import express from "express";
import { handleWebPageQA } from "../controllers/webPageQAController";

const router = express.Router();

router.post("/ask", (req, res, next) => {
  handleWebPageQA(req, res).catch(next);
});

export default router;
