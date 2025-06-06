import { Router, Request, Response } from 'express';
import fs from 'fs/promises';
import path from 'path';

const router = Router();
const promptsDir = path.resolve(__dirname, '../prompts');


// GET /api/prompts → lista archivos JSON
router.get('/', async (_req: Request, res: Response): Promise<void> => {
  try {
    const files = await fs.readdir(promptsDir);
    const jsonFiles = files.filter(file => file.endsWith('.json'));
    res.json(jsonFiles);
  } catch (err) {
    console.error('❌ Error listando prompts:', err);
    res.status(500).json({ error: 'Error listando archivos de prompt' });
  }
});

// GET /api/prompts/:filename → obtiene un archivo JSON
router.get('/:filename', async (req: Request, res: Response): Promise<void> => {
  const { filename } = req.params;
  const filePath = path.join(promptsDir, filename);

  try {
    const content = await fs.readFile(filePath, 'utf-8');
    res.json(JSON.parse(content));
  } catch (err) {
    console.error(`❌ Error leyendo ${filename}:`, err);
    res.status(500).json({ error: 'No se pudo leer el archivo' });
  }
});

// PUT /api/prompts/:filename → guarda cambios
router.put('/:filename', async (req: Request, res: Response): Promise<void> => {
  const { filename } = req.params;
  const { system, template } = req.body;

  if (!system || !template) {
    res.status(400).json({ error: 'Faltan campos requeridos (system, template)' });
    return;
  }

  const filePath = path.join(promptsDir, filename);

  try {
    await fs.writeFile(filePath, JSON.stringify({ system, template }, null, 2), 'utf-8');
    res.json({ success: true });
  } catch (err) {
    console.error(`❌ Error guardando ${filename}:`, err);
    res.status(500).json({ error: 'No se pudo guardar el archivo' });
  }
});

export default router;
