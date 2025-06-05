import axios from "axios";
import { JSDOM } from "jsdom";
import { Readability } from "@mozilla/readability";
import { OpenAI } from "openai";
import dotenv from "dotenv";

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export const getAnswerFromWebPage = async (url: string, question: string): Promise<string> => {
  try {
    const response = await axios.get(url);
    const dom = new JSDOM(response.data, { url }); // Necesario para que Readability funcione bien
    const reader = new Readability(dom.window.document);
    const article = reader.parse();

    if (!article?.textContent) {
      return "No se pudo extraer contenido útil de la página.";
    }

    const cleanedText = article.textContent.replace(/\s+/g, " ").trim();
    const maxLength = 8000;
    const pageText = cleanedText.slice(0, maxLength);

    const prompt = `
Respondé la siguiente pregunta usando únicamente la información de la página web:

URL: ${url}

Contenido extraído:
${pageText}

Pregunta: ${question}

Respuesta:
    `;

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "Sos un asistente que responde preguntas usando solo el contenido de páginas web.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    return completion.choices?.[0]?.message?.content || "No se pudo generar una respuesta útil.";
  } catch (error: any) {
    console.error("❌ Error en getAnswerFromWebPage:", error?.message || error);
    return "Ocurrió un error al procesar la página web.";
  }
};
