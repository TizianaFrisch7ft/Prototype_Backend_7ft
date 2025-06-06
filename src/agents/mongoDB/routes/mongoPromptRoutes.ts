// src/agents/mongoDB/routes/mongoPromptRoutes.ts

import { Router, Request, Response } from 'express';
import fs from 'fs/promises';
import path from 'path';

const router = Router();

const promptPath = path.resolve(__dirname, '../../../prompts/mongoPrompt.json');


// GET /api/mongo/prompt
router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const data = await fs.readFile(promptPath, 'utf-8');
    const json = JSON.parse(data);
    res.json(json);
  } catch (err) {
    console.error('❌ Error leyendo el prompt:', err);
    res.status(500).json({ error: 'Error leyendo el prompt' });
  }
});

// PUT /api/mongo/prompt
router.put('/', async (req: Request, res: Response): Promise<void> => {
  const { system, template } = req.body;

  if (!system || !template) {
    res.status(400).json({ error: 'Faltan campos requeridos' });
    return;
  }

  try {
    const newPrompt = JSON.stringify({ system, template }, null, 2);
    await fs.writeFile(promptPath, newPrompt, 'utf-8');
    res.json({ success: true });
  } catch (err) {
    console.error('❌ Error guardando el prompt:', err);
    res.status(500).json({ error: 'Error guardando el prompt' });
  }
});

export default router;
