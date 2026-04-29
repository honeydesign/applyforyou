#!/bin/bash
echo "🚀 Setting up Apply-4You backend..."

mkdir -p src/controllers src/routes src/services src/middleware src/utils prisma

# ── utils/prisma.ts ──────────────────────────────────────────
cat > src/utils/prisma.ts << 'EOF'
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
export default prisma;
EOF

# ── middleware/auth.middleware.ts ────────────────────────────
cat > src/middleware/auth.middleware.ts << 'EOF'
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
  userId?: string;
}

export const authenticate = (req: AuthRequest, res: Response, next: NextFunction): void => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) { res.status(401).json({ error: 'No token provided' }); return; }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
    req.userId = decoded.userId;
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
};
EOF

# ── middleware/error.middleware.ts ───────────────────────────
cat > src/middleware/error.middleware.ts << 'EOF'
import { Request, Response, NextFunction } from 'express';
export const errorHandler = (err: Error, _req: Request, res: Response, _next: NextFunction): void => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong', message: err.message });
};
EOF

# ── routes/auth.routes.ts ────────────────────────────────────
cat > src/routes/auth.routes.ts << 'EOF'
import { Router } from 'express';
import { signup, login, getMe } from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth.middleware';
const router = Router();
router.post('/signup', signup);
router.post('/login',  login);
router.get('/me',      authenticate, getMe);
export default router;
EOF

# ── routes/user.routes.ts ────────────────────────────────────
cat > src/routes/user.routes.ts << 'EOF'
import { Router } from 'express';
import { getProfile, updateProfile } from '../controllers/user.controller';
import { authenticate } from '../middleware/auth.middleware';
const router = Router();
router.get('/', authenticate, getProfile);
router.put('/', authenticate, updateProfile);
export default router;
EOF

# ── routes/cv.routes.ts ──────────────────────────────────────
cat > src/routes/cv.routes.ts << 'EOF'
import { Router } from 'express';
import { uploadCV, getCV, deleteCV } from '../controllers/cv.controller';
import { authenticate } from '../middleware/auth.middleware';
const router = Router();
router.post('/',   authenticate, uploadCV);
router.get('/',    authenticate, getCV);
router.delete('/', authenticate, deleteCV);
export default router;
EOF

# ── routes/preferences.routes.ts ────────────────────────────
cat > src/routes/preferences.routes.ts << 'EOF'
import { Router } from 'express';
import { getPreferences, savePreferences } from '../controllers/preferences.controller';
import { authenticate } from '../middleware/auth.middleware';
const router = Router();
router.get('/',  authenticate, getPreferences);
router.post('/', authenticate, savePreferences);
router.put('/',  authenticate, savePreferences);
export default router;
EOF

# ── routes/applications.routes.ts ───────────────────────────
cat > src/routes/applications.routes.ts << 'EOF'
import { Router } from 'express';
import { getApplications, getStats, updateStatus } from '../controllers/applications.controller';
import { authenticate } from '../middleware/auth.middleware';
const router = Router();
router.get('/',      authenticate, getApplications);
router.get('/stats', authenticate, getStats);
router.put('/:id',   authenticate, updateStatus);
export default router;
EOF

# ── controllers/auth.controller.ts ──────────────────────────
cat > src/controllers/auth.controller.ts << 'EOF'
import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../utils/prisma';
import { AuthRequest } from '../middleware/auth.middleware';
import { sendWelcomeEmail } from '../services/email.service';

export const signup = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, firstName, lastName } = req.body;
    if (!email || !password || !firstName || !lastName) {
      res.status(400).json({ error: 'All fields are required' }); return;
    }
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) { res.status(409).json({ error: 'Email already in use' }); return; }
    const hashed = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: { email, password: hashed, firstName, lastName }
    });
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET!, {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d'
    });
    await sendWelcomeEmail(user.email, user.firstName);
    res.status(201).json({
      token,
      user: { id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName }
    });
  } catch (err) {
    res.status(500).json({ error: 'Signup failed', message: String(err) });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;
    if (!email || !password) { res.status(400).json({ error: 'Email and password required' }); return; }
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.password) { res.status(401).json({ error: 'Invalid credentials' }); return; }
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) { res.status(401).json({ error: 'Invalid credentials' }); return; }
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET!, {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d'
    });
    res.json({
      token,
      user: { id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName }
    });
  } catch (err) {
    res.status(500).json({ error: 'Login failed', message: String(err) });
  }
};

export const getMe = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: { id: true, email: true, firstName: true, lastName: true, phone: true, location: true, summary: true, avatarUrl: true, createdAt: true }
    });
    if (!user) { res.status(404).json({ error: 'User not found' }); return; }
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Failed to get user', message: String(err) });
  }
};
EOF

# ── controllers/user.controller.ts ──────────────────────────
cat > src/controllers/user.controller.ts << 'EOF'
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
EOF

# ── controllers/cv.controller.ts ─────────────────────────────
cat > src/controllers/cv.controller.ts << 'EOF'
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
EOF

# ── controllers/preferences.controller.ts ───────────────────
cat > src/controllers/preferences.controller.ts << 'EOF'
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
EOF

# ── controllers/applications.controller.ts ──────────────────
cat > src/controllers/applications.controller.ts << 'EOF'
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
EOF

# ── services/ai.service.ts ───────────────────────────────────
cat > src/services/ai.service.ts << 'EOF'
import Anthropic from '@anthropic-ai/sdk';
const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export const tailorCV = async (cvText: string, jobDescription: string, jobTitle: string): Promise<string> => {
  const message = await client.messages.create({
    model: 'claude-sonnet-4-20250514', max_tokens: 2000,
    messages: [{ role: 'user', content: `You are an expert CV writer. Rewrite the following CV to match the job description below.\n\nRULES:\n- Only use real experience from the CV\n- Mirror the exact keywords from the job description\n- Optimise for ATS\n- Keep the same structure but reword to match the job\n\nJOB TITLE: ${jobTitle}\n\nJOB DESCRIPTION:\n${jobDescription}\n\nORIGINAL CV:\n${cvText}\n\nReturn only the rewritten CV text.` }]
  });
  return (message.content[0] as { type: string; text: string }).text;
};

export const generateCoverLetter = async (cvText: string, jobDescription: string, jobTitle: string, company: string): Promise<string> => {
  const message = await client.messages.create({
    model: 'claude-sonnet-4-20250514', max_tokens: 800,
    messages: [{ role: 'user', content: `Write a professional cover letter for this job application.\n\nRULES:\n- Address it to the hiring team at ${company}\n- Mention the company name specifically\n- Tie the candidate's real experience to the job requirements\n- Keep it to 3 short paragraphs\n- Do not start with "I am writing to apply"\n\nJOB TITLE: ${jobTitle}\nCOMPANY: ${company}\n\nJOB DESCRIPTION:\n${jobDescription}\n\nCANDIDATE CV:\n${cvText}\n\nReturn only the cover letter text.` }]
  });
  return (message.content[0] as { type: string; text: string }).text;
};

export const calculateATSScore = async (cvText: string, jobDescription: string): Promise<number> => {
  const message = await client.messages.create({
    model: 'claude-sonnet-4-20250514', max_tokens: 100,
    messages: [{ role: 'user', content: `Score how well this CV matches the job description for ATS purposes. Return ONLY a number between 0 and 100. No explanation.\n\nJOB DESCRIPTION: ${jobDescription}\n\nCV: ${cvText}` }]
  });
  const score = parseInt((message.content[0] as { type: string; text: string }).text.trim());
  return isNaN(score) ? 70 : Math.min(100, Math.max(0, score));
};
EOF

# ── services/email.service.ts ────────────────────────────────
cat > src/services/email.service.ts << 'EOF'
import nodemailer from 'nodemailer';
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST, port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false, auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
});
const from = `"${process.env.FROM_NAME}" <${process.env.FROM_EMAIL}>`;

export const sendWelcomeEmail = async (email: string, firstName: string): Promise<void> => {
  await transporter.sendMail({ from, to: email, subject: 'Welcome to Apply-4You 🎉',
    html: `<div style="font-family:sans-serif;max-width:500px;margin:0 auto;"><h2 style="color:#7C3AED;">Welcome, ${firstName}!</h2><p>Upload your CV, set your preferences, and let us apply to jobs on your behalf — 24/7.</p><a href="${process.env.FRONTEND_URL}/onboarding" style="background:#7C3AED;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;display:inline-block;margin-top:16px;">Complete your setup →</a><p style="margin-top:24px;color:#6B7280;font-size:13px;">The Apply-4You team</p></div>`
  });
};

export const sendApplicationEmail = async (email: string, firstName: string, jobTitle: string, company: string): Promise<void> => {
  await transporter.sendMail({ from, to: email, subject: `✅ Applied to ${jobTitle} at ${company}`,
    html: `<div style="font-family:sans-serif;max-width:500px;margin:0 auto;"><h2 style="color:#7C3AED;">Application sent!</h2><p>Hi ${firstName}, we applied to <strong>${jobTitle}</strong> at <strong>${company}</strong> on your behalf.</p><a href="${process.env.FRONTEND_URL}/dashboard" style="background:#7C3AED;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;display:inline-block;margin-top:16px;">View dashboard →</a></div>`
  });
};

export const sendInterviewEmail = async (email: string, firstName: string, jobTitle: string, company: string): Promise<void> => {
  await transporter.sendMail({ from, to: email, subject: `🎉 Interview request — ${company}`,
    html: `<div style="font-family:sans-serif;max-width:500px;margin:0 auto;"><h2 style="color:#7C3AED;">You got an interview! 🎉</h2><p>Hi ${firstName}, <strong>${company}</strong> wants to interview you for <strong>${jobTitle}</strong>.</p><a href="${process.env.FRONTEND_URL}/applications" style="background:#7C3AED;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;display:inline-block;margin-top:16px;">View application →</a></div>`
  });
};
EOF

# ── services/scraper.service.ts ──────────────────────────────
cat > src/services/scraper.service.ts << 'EOF'
import axios from 'axios';
export interface JobListing { title: string; company: string; location: string; description: string; url: string; board: string; postedAt: Date; }

export const scrapeJobberman = async (keyword: string, location: string): Promise<JobListing[]> => {
  try {
    const response = await axios.get('https://www.jobberman.com/api/v3/jobs', {
      params: { q: keyword, l: location, page: 1, per_page: 20 },
      headers: { 'User-Agent': 'Mozilla/5.0', 'Accept': 'application/json' }, timeout: 10000
    });
    const jobs = response.data?.data || response.data?.jobs || [];
    return jobs.map((job: any) => ({ title: job.title || '', company: job.company || '', location: job.location || location, description: job.description || '', url: job.url || `https://www.jobberman.com/jobs/${job.id}`, board: 'Jobberman', postedAt: new Date(job.created_at || Date.now()) }));
  } catch { return []; }
};

export const scrapeMyJobMag = async (keyword: string, location: string): Promise<JobListing[]> => {
  try {
    const response = await axios.get('https://www.myjobmag.com/api/jobs/search', {
      params: { keyword, location, limit: 20 }, headers: { 'User-Agent': 'Mozilla/5.0' }, timeout: 10000
    });
    const jobs = response.data?.jobs || response.data?.data || [];
    return jobs.map((job: any) => ({ title: job.title || '', company: job.company || '', location: job.location || location, description: job.description || '', url: job.url || `https://www.myjobmag.com/job/${job.id}`, board: 'MyJobMag', postedAt: new Date(job.posted_date || Date.now()) }));
  } catch { return []; }
};

export const scrapeAllBoards = async (keyword: string, location: string, boards: string[]): Promise<JobListing[]> => {
  const scrapers: Record<string, () => Promise<JobListing[]>> = {
    'Jobberman': () => scrapeJobberman(keyword, location),
    'MyJobMag':  () => scrapeMyJobMag(keyword, location)
  };
  const results = await Promise.allSettled(boards.filter(b => scrapers[b]).map(b => scrapers[b]()));
  return results.filter((r): r is PromiseFulfilledResult<JobListing[]> => r.status === 'fulfilled').flatMap(r => r.value);
};
EOF

# ── services/apply.service.ts ────────────────────────────────
cat > src/services/apply.service.ts << 'EOF'
import prisma from '../utils/prisma';
import { JobListing } from './scraper.service';
import { tailorCV, generateCoverLetter, calculateATSScore } from './ai.service';
import { sendApplicationEmail } from './email.service';

const ATS_THRESHOLD = 70;

export const processAndApply = async (userId: string, job: JobListing, cvText: string, userEmail: string, firstName: string): Promise<void> => {
  try {
    const existing = await prisma.application.findFirst({ where: { userId, jobUrl: job.url } });
    if (existing) return;
    const atsScore = await calculateATSScore(cvText, job.description);
    if (atsScore < ATS_THRESHOLD) return;
    const tailoredCv   = await tailorCV(cvText, job.description, job.title);
    const coverLetter  = await generateCoverLetter(cvText, job.description, job.title, job.company);
    await prisma.application.create({ data: { userId, jobTitle: job.title, company: job.company, jobUrl: job.url, board: job.board, status: 'applied', tailoredCv, coverLetter, atsScore } });
    await sendApplicationEmail(userEmail, firstName, job.title, job.company);
    await prisma.notification.create({ data: { userId, type: 'applied', title: `Applied — ${job.title}`, message: `We applied to ${job.title} at ${job.company} on ${job.board}` } });
    console.log(`✅ Applied to ${job.title} at ${job.company}`);
  } catch (err) { console.error(`❌ Failed to apply to ${job.title}:`, err); }
};

export const runApplicationCycle = async (): Promise<void> => {
  try {
    const users = await prisma.user.findMany({ include: { preferences: true, cv: true }, where: { preferences: { isActive: true }, cv: { isNot: null } } });
    for (const user of users) {
      if (!user.preferences || !user.cv) continue;
      const { jobTitle, location, boards } = user.preferences;
      const boardList = Array.isArray(boards) ? boards as string[] : JSON.parse(boards as string);
      const { scrapeAllBoards } = await import('./scraper.service');
      const jobs = await scrapeAllBoards(jobTitle, location, boardList);
      for (const job of jobs) {
        await processAndApply(user.id, job, user.cv.rawText, user.email, user.firstName);
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
  } catch (err) { console.error('❌ Application cycle failed:', err); }
};
EOF

# ── services/cron.service.ts ─────────────────────────────────
cat > src/services/cron.service.ts << 'EOF'
import cron from 'node-cron';
import { runApplicationCycle } from './apply.service';

export const startCronJobs = (): void => {
  cron.schedule('*/15 * * * *', async () => {
    console.log('⏰ Running application cycle...');
    await runApplicationCycle();
  });
  console.log('✅ Cron jobs started');
  console.log('   → Application cycle: every 15 minutes');
};
EOF

# ── src/index.ts ─────────────────────────────────────────────
cat > src/index.ts << 'EOF'
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes         from './routes/auth.routes';
import userRoutes         from './routes/user.routes';
import cvRoutes           from './routes/cv.routes';
import preferencesRoutes  from './routes/preferences.routes';
import applicationsRoutes from './routes/applications.routes';
import { errorHandler }   from './middleware/error.middleware';
import { startCronJobs }  from './services/cron.service';

dotenv.config();
const app  = express();
const PORT = process.env.PORT || 3000;

app.use(cors({ origin: process.env.FRONTEND_URL, credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

app.use('/api/auth',         authRoutes);
app.use('/api/user',         userRoutes);
app.use('/api/cv',           cvRoutes);
app.use('/api/preferences',  preferencesRoutes);
app.use('/api/applications', applicationsRoutes);

app.get('/health', (_, res) => res.json({ status: 'ok', app: 'Apply-4You API', timestamp: new Date() }));
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`🚀 Apply-4You API running on port ${PORT}`);
  if (process.env.NODE_ENV !== 'test') startCronJobs();
});

export default app;
EOF

echo "✅ All files created successfully!"
echo "Now run: npm run dev"