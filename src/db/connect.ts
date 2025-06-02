// src/db/connect.ts
import mongoose, { Connection } from "mongoose";
import dotenv from "dotenv";
dotenv.config();

let activeConnection: Connection | null = null;

/**
 * Conexión estática desde .env (para agentes fijos)
 */
export const connectDB = async (): Promise<void> => {
  try {
    const uri = process.env.MONGO_URI;
    if (!uri) throw new Error("Falta la variable MONGO_URI en el .env");

    await mongoose.connect(uri);
    console.log("✅ MongoDB Atlas conectado correctamente");
  } catch (err) {
    console.error("❌ Error al conectar a MongoDB:", err);
    process.exit(1);
  }
};

/**
 * Conexión dinámica con credenciales desde frontend
 */
export const connectWithCredentials = async (
  dbUser: string,
  dbPassword: string,
  dbName: string,
  cluster: string
): Promise<Connection> => {
  const uri = `mongodb+srv://${dbUser}:${dbPassword}@${cluster}/${dbName}?retryWrites=true&w=majority&appName=Cluster0`;

  if (activeConnection?.readyState === 1) {
    console.log("🔁 Cerrando conexión anterior...");
    await activeConnection.close();
  }

  const conn = mongoose.createConnection(uri);

  return new Promise((resolve, reject) => {
    conn.once("open", () => {
      console.log("✅ Conexión dinámica a MongoDB exitosa.");
      activeConnection = conn;
      resolve(conn);
    });

    conn.on("error", err => {
      console.error("❌ Error al conectar dinámicamente a MongoDB:", err);
      reject(err);
    });
  });
};

export const getActiveConnection = (): Connection | null => {
  return activeConnection;
};
