import { Response } from 'express';
import prisma from '../utils/prisma';
import { AuthRequest } from '../middleware/auth.middleware';

export const uploadCV = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { rawText, fileName } = req.body;
    if (!rawText) { res.status(400).json({ error: 'CV text is required' }); return; }
    const cv = await prisma.cV.upsert({
      where:  { userId: req.userId! },
      update: { rawText, fileName },
      create: { userId: req.userId!, rawText, fileName }
    });
    res.json(cv);
  } catch (err) {
    res.status(500).json({ error: 'Failed to upload CV', message: String(err) });
  }
};

export const getCV = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const cv = await prisma.cV.findUnique({ where: { userId: req.userId } });
    if (!cv) { res.status(404).json({ error: 'No CV found' }); return; }
    res.json(cv);
  } catch (err) {
    res.status(500).json({ error: 'Failed to get CV', message: String(err) });
  }
};

export const deleteCV = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    await prisma.cV.delete({ where: { userId: req.userId } });
    res.json({ message: 'CV deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete CV', message: String(err) });
  }
};
