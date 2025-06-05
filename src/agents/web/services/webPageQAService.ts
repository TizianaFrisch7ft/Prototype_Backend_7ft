import axios from "axios";
import { JSDOM } from "jsdom";
import { Readability } from "@mozilla/readability";
import { OpenAI } from "openai";
import dotenv from "dotenv";

dotenv.config();

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

// Define un cache simple en este módulo
export const webPageCache = new Map<string, string>();

export const getPageContentAndCache = async (url: string, question: string): Promise<string> => {
  try {
    const response = await axios.get(url);
    const dom = new JSDOM(response.data, { url });
    const reader = new Readability(dom.window.document);
    const article = reader.parse();

    if (!article?.textContent) {
      throw new Error("No se pudo extraer contenido útil.");
    }

    const cleanedText = article.textContent.replace(/\s+/g, " ").trim();
    const maxLength = 8000;
    const pageText = cleanedText.slice(0, maxLength);

    // Guardar en cache
    webPageCache.set(url, pageText);

    return askOpenAI(pageText, url, question);
  } catch (error: any) {
    console.error("Error en getPageContentAndCache:", error?.message || error);
    throw new Error("Error al procesar la página web.");
  }
};

export const answerFromCachedContent = async (url: string, question: string): Promise<string> => {
  try {
    const pageText = webPageCache.get(url);
    if (!pageText) throw new Error("No hay contenido cacheado para esta URL.");
    return askOpenAI(pageText, url, question);
  } catch (error: any) {
    console.error("Error en answerFromCachedContent:", error?.message || error);
    throw new Error("Error al obtener respuesta desde el cache.");
  }
};

const askOpenAI = async (pageText: string, url: string, question: string): Promise<string> => {
  const prompt = `
Respondé la siguiente pregunta usando únicamente la información de esta página web:

URL: ${url}

Contenido extraído:
${pageText}

Pregunta: ${question}

Respuesta:
  `;

  const completion = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [
      { role: "system", content: "Sos un asistente que responde preguntas sobre páginas web." },
      { role: "user", content: prompt }
    ]
  });

  return completion.choices?.[0]?.message?.content ?? "No se pudo generar una respuesta.";
};
