import { OpenAI } from "openai";
import dotenv from "dotenv";
dotenv.config();

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export const generateAuditResponse = async (
  rulesText: string,
  mongoData: string,
  userQuestion: string
): Promise<string> => {
  const prompt = `
Sos un auditor experto.

📋 Estas son las reglas contables a considerar:
${rulesText}

📊 Estos son los datos reales de gastos:
${mongoData}

❓ Pregunta del usuario:
${userQuestion}

Respondé de forma clara, profesional y basada únicamente en la información anterior.
`.trim();

  try {
    console.log("📤 Prompt enviado a OpenAI:\n", prompt.slice(0, 1000)); // truncado si es largo

    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "Sos un asistente experto en auditoría contable.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const result = response.choices?.[0]?.message?.content;
    
    if (!result) {
      console.warn("⚠️ OpenAI no devolvió contenido válido.");
      return "🤖 No se pudo generar una respuesta (vacía).";
    }

    console.log("✅ Respuesta generada:\n", result.slice(0, 1000)); // truncado
    return result;

  } catch (err) {
    console.error("❌ Error llamando a OpenAI:", err);
    return "🤖 Error al generar respuesta con OpenAI.";
  }
};
