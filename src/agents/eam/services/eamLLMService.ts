import { OpenAI } from "openai";
import dotenv from "dotenv";
import fs from "fs/promises";
import path from "path";

dotenv.config();
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export const generateLLMResponse = async ({
  query,
  machine,
  consultas,
  pdfChunks
}: {
  query: string;
  machine: any;
  consultas: any[];
  pdfChunks: string[];
}) => {
  const promptPath = path.resolve(process.cwd(), "prompts/agent-eam.json");
  const data = await fs.readFile(promptPath, "utf-8");
  const { system, template } = JSON.parse(data);

const consultasTexto = consultas
  .map(c =>
    `Q: ${c.user_input}\nA: ${c.output_user}` +
    (c.video ? `\nVideo: ${c.video}` : "")
  )
  .join("\n");


  const videos = consultas.filter(c => c.video).map(c => c.video).join("\n");
const finalPrompt = template
  .replace("{{query}}", query)
  .replace("{{machine}}", JSON.stringify(machine, null, 2))
  .replace("{{consultas}}", consultasTexto)
  .replace("{{pdfChunks}}", pdfChunks.join("\n"))
  .replace("{{video}}", videos);

  const completion = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [
      { role: "system", content: system },
      { role: "user", content: finalPrompt }
    ]
  });

return {
  result: completion.choices[0].message.content || "No se pudo generar una respuesta.",
  videos: consultas.filter(c => c.video).map(c => c.video)
};

};
