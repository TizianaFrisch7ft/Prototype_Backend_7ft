import express from "express";
import multer from "multer";
import {
  uploadRulesPDF,
  auditWithRulesAndData,
  connectToMongoFromClient
} from "../controllers/auditController";

const router = express.Router();
const upload = multer({ dest: "uploads/" });

router.post("/connect-db", connectToMongoFromClient); 
router.post("/upload-rules", upload.single("file"), uploadRulesPDF);
router.post("/audit", auditWithRulesAndData);

export default router;
