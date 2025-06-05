import { Request, Response } from "express";
import { JSDOM } from "jsdom";
import { Readability } from "@mozilla/readability";
import axios from "axios";
import { getPageContentAndCache, answerFromCachedContent, webPageCache } from "../services/webPageQAService";

export const handleWebPageQA = async (req: Request, res: Response) => {
  const { url, question } = req.body;

  if (!url && !question) {
    return res.status(400).json({ error: "Faltan la URL y/o la pregunta." });
  }

  // ✅ Paso 1: solo URL
  if (url && !question) {
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

      // Usamos el cache global del servicio
      webPageCache.set(url, pageText);

      return res.json({ message: "✅ URL recibida y procesada. Ahora podés hacer preguntas sobre el sitio." });
    } catch (error) {
      console.error("❌ Error procesando URL:", error);
      return res.status(500).json({ error: "No se pudo procesar la URL." });
    }
  }

  // 🤖 Paso 2: solo pregunta
  if (!url && question) {
    const lastUrl = Array.from(webPageCache.keys()).pop();
    if (!lastUrl) {
      return res.status(400).json({ error: "No se ha recibido una URL aún." });
    }

    try {
      const answer = await answerFromCachedContent(lastUrl, String(question));
      return res.json({ answer });
    } catch (error) {
      console.error("❌ Error respondiendo:", error);
      return res.status(500).json({ error: "Error respondiendo con el contenido cacheado." });
    }
  }

  // Caso original: URL + pregunta
  if (url && question) {
    try {
      const answer = await getPageContentAndCache(url, question);
      return res.json({ answer });
    } catch (error) {
      console.error("❌ Error procesando URL + pregunta:", error);
      return res.status(500).json({ error: "Error procesando la página web." });
    }
  }

  return res.status(400).json({ error: "Parámetros no válidos." });
};
