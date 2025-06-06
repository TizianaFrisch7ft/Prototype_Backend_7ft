import express, { Request, Response, RequestHandler } from "express";
import { userSchema } from "../models/user";
import { OpenAI } from "openai";
import mongoose, { Connection } from "mongoose";
import fs from "fs/promises";
import path from "path";
import dotenv from "dotenv";

dotenv.config();

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

let dynamicConn: Connection | null = null;
const dbRouter = express.Router();

interface ConnectDbBody {
  dbType: string;
  dbUser: string;
  dbPassword: string;
  dbName: string;
  cluster: string;
}

const connectDbHandler: RequestHandler<{}, any, ConnectDbBody> = async (req, res) => {
  const { dbType, dbUser, dbPassword, dbName, cluster } = req.body;

  if (!dbType || !dbUser || !dbPassword || !dbName || !cluster) {
    res.status(400).json({ success: false, error: "Faltan datos de conexión." });
    return;
  }

  if (dbType !== "mongodb") {
    res.status(400).json({ success: false, error: "Solo MongoDB por ahora." });
    return;
  }

  try {
    if (dynamicConn?.readyState === 1) {
      await dynamicConn.close();
      dynamicConn = null;
    }

    const uri = `mongodb+srv://${dbUser}:${dbPassword}@${cluster}/${dbName}?retryWrites=true&w=majority&appName=Cluster0`;
    const conn = mongoose.createConnection(uri);

    await new Promise<void>((resolve, reject) => {
      conn.once("open", () => resolve());
      conn.once("error", err => reject(err));
    });

    dynamicConn = conn;
    console.log("✅ Conectado a MongoDB dinámicamente");
    res.status(200).json({ success: true });

  } catch (error) {
    console.error("❌ Error de conexión Mongo:", error);
    res.status(500).json({ success: false, error: "No se pudo conectar a la base" });
  }
};

interface AskDbBody {
  question: string;
}

const askDbHandler: RequestHandler<{}, any, AskDbBody> = async (req, res) => {
  if (!dynamicConn) {
    res.status(400).json({ success: false, error: "No hay conexión activa a MongoDB." });
    return;
  }

  try {
    const { question } = req.body;
    if (!question || typeof question !== "string") {
      res.status(400).json({ success: false, error: "La pregunta es requerida." });
      return;
    }

    const UserModel = dynamicConn.models.User || dynamicConn.model("User", userSchema);
    const users = await UserModel.find({}).lean();
    const mongoInfo = JSON.stringify(users, null, 2);

    // 🧠 Cargar prompt
    const promptPath = path.resolve(__dirname, '../../../../prompts/agent-bd.json');
    const promptData = await fs.readFile(promptPath, 'utf-8');
    const { system, template } = JSON.parse(promptData);

    const filledPrompt = template
      .replace('{{mongoInfo}}', mongoInfo)
      .replace('{{userQuestion}}', question);

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: system },
        { role: "user", content: filledPrompt }
      ]
    });

    const answer = completion.choices[0].message.content || "No se pudo generar respuesta.";
    res.json({ answer });

  } catch (error) {
    console.error("❌ Error en /ask-db:", error);
    res.status(500).json({
      error: "Error procesando la pregunta.",
      detail: error instanceof Error ? error.message : "Unknown"
    });
  }
};

dbRouter.post("/connect-db", connectDbHandler);
dbRouter.post("/ask", askDbHandler);

export default dbRouter;
