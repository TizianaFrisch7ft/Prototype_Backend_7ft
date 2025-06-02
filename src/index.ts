import express from "express"
import cors from "cors"
import dotenv from "dotenv"

// 🧾 PDF
import pdfRulesRoutes from "./agents/pdf/routes/pdfAgent";

// 📊 Auditor de gastos
import auditRoutes from "./agents/expensesAuditor/routes/auditRoutes";

// 🧠 Vector Weaviate
import vectorRoutes from "./agents/vectorize/routes/vectorRoutes";

// 🌐 Web Search
import webSearchRoutes from "./agents/webSearch/routes/webRoutes";

// 🗄️ MongoDB
import mongoDBRoutes from "./agents/mongoDB/routes/dbRoutes";
import mongoUserRoutes from "./agents/mongoDB/routes/userRoutes";




dotenv.config()

const app = express()
app.use(cors())
app.use(express.json())

app.use("/api/pdf", pdfRulesRoutes);


app.use("/api/audit", auditRoutes);

app.use("/api/vector", vectorRoutes);
app.use("/api/web", webSearchRoutes);

app.use("/api/mongo", mongoDBRoutes);
app.use("/api/mongo/user", mongoUserRoutes);


const PORT = process.env.PORT || 4000
app.listen(PORT, () => {
  console.log(`🟢 Server listening at http://localhost:${PORT}`)
})
