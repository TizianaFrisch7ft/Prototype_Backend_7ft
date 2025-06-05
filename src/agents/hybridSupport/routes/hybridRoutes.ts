import { Router } from 'express';
import multer from 'multer';
import { handleAsk, handleAddConsulta, handleAddPdf, handleAddVideo } from '../controllers/hybridController';

const router = Router();
const upload = multer({ dest: 'uploads/pdfs' }); // asegúrate que esta carpeta exista

// Rutas
router.post('/ask', handleAsk);
router.post('/add-db', handleAddConsulta);

// ✅ CORRECTO: subir múltiples archivos como 'pdfs'
router.post('/add-docs', upload.array('pdfs'), handleAddPdf); 

router.post('/add-video', handleAddVideo);

export default router;
