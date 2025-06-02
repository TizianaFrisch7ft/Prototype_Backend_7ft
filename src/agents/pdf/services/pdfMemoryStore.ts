const pdfStore: Record<string, string> = {};

export const savePdfText = (docId: string, text: string) => {
  pdfStore[docId] = text;
};

export const getPdfText = (docId: string): string | null => {
  return pdfStore[docId] || null;
};
