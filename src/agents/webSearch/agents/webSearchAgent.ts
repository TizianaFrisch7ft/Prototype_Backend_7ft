import { Request, Response } from "express";
import { performWebSearch } from "../services/webSearchService";
import { OpenAI } from "openai";
import dotenv from "dotenv";
import fs from "fs/promises";
import path from "path";

dotenv.config();

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

export const handleWebSearch = async (req: Request, res: Response): Promise<void> => {
  try {
    const { question } = req.body;
    if (!question) {
      res.status(400).json({ error: "Falta la pregunta" });
      return;
    }

    const snippets = await performWebSearch(question);

    // 📄 Cargar el prompt desde archivo
    const promptPath = path.resolve(__dirname, '../../../prompts/webPrompt.json');
    const promptData = await fs.readFile(promptPath, 'utf-8');
    const { system, template } = JSON.parse(promptData);

    const filledPrompt = template
      .replace('{{question}}', question)
      .replace('{{snippets}}', snippets.map((r, i) => `${i + 1}. ${r}`).join('\n'));

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: system },
        { role: "user", content: filledPrompt }
      ]
    });

    const answer = completion.choices[0].message.content || "No se pudo generar respuesta.";
    res.json({ answer, sources: snippets });

  } catch (err) {
    console.error("❌ Error en web search agent:", err);
    res.status(500).json({ error: "Error procesando la búsqueda web." });
  }
};
