import weaviate from 'weaviate-ts-client';
import * as dotenv from 'dotenv';
dotenv.config();

const client = weaviate.client({
  scheme: 'https',
  host: process.env.WEAVIATE_HOST!, // sin "https://"
  apiKey: new weaviate.ApiKey(process.env.WEAVIATE_API_KEY!)
});

// Insertar texto (Weaviate genera vector automáticamente)
export async function insertText(text: string) {
  try {
    const res = await client.data
      .creator()
      .withClassName('Content')
      .withProperties({ text })
      .do();
    console.log('✅ Documento insertado:', res);
  } catch (err) {
    console.error('❌ Error insertando texto:', err);
  }
}

// Buscar textos similares
export async function searchSimilarTexts(query: string, topK = 5): Promise<string[]> {
  try {
    const res = await client.graphql
      .get()
      .withClassName('Content')
      .withFields('text _additional { distance }')
      .withNearText({ concepts: [query] })
      .withLimit(topK)
      .do();

    const results = res.data.Get.Content || [];
    return results.map((item: any) => item.text);
  } catch (err) {
    console.error('❌ Error en la búsqueda:', err);
    return [];
  }
}
