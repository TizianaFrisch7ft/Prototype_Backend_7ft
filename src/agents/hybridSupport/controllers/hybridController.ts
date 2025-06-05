import { Request, Response } from 'express';
import { getConsultaInfo, saveConsulta } from '../services/dbService';
import { getRelevantPdfChunks, uploadPdfAndVectorize } from '../services/pdfService';
import { getVideoLink, saveVideoLink } from '../services/videoService';
import { generateLLMResponse } from '../services/llmService';
import { RequestHandler } from 'express';

export const handleAsk = async (req: Request, res: Response) => {
  try {
    const { query, dbCreds } = req.body;
    const consulta = await getConsultaInfo(query, dbCreds);
    const pdfChunks = await getRelevantPdfChunks(query);
    const videoLink = await getVideoLink(consulta._id, dbCreds);

    const response = await generateLLMResponse({
      query,
      consulta,
      pdfChunks,
      videoLink
    });

    res.json({ success: true, result: response });
  } catch (error) {
    console.error('Error in handleAsk:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const handleAddConsulta = async (req: Request, res: Response) => {
  try {
    const { dbCreds, data } = req.body;
    await saveConsulta(data, dbCreds);
    res.json({ success: true, message: 'Consulta saved.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error saving consulta' });
  }
};

export const handleAddPdf: RequestHandler = async (req, res) => {
  try {
    const files = req.files as Express.Multer.File[];

    if (!files || files.length === 0) {
      res.status(400).json({ success: false, message: 'No PDF files uploaded' });
      return;
    }

    for (const file of files) {
      await uploadPdfAndVectorize(file);
    }

    res.json({ success: true, message: 'PDFs uploaded and vectorized.' });
  } catch (err) {
    console.error('❌ Error uploading PDFs:', err);
    res.status(500).json({ success: false, message: 'Error uploading PDF' });
  }
};




export const handleAddVideo = async (req: Request, res: Response) => {
  try {
    const { consultaId, videoUrl, dbCreds } = req.body;
    await saveVideoLink(consultaId, videoUrl, dbCreds);
    res.json({ success: true, message: 'Video link saved.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error saving video link' });
  }
};
