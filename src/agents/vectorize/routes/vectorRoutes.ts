import express from "express";
import { handleVectorQuery } from "../controllers/vectorAgent";

const router = express.Router();

router.post("/ask", handleVectorQuery);

export default router;
