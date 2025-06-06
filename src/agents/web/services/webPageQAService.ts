import axios from "axios";
import { JSDOM } from "jsdom";
import { Readability } from "@mozilla/readability";
import { OpenAI } from "openai";
import dotenv from "dotenv";
import fs from "fs/promises";
import path from "path";

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
  const promptPath = path.resolve(__dirname, "../../../prompts/agent-web.json");
  const data = await fs.readFile(promptPath, "utf-8");
  const { system, template } = JSON.parse(data);

  const filledPrompt = template
    .replace("{{url}}", url)
    .replace("{{pageText}}", pageText)
    .replace("{{question}}", question);

  const completion = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [
      { role: "system", content: system },
      { role: "user", content: filledPrompt }
    ]
  });

  return completion.choices?.[0]?.message?.content ?? "No se pudo generar una respuesta.";
};