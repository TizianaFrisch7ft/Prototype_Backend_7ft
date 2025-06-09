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
): Promise<string | null> => {
  try {
    const promptPath = path.resolve(process.cwd(), 'prompts/agent-expensesauditor.json');
    const promptData = await fs.readFile(promptPath, 'utf-8');
    const { system, template } = JSON.parse(promptData);

    const finalPrompt = template
      .replace('{{rulesText}}', rulesText)
      .replace('{{mongoData}}', mongoData)
      .replace('{{userQuestion}}', userQuestion);

    console.log("📤 Prompt enviado a OpenAI:\n", finalPrompt.slice(0, 800));

    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: system },
        { role: "user", content: finalPrompt }
      ]
    });

    console.log("🧠 OpenAI full response:", JSON.stringify(response, null, 2));

    const result = response.choices?.[0]?.message?.content;
    if (!result) {
      console.warn("⚠️ OpenAI no devolvió contenido válido.");
      return null;
    }

    return result;
  } catch (err) {
    console.error("❌ Error llamando a OpenAI:", err);
    return null;
  }
};
