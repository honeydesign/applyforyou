import { Response } from 'express';
import prisma from '../utils/prisma';
import { AuthRequest } from '../middleware/auth.middleware';

export const getProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: { id: true, email: true, firstName: true, lastName: true, phone: true, location: true, summary: true, avatarUrl: true }
    });
    if (!user) { res.status(404).json({ error: 'User not found' }); return; }
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Failed to get profile', message: String(err) });
  }
};

export const updateProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { firstName, lastName, phone, location, summary } = req.body;
    const user = await prisma.user.update({
      where: { id: req.userId },
      data: { firstName, lastName, phone, location, summary },
      select: { id: true, email: true, firstName: true, lastName: true, phone: true, location: true, summary: true }
    });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update profile', message: String(err) });
  }
};
