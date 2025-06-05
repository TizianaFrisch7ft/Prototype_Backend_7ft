import axios from "axios";
import { JSDOM } from "jsdom";
import { Readability } from "@mozilla/readability";
import { OpenAI } from "openai";
import dotenv from "dotenv";
import { webPageCache } from "../controllers/webPageQAController";

dotenv.config();

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

export const getPageContentAndCache = async (url: string, question: string): Promise<string> => {
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
};

export const answerFromCachedContent = async (url: string, question: string): Promise<string> => {
  const pageText = webPageCache.get(url);
  if (!pageText) throw new Error("No hay contenido cacheado para esta URL.");
  return askOpenAI(pageText, url, question);
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
