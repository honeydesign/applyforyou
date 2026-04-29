import { Router } from 'express';
import { getPreferences, savePreferences } from '../controllers/preferences.controller';
import { authenticate } from '../middleware/auth.middleware';
const router = Router();
router.get('/',  authenticate, getPreferences);
router.post('/', authenticate, savePreferences);
router.put('/',  authenticate, savePreferences);
export default router;
