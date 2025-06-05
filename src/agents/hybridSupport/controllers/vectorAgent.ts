import { OpenAI } from 'openai';
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export const createEmbedding = async (text: string): Promise<number[]> => {
  const res = await openai.embeddings.create({
    model: 'text-embedding-ada-002',
    input: text
  });

  return res.data[0].embedding;
};
