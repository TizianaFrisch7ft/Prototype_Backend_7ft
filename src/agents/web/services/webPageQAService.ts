import fs from "fs/promises";
import path from "path";
import OpenAI from "openai";

const openai = new OpenAI();

// ...

const askOpenAI = async (pageText: string, url: string, question: string): Promise<string> => {
  const promptPath = path.resolve(__dirname, "../../../prompts/agent-web.json");
  const data = await fs.readFile(promptPath, "utf-8");
  const { system, template } = JSON.parse(data);

  const filledPrompt = template
    .replace("{{url}}", url)
    .replace("{{pageText}}", pageText)
    .replace("{{question}}", question);

  const completion = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [
      { role: "system", content: system },
      { role: "user", content: filledPrompt }
    ]
  });

  return completion.choices?.[0]?.message?.content ?? "No se pudo generar una respuesta.";
};
