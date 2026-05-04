import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { tailorCV, generateCoverLetter, calculateATSScore } from '../services/ai.service';
import { runApplicationCycle } from '../services/apply.service';
import prisma from '../utils/prisma';
import { AuthRequest } from '../middleware/auth.middleware';
import { Response } from 'express';

const router = Router();

router.post('/tailor', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { jobTitle, jobDescription, company } = req.body;

    const cv = await prisma.cV.findUnique({ where: { userId: req.userId } });
    if (!cv) { res.status(404).json({ error: 'No CV found. Please upload your CV first.' }); return; }

    console.log('🤖 Calculating ATS score...');
    const atsScore = await calculateATSScore(cv.rawText, jobDescription);

    console.log('🤖 Tailoring CV...');
    const tailoredCv = await tailorCV(cv.rawText, jobDescription, jobTitle);

    console.log('🤖 Generating cover letter...');
    const coverLetter = await generateCoverLetter(cv.rawText, jobDescription, jobTitle, company);

    res.json({ atsScore, tailoredCv, coverLetter });
  } catch (err) {
    res.status(500).json({ error: 'AI tailoring failed', message: String(err) });
  }
});

router.post('/trigger-cycle', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    res.json({ message: 'Application cycle started — check server logs' });
    runApplicationCycle().catch(console.error);
  } catch (err) {
    res.status(500).json({ error: 'Failed to trigger cycle', message: String(err) });
  }
});

export default router;