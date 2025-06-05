import { OpenAI } from 'openai';
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export const generateLLMResponse = async ({ query, consulta, pdfChunks, videoLink }: any) => {
  const prompt = `
  Usuario preguntó: "${query}"

  Consulta identificada: ${consulta.tema}
  Resumen técnico: ${consulta.resumen}

  Fragmentos técnicos relevantes:
  - ${pdfChunks.join('\n- ')}

  Video asociado: ${videoLink}

  Por favor, generá una respuesta clara, profesional y útil para el usuario combinando esta información.`;

  const completion = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [{ role: 'user', content: prompt }]
  });

  return completion.choices[0].message.content;
};
