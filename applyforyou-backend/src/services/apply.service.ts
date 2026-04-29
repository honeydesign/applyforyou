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
