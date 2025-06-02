import fs from "fs";

export const extractTextFromPDF = async (filePath: string): Promise<string> => {
  const buffer = fs.readFileSync(filePath);

  const pdfParse = (await import("pdf-parse")).default;
  const data = await pdfParse(buffer);

  return data.text;
};
