import weaviate from 'weaviate-ts-client';
import * as dotenv from 'dotenv';
dotenv.config();

const client = weaviate.client({
  scheme: 'https',
  host: process.env.WEAVIATE_HOST!,
  apiKey: new weaviate.ApiKey(process.env.WEAVIATE_API_KEY!)
});

async function listSchema() {
  const schema = await client.schema.getter().do();
  console.log(JSON.stringify(schema, null, 2));
}

listSchema();
