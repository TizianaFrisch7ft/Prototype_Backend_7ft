import { OpenAI } from "openai";
import dotenv from "dotenv";

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const generateAnswer = async (
  mongoInfo: string,
  userQuestion: string
): Promise<string> => {
  const prompt = `
Usá esta información de MongoDB para responder profesionalmente:

📄 Info desde Mongo: ${mongoInfo}
❓ Pregunta del usuario: ${userQuestion}

Respondé de forma clara, útil y precisa.
`;

  const completion = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [
      {
        role: "system",
        content: "Sos un agente experto que responde usando datos extraídos de MongoDB.",
      },
      {
        role: "user",
        content: prompt,
      },
    ],
  });

  return completion.choices[0].message.content || "No se pudo generar respuesta.";
};
