import { createEmbedding } from '../controllers/vectorAgent';
import fs from 'fs';
import weaviateClient from '../clients/weviateClient';

// ✅ Usamos tu extractor probado
export const extractTextFromPDF = async (filePath: string): Promise<string> => {
  const dataBuffer = fs.readFileSync(filePath);
  const data = await require('pdf-parse')(dataBuffer);
  return data.text;
};

export const uploadPdfAndVectorize = async (file: Express.Multer.File) => {
  try {
    const text = await extractTextFromPDF(file.path);
    const chunks = text.match(/(.|\n){1,500}/g) || [];

    for (const chunk of chunks) {
      try {
        const embedding = await createEmbedding(chunk);
        await weaviateClient.data
          .creator()
          .withClassName('PdfChunk')
          .withProperties({ content: chunk, embedding })
          .do();
      } catch (err) {
        console.warn('⚠️ Error vectorizando un chunk:', err);
      }
    }
  } catch (err) {
    if (err instanceof Error) {
      console.error('❌ Error leyendo PDF con extractTextFromPDF:', err.message);
    } else {
      console.error('❌ Error leyendo PDF con extractTextFromPDF:', err);
    }
    throw new Error('PDF no legible');
  }
};

// 🔍 Sin cambios: sigue sirviendo igual
export const getRelevantPdfChunks = async (query: string) => {
  const embedding = await createEmbedding(query);

  const result = await weaviateClient.graphql
    .get()
    .withClassName('PdfChunk')
    .withFields('content')
    .withNearVector({ vector: embedding, certainty: 0.7 })
    .withLimit(3)
    .do();

  return result.data.Get.PdfChunk.map((c: any) => c.content);
};
