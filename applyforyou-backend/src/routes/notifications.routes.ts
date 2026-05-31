import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import prisma from '../utils/prisma';
import { AuthRequest } from '../middleware/auth.middleware';
import { Response } from 'express';

const router = Router();

router.get('/', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const notifications = await prisma.notification.findMany({
      where:   { userId: req.userId },
      orderBy: { createdAt: 'desc' },
      take:    50
    });
    res.json(notifications);
  } catch (err) {
    res.status(500).json({ error: 'Failed to get notifications', message: String(err) });
  }
});

router.put('/:id/read', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    await prisma.notification.update({
      where: { id: req.params.id },
      data:  { read: true }
    });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to mark as read', message: String(err) });
  }
});

router.put('/read-all', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    await prisma.notification.updateMany({
      where: { userId: req.userId, read: false },
      data:  { read: true }
    });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to mark all as read', message: String(err) });
  }
});

export default router;