import { Request, Response } from "express";
import { extractTextFromPDF } from "../services/pdfService";
import { saveRulesText, getRulesText } from "../services/pdfMemoryStore";
import { fetchExpensesFromMongo } from "../services/mongoService";
import { generateAuditResponse } from "../services/aiService";
import { connectWithCredentials } from "../../../db/connect";



// 📄 Subida y parseo del PDF con reglas
export const uploadRulesPDF = async (req: Request, res: Response): Promise<void> => {
  try {
    const filePath = req.file?.path;
    if (!filePath) {
      res.status(400).json({ error: "Archivo no proporcionado" });
      return;
    }

    const text = await extractTextFromPDF(filePath);
    const rulesId = Date.now().toString();

    saveRulesText(rulesId, text);
    res.json({ rulesId, message: "Reglas cargadas correctamente" });
  } catch (err) {
    console.error("Error al cargar PDF:", err);
    res.status(500).json({ error: "Error al procesar el archivo" });
  }
};

// 🤖 Auditoría con reglas + gastos
export const auditWithRulesAndData = async (req: Request, res: Response): Promise<void> => {
  try {
    const { rulesId, question } = req.body;

    if (!rulesId || !question) {
      console.warn("⚠️ Faltan campos requeridos en el body:", req.body);
      res.status(400).json({ error: "Faltan campos requeridos" });
      return;
    }

    const rules = getRulesText(rulesId);
    if (!rules) {
      console.warn("📛 Reglas no encontradas para ID:", rulesId);
      res.status(404).json({ error: "Reglas no encontradas" });
      return;
    }

    const expensesData = await fetchExpensesFromMongo();
    const answer = await generateAuditResponse(rules, expensesData, question);

    if (!answer || answer.startsWith("🤖")) {
      console.error("❌ Respuesta inválida del modelo:", answer);
      res.status(500).json({ error: "No se pudo generar respuesta del modelo." });
      return;
    }

    res.json({ answer });

  } catch (err) {
    console.error("🔥 Error en auditoría:", err);
    res.status(500).json({ error: "Error interno durante la auditoría" });
  }
};

// 🌐 Conexión a Mongo desde frontend
export const connectToMongoFromClient = async (req: Request, res: Response): Promise<void> => {
  const { dbUser, dbPassword, dbName, cluster } = req.body;

  if (!dbUser || !dbPassword || !dbName || !cluster) {
    res.status(400).json({ error: "Faltan datos de conexión" });
    return;
  }

  try {
    await connectWithCredentials(dbUser, dbPassword, dbName, cluster);
    res.json({ success: true, message: "Conexión a Mongo establecida con éxito" });
  } catch (err) {
    console.error("Error al conectar desde frontend:", err);
    res.status(500).json({ error: "No se pudo conectar a MongoDB" });
  }
};
