import weaviate from 'weaviate-ts-client';
import * as dotenv from 'dotenv';
dotenv.config();

const client = weaviate.client({
  scheme: 'https',
  host: process.env.WEAVIATE_HOST!,
  apiKey: new weaviate.ApiKey(process.env.WEAVIATE_API_KEY!)
});

async function createPdfChunkSchema() {
  const classObj = {
    class: 'PdfChunk',
    vectorizer: 'text2vec-openai',
    moduleConfig: {
      'text2vec-openai': {
        model: 'text-embedding-3-small',
        type: 'text'
      }
    },
    properties: [
      {
        name: 'content',
        dataType: ['text']
      }
    ]
  };

  try {
    await client.schema.classCreator().withClass(classObj).do();
    console.log('✅ Clase PdfChunk creada');
  } catch (err) {
    console.error('❌ Error creando clase PdfChunk:', err);
  }
}

createPdfChunkSchema();
