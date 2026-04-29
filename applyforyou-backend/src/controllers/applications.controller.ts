import { Response, Request } from 'express';
import prisma from '../utils/prisma';
import { AuthRequest } from '../middleware/auth.middleware';

export const getApplications = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { status, board, page = '1', limit = '20' } = req.query;
    const where: any = { userId: req.userId };
    if (status && status !== 'All statuses') where.status = status;
    if (board  && board  !== 'All boards')   where.board  = board;
    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);
    const [applications, total] = await Promise.all([
      prisma.application.findMany({ where, skip, take: parseInt(limit as string), orderBy: { appliedAt: 'desc' } }),
      prisma.application.count({ where })
    ]);
    res.json({ applications, total, page: parseInt(page as string), limit: parseInt(limit as string) });
  } catch (err) {
    res.status(500).json({ error: 'Failed to get applications', message: String(err) });
  }
};

export const getStats = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId;
    const [total, viewed, interview, rejected] = await Promise.all([
      prisma.application.count({ where: { userId } }),
      prisma.application.count({ where: { userId, status: 'viewed' } }),
      prisma.application.count({ where: { userId, status: 'interview' } }),
      prisma.application.count({ where: { userId, status: 'rejected' } })
    ]);
    const responseRate = total > 0 ? Math.round(((viewed + interview) / total) * 100) : 0;
    res.json({ total, viewed, interview, rejected, pending: total - viewed - interview - rejected, responseRate });
  } catch (err) {
    res.status(500).json({ error: 'Failed to get stats', message: String(err) });
  }
};

export const updateStatus = async (req: AuthRequest & Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const app = await prisma.application.update({ where: { id }, data: { status } });
    res.json(app);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update application', message: String(err) });
  }
};
