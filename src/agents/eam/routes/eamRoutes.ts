import { Router, Request, Response } from "express";
import multer from "multer";
import pdfParse from "pdf-parse";
import mongoose from "mongoose";
import { connectWithCredentials } from "../../../db/connect";
import { generateLLMResponse } from "../services/eamLLMService";
import fs from "fs/promises";

const router = Router();
const upload = multer({ dest: "uploads/" });

router.post("/ask", upload.array("pdfs", 2), async (req: Request, res: Response): Promise<void> => {
  try {
    const { query, machineId, dbCreds } = req.body;

    if (!query || !machineId || !dbCreds) {
      res.status(400).json({ error: "Faltan datos requeridos" });
      return;
    }

    // Si dbCreds llega como string, lo parseás:
    const creds = typeof dbCreds === "string" ? JSON.parse(dbCreds) : dbCreds;

    // Conexión dinámica a MongoDB:
    const conn = await connectWithCredentials(
      creds.user,
      creds.password,
      creds.dbName,
      creds.cluster
    );

    // Modelos dinámicos:
    const Machine = conn.model("Machine", new mongoose.Schema({
      _id: String,
      name: String,
      description: String,
      model: String
    }), "machines");

    const Consulta = conn.model("Consulta", new mongoose.Schema({
      ticket: String,
      user_input: String,
      output_user: String
    }), "consultas");

    // Consultas a la base:
    const machine = await Machine.findById(machineId);
    const consultas = await Consulta.find({ ticket: machineId });

    // PDFs subidos:
    const files = req.files as Express.Multer.File[] || [];
    const pdfChunks: string[] = [];
    for (const file of files) {
      try {
        const buffer = await fs.readFile(file.path);
        const data = await pdfParse(buffer);
        pdfChunks.push(data.text);
      } catch (err) {
        console.warn(`⚠️ Error procesando PDF ${file.originalname}:`, err);
      }
    }

  const respuesta = await generateLLMResponse({
  query,
  machine,
  consultas,
  pdfChunks
});

// Si tu generateLLMResponse ya devuelve { result, videos }
res.json(respuesta);
  } catch (err: any) {
    console.error("❌ Error en /ask:", err);
    res.status(500).json({ error: err.message || "Error generando respuesta" });
  }
});

export default router;
