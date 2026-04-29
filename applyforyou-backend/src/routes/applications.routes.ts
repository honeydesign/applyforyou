import { Router } from 'express';
import { getApplications, getStats, updateStatus } from '../controllers/applications.controller';
import { authenticate } from '../middleware/auth.middleware';
const router = Router();
router.get('/',      authenticate, getApplications);
router.get('/stats', authenticate, getStats);
router.put('/:id',   authenticate, updateStatus);
export default router;
