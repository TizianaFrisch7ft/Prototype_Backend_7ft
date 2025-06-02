import weaviate from 'weaviate-ts-client';
import * as dotenv from 'dotenv';
dotenv.config();

const client = weaviate.client({
  scheme: 'https',
  host: process.env.WEAVIATE_HOST!,
  apiKey: new weaviate.ApiKey(process.env.WEAVIATE_API_KEY!)
});

async function createSchema() {
  const classObj = {
  class: 'Content',
  vectorizer: 'text2vec-openai',
  moduleConfig: {
    'text2vec-openai': {
      model: 'text-embedding-3-small',  // 👈 CAMBIO ACÁ
      type: 'text'
    }
  },
  properties: [
    {
      name: 'text',
      dataType: ['text']
    }
  ]
};


  try {
    await client.schema.classCreator().withClass(classObj).do();
    console.log('✅ Esquema creado');
  } catch (err) {
    console.error('❌ Error creando esquema:', err);
  }
}

createSchema();
