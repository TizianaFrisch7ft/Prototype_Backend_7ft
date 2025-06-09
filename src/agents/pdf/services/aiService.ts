import { OpenAI } from "openai";
import dotenv from "dotenv";
import fs from "fs/promises";
import path from "path";

dotenv.config();
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export const generateAnswerFromPDF = async (
  docText: string,
  userQuestion: string
): Promise<string> => {
  const promptPath = path.resolve(process.cwd(), 'prompts/agent-documents.json');
  const data = await fs.readFile(promptPath, 'utf-8');
  const { system, template } = JSON.parse(data);

  const finalPrompt = template
    .replace('{{docText}}', docText)
    .replace('{{userQuestion}}', userQuestion);

  const completion = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [
      { role: "system", content: system },
      { role: "user", content: finalPrompt }
    ]
  });

  return completion.choices[0].message.content || "No se pudo generar una respuesta.";
};