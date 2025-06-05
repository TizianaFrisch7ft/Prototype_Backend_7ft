import { Request, Response } from "express";
import { getPageContentAndCache, answerFromCachedContent } from "../services/webPageQAService";

// Almacén en memoria (clave: url, valor: texto)
export const webPageCache = new Map<string, string>();

export const handleWebPageQA = async (req: Request, res: Response) => {
  const { url, question } = req.body;

  if (!url && !question) {
    return res.status(400).json({ error: "Faltan la URL y la pregunta." });
  }

  if (url && question) {
    // Primera vez: se envía URL y pregunta
    try {
      const answer = await getPageContentAndCache(url, question);
      return res.json({ answer });
    } catch (error) {
      console.error("❌ Error inicial:", error);
      return res.status(500).json({ error: "Error procesando la página web." });
    }
  }

  if (!url && question) {
    // Pregunta adicional: usa la última URL guardada (puede ajustarse para múltiples sesiones)
    const lastUrl = Array.from(webPageCache.keys()).pop();
    if (!lastUrl) {
      return res.status(400).json({ error: "No se ha enviado una URL previamente." });
    }

    try {
      const answer = await answerFromCachedContent(lastUrl, question);
      return res.json({ answer });
    } catch (error) {
      console.error("❌ Error en pregunta secundaria:", error);
      return res.status(500).json({ error: "Error respondiendo con el contenido cacheado." });
    }
  }

  return res.status(400).json({ error: "Parámetros incorrectos." });
};
