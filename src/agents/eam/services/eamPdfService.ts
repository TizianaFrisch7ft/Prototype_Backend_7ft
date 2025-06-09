import { promises as fs } from "fs";
import pdfParse from "pdf-parse";

// Esta función recibe uno o varios archivos (Express.Multer.File[])
// y devuelve un array de strings con el texto plano de cada PDF.

export const extractTextFromPDFs = async (files: Express.Multer.File[]): Promise<string[]> => {
  const pdfTexts: string[] = [];

  for (const file of files || []) {
    try {
      // Leer el archivo subido por Multer
      const buffer = await fs.readFile(file.path);
      // Parsear el PDF
      const data = await pdfParse(buffer);
      pdfTexts.push(data.text);
    } catch (err) {
      console.warn(`⚠️ Error procesando el archivo PDF ${file.originalname}:`, err);
    }
  }

  return pdfTexts;
};
