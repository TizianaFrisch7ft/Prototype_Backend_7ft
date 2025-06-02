import express from "express";
import { handleWebSearch } from "../agents/webSearchAgent";

const router = express.Router();

router.post("/ask", handleWebSearch);

export default router;
