import { Router } from 'express';
import { uploadCV, getCV, deleteCV } from '../controllers/cv.controller';
import { authenticate } from '../middleware/auth.middleware';
const router = Router();
router.post('/',   authenticate, uploadCV);
router.get('/',    authenticate, getCV);
router.delete('/', authenticate, deleteCV);
export default router;
