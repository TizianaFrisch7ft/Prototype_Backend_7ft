import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// 🧾 PDF
import pdfAgents from "./agents/pdf/routes/pdfAgent";

// 📊 Auditor de gastos
import auditRoutes from "./agents/expensesAuditor/routes/auditRoutes";

// 🧠 Vector Weaviate
import vectorRoutes from "./agents/vectorize/routes/vectorRoutes";

// 🌐 Web Search
import webSearchRoutes from "./agents/webSearch/routes/webRoutes";

// 🗄️ MongoDB
import dbRoutes from "./agents/mongoDB/routes/dbRoutes";
import userRoutes from "./agents/mongoDB/routes/userRoutes";

import eamRoutes from "./agents/eam/routes/eamRoutes";

// 🌍 QA Webpages
import webPageQARoutes from "./agents/web/routes/webPageQARoutes";

import promptRoutes from './routes/promptRoutes';


// 🔌 Rutas
app.use("/api/agent-pdf", pdfAgents);
app.use("/api/agent-audit", auditRoutes);
app.use("/api/agent-websearch", webSearchRoutes);
app.use("/api/agent-db", dbRoutes);
app.use("/api/agent-vectorize", vectorRoutes);
app.use("/api/agent-web", webPageQARoutes); 
app.use('/api/prompts', promptRoutes);
app.use("/api/agent-eam", eamRoutes);
// 🚀 Server
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`🟢 Server listening at http://localhost:${PORT}`);
});

