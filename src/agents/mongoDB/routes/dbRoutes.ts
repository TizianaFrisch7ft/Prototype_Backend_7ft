import express, { Request, Response, RequestHandler } from "express";
import { userSchema } from "../models/user";
import { generateAnswer } from "../services/aiService";
import mongoose, { Connection } from "mongoose";

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
  console.log("Request body:", req.body);
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
    console.log("✅ Conectado dinámicamente con éxito");
    res.status(200).json({ success: true });
  } catch (error) {
    console.error("❌ Error conectando dinámicamente:", error instanceof Error ? error.stack : error);
    res.status(500).json({ success: false, error: "No se pudo conectar a la base" });
  }
};

interface AskDbBody {
  question: string;
}

const askDbHandler: RequestHandler<{}, any, AskDbBody> = async (req, res) => {
  if (!dynamicConn) {
    res.status(400).json({ success: false, error: "No hay conexión activa." });
    return;
  }

  try {
    const { question } = req.body;
    if (!question || typeof question !== "string") {
      res.status(400).json({ success: false, error: "La pregunta es requerida y debe ser una cadena." });
      return;
    }

    const UserModel = dynamicConn.models.User || dynamicConn.model("User", userSchema);

    
    const users = await UserModel.find({}).lean();
    const mongoInfo = JSON.stringify(users, null, 2);

    const gptAnswer = await generateAnswer(mongoInfo, question);

    res.json({ answer: gptAnswer });

  } catch (error) {
    console.error("❌ Error en /ask-db:", error instanceof Error ? error.stack : error);
    res.status(500).json({
      error: "Error consultando los datos",
      detail: error instanceof Error ? error.message : "Unknown error"
    });
  }
};


dbRouter.post("/connect-db", connectDbHandler);
dbRouter.post("/ask-db", askDbHandler);

export default dbRouter;