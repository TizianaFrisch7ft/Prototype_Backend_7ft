// src/agents/vectorize/controllers/vectorController.ts
import { Request, Response } from "express";
import { searchSimilarTexts } from "../services/weaviateService";
import { OpenAI } from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_APIKEY! });

export const handleVectorQuery = async (req: Request, res: Response) => {
  try {
    const { question } = req.body;
    if (!question) {
      res.status(400).json({ error: "Falta la pregunta" });
      return;
    }

    const chunks = await searchSimilarTexts(question);

    const prompt = `
Respondé la siguiente pregunta del usuario usando solo la información de los fragmentos:

Pregunta: ${question}

Fragmentos:
${chunks.map((c, i) => `${i + 1}. ${c}`).join("\n")}

Respuesta:
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: "Sos un asistente experto que responde solo con el contenido proporcionado." },
        { role: "user", content: prompt }
      ]
    });

    const answer = completion.choices[0].message.content || "No se pudo generar respuesta.";
    res.json({ answer, context: chunks });

  } catch (error) {
    console.error("Error en agent-vector:", error);
    res.status(500).json({ error: "Error en el agente vectorizado." });
  }
};
