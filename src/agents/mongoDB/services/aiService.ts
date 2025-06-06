import { OpenAI } from "openai";
import dotenv from "dotenv";
import fs from "fs/promises";
import path from "path";

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const generateAnswer = async (
  mongoInfo: string,
  userQuestion: string
): Promise<string> => {
  // Leer el prompt desde el archivo
  const promptPath = path.join(__dirname, "../db/prompts/mongoPrompt.json");
  const promptDataRaw = await fs.readFile(promptPath, "utf-8");
  const promptData = JSON.parse(promptDataRaw);

  const systemPrompt = promptData.system;
  const userPrompt = promptData.template
    .replace("{{mongoInfo}}", mongoInfo)
    .replace("{{userQuestion}}", userQuestion);

  const completion = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [
      {
        role: "system",
        content: systemPrompt,
      },
      {
        role: "user",
        content: userPrompt,
      },
    ],
  });

  return completion.choices[0].message.content || "No se pudo generar respuesta.";
};
