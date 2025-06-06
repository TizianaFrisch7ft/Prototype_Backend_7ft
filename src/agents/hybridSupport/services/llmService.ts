import { OpenAI } from 'openai';
import fs from 'fs/promises';
import path from 'path';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

export const generateLLMResponse = async ({ query, consulta, pdfChunks, videoLink }: any) => {
  // Leer prompt desde archivo
  const promptPath = path.resolve(__dirname, '../../../prompts/agent-hybrid.json');
  const data = await fs.readFile(promptPath, 'utf-8');
  const { system, template } = JSON.parse(data);

  // Reemplazar variables en template
  const filledPrompt = template
    .replace('{{query}}', query)
    .replace('{{tema}}', consulta.tema)
    .replace('{{resumen}}', consulta.resumen)
    .replace('{{pdfChunks}}', pdfChunks.join('\n- '))
    .replace('{{videoLink}}', videoLink || 'No disponible');

  // Enviar a OpenAI
  const completion = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [
      { role: 'system', content: system },
      { role: 'user', content: filledPrompt }
    ]
  });

  return completion.choices[0].message.content || 'No se pudo generar respuesta.';
};
