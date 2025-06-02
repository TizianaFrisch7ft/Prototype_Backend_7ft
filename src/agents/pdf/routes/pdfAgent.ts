import { Router, Request, Response } from "express";
import multer from "multer";
import { extractTextFromPDF } from "../services/pdfService";
import { generateAnswerFromPDF } from "../services/aiService";
import { savePdfText, getPdfText } from "../services/pdfMemoryStore";

const router = Router();
const upload = multer({ dest: "uploads/" });

type MulterRequest = Request & { file?: Express.Multer.File };

router.post(
  "/upload-pdf",
  upload.single("file"),
  async (req: MulterRequest, res: Response) => {
    try {
      const filePath = req.file?.path;
      if (!filePath) {
        res.status(400).json({ error: "Archivo faltante" });
        return;
      }

      const docText = await extractTextFromPDF(filePath);
      const docId = Date.now().toString(); // o usar uuid

      savePdfText(docId, docText);

      res.json({ docId, message: "PDF cargado correctamente" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Error al cargar el PDF" });
    }
  }
);

router.post(
  "/ask-pdf",
  async (req: Request, res: Response) => {
    try {
      const { docId, question } = req.body;
      if (!docId || !question) {
        res.status(400).json({ error: "Falta docId o pregunta" });
        return;
      }

      const docText = getPdfText(docId);
      if (!docText) {
        res.status(404).json({ error: "Documento no encontrado" });
        return;
      }

      const answer = await generateAnswerFromPDF(docText, question);
      res.json({ answer });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Error al procesar la pregunta" });
    }
  }
);

export default router;
