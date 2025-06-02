import weaviate from 'weaviate-ts-client';
import * as dotenv from 'dotenv';
dotenv.config();

const client = weaviate.client({
  scheme: 'https',
  host: process.env.WEAVIATE_HOST!,
  apiKey: new weaviate.ApiKey(process.env.WEAVIATE_API_KEY!)
});

async function pingWeaviate() {
  try {
    const res = await client.misc.liveChecker().do();
    console.log("✅ Conectado a Weaviate:", res);
  } catch (err) {
    console.error("❌ No se pudo conectar a Weaviate:", err);
  }
}

pingWeaviate();
