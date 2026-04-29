import { Response } from 'express';
import prisma from '../utils/prisma';
import { AuthRequest } from '../middleware/auth.middleware';

export const getPreferences = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const prefs = await prisma.jobPreferences.findUnique({ where: { userId: req.userId } });
    if (!prefs) { res.status(404).json({ error: 'No preferences found' }); return; }
    res.json(prefs);
  } catch (err) {
    res.status(500).json({ error: 'Failed to get preferences', message: String(err) });
  }
};

export const savePreferences = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { jobTitle, location, country, workType, experience, currency, minSalary, boards } = req.body;
    const prefs = await prisma.jobPreferences.upsert({
      where:  { userId: req.userId! },
      update: { jobTitle, location, country, workType, experience, currency, minSalary, boards },
      create: { userId: req.userId!, jobTitle, location, country, workType, experience, currency, minSalary, boards }
    });
    res.json(prefs);
  } catch (err) {
    res.status(500).json({ error: 'Failed to save preferences', message: String(err) });
  }
};
