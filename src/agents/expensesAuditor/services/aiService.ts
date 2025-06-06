import { OpenAI } from "openai";
import dotenv from "dotenv";
import fs from "fs/promises";
import path from "path";

dotenv.config();
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export const generateAuditResponse = async (
  rulesText: string,
  mongoData: string,
  userQuestion: string
): Promise<string> => {
  const promptPath = path.resolve(__dirname, '../../../prompts/agent-expensesauditor.json');
  const promptData = await fs.readFile(promptPath, 'utf-8');
  const { system, template } = JSON.parse(promptData);

  const finalPrompt = template
    .replace('{{rulesText}}', rulesText)
    .replace('{{mongoData}}', mongoData)
    .replace('{{userQuestion}}', userQuestion);

  try {
    console.log("📤 Prompt enviado a OpenAI:\n", finalPrompt.slice(0, 1000));

    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: system },
        { role: "user", content: finalPrompt }
      ]
    });

    const result = response.choices?.[0]?.message?.content;

    if (!result) {
      console.warn("⚠️ OpenAI no devolvió contenido válido.");
      return "🤖 No se pudo generar una respuesta (vacía).";
    }

    console.log("✅ Respuesta generada:\n", result.slice(0, 1000));
    return result;

  } catch (err) {
    console.error("❌ Error llamando a OpenAI:", err);
    return "🤖 Error al generar respuesta con OpenAI.";
  }
};
