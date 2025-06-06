// src/agents/vectorize/controllers/vectorController.ts
import { Request, Response } from "express";
import { searchSimilarTexts } from "../services/weaviateService";
import { OpenAI } from "openai";
import fs from "fs/promises";
import path from "path";

const openai = new OpenAI({ apiKey: process.env.OPENAI_APIKEY! });

export const handleVectorQuery = async (req: Request, res: Response) => {
  try {
    const { question } = req.body;
    if (!question) {
      res.status(400).json({ error: "Falta la pregunta" });
      return;
    }

    const chunks = await searchSimilarTexts(question);
    const contextText = chunks.map((c, i) => `${i + 1}. ${c}`).join("\n");

    // 📄 Cargar el prompt desde vectorPrompt.json
    const promptPath = path.resolve(__dirname, '../../../prompts/vectorPrompt.json');
    const data = await fs.readFile(promptPath, 'utf-8');
    const { system, template } = JSON.parse(data);

    const filledPrompt = template
      .replace('{{retrievedText}}', contextText)
      .replace('{{userQuestion}}', question);

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: system },
        { role: "user", content: filledPrompt }
      ]
    });

    const answer = completion.choices[0].message.content || "No se pudo generar respuesta.";
    res.json({ answer, context: chunks });

  } catch (error) {
    console.error("❌ Error en agent-vector:", error);
    res.status(500).json({ error: "Error en el agente vectorizado." });
  }
};
