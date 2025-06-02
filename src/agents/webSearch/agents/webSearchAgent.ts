import { Request, Response } from "express";
import { performWebSearch } from "../services/webSearchService";
import { OpenAI } from "openai";
import dotenv from "dotenv";
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

    const prompt = `
Tu tarea es responder de forma clara y razonada a una pregunta del usuario usando los siguientes resultados de búsqueda web:

Pregunta: ${question}

Resultados Web:
${snippets.map((r, i) => `${i + 1}. ${r}`).join("\n")}

Respuesta:`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: "Sos un asistente experto que responde preguntas en base a búsqueda web actual." },
        { role: "user", content: prompt }
      ]
    });

    const answer = completion.choices[0].message.content || "No se pudo generar respuesta.";
    res.json({ answer, sources: snippets });
  } catch (err) {
    console.error("Error en web search agent:", err);
    res.status(500).json({ error: "Error procesando la búsqueda web." });
  }
};
