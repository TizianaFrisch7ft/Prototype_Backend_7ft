import { OpenAI } from "openai";
import dotenv from "dotenv";
dotenv.config();

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export const generateAnswerFromPDF = async (
  docText: string,
  userQuestion: string
): Promise<string> => {
  const prompt = `
Tenés que responder esta pregunta basándote únicamente en el siguiente documento:

📄 Documento:
${docText}

❓ Pregunta:
${userQuestion}

Respondé en forma clara, breve y profesional.
`;

  const completion = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [
      { role: "system", content: "Sos un asistente experto que responde preguntas sobre documentos PDF." },
      { role: "user", content: prompt }
    ]
  });

  return completion.choices[0].message.content || "No se pudo generar una respuesta.";
};
