import express from "express"
import cors from "cors"
import dotenv from "dotenv"

// 🧾 PDF
import pdfAgents from "./agents/pdf/routes/pdfAgent";

// 📊 Auditor de gastos
import auditRoutes from "./agents/expensesAuditor/routes/auditRoutes";

// 🧠 Vector Weaviate
import vectorRoutes from "./agents/vectorize/routes/vectorRoutes";

// 🌐 Web Search
import webRoutes from "./agents/webSearch/routes/webRoutes";

// 🗄️ MongoDB
import dbRoutes from "./agents/mongoDB/routes/dbRoutes";
import userRoutes from "./agents/mongoDB/routes/userRoutes";




dotenv.config()

const app = express()
app.use(cors())
app.use(express.json())

app.use("/api/pdf", pdfAgents);


app.use("/api/audit", auditRoutes);

app.use("/api/vector", vectorRoutes);
app.use("/api/web", webRoutes);

app.use("/api/mongo", dbRoutes);
app.use("/api/mongo/user", userRoutes);

const PORT = process.env.PORT || 4000
app.listen(PORT, () => {
  console.log(`🟢 Server listening at http://localhost:${PORT}`)
})
