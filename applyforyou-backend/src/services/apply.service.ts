import prisma from '../utils/prisma';
import { JobListing } from './scraper.service';
import { tailorCV, generateCoverLetter, calculateATSScore } from './ai.service';
import { sendApplicationEmail, sendCoverLetterEmail } from './email.service';
import axios from 'axios';

const ATS_MINIMUM        = 80;
const MAX_ATTEMPTS       = 2;
const MAX_JOBS_PER_CYCLE = 5;

const tailorUntilScore = async (
  cvText: string, jobDescription: string, jobTitle: string, targetScore: number
): Promise<{ tailoredCv: string; atsScore: number }> => {
  let tailoredCv = cvText;
  let atsScore   = 0;

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    console.log(`   ✍️  Tailoring attempt ${attempt}/${MAX_ATTEMPTS}...`);
    tailoredCv = await tailorCV(tailoredCv, jobDescription, jobTitle);
    atsScore   = await calculateATSScore(tailoredCv, jobDescription);
    console.log(`   📊 ATS score after attempt ${attempt}: ${atsScore}%`);
    if (atsScore >= targetScore) { console.log(`   ✅ Hit target score on attempt ${attempt}`); break; }
    if (attempt < MAX_ATTEMPTS) console.log(`   🔄 Retrying...`);
  }

  return { tailoredCv, atsScore };
};

// ── Submit application via email ───────────────────────────────
const submitViaEmail = async (
  job:          JobListing,
  tailoredCv:   string,
  coverLetter:  string,
  userEmail:    string,
  firstName:    string,
  lastName:     string
): Promise<boolean> => {
  try {
    // Send cover letter + tailored CV to user so they can apply directly
    await sendCoverLetterEmail(
      userEmail, firstName, job.title, job.company, job.url, coverLetter, tailoredCv
    );
    console.log(`   📧 Sent tailored CV and cover letter to ${userEmail}`);
    return true;
  } catch (err) {
    console.error(`   ❌ Failed to send email:`, err);
    return false;
  }
};

export const processAndApply = async (
  userId: string, job: JobListing, cvText: string,
  userEmail: string, firstName: string, lastName: string
): Promise<void> => {
  try {
    console.log(`\n⚡ Processing: ${job.title} at ${job.company} (${job.board})`);

    const existing = await prisma.application.findFirst({ where: { userId, jobUrl: job.url } });
    if (existing) { console.log(`⏭  Already applied`); return; }
    if (job.description.length < 50) { console.log(`⏭  Description too short`); return; }

    console.log(`📊 Checking original ATS score...`);
    const originalScore = await calculateATSScore(cvText, job.description);
    console.log(`📊 Original ATS score: ${originalScore}%`);

    const { tailoredCv, atsScore } = await tailorUntilScore(cvText, job.description, job.title, ATS_MINIMUM);

    if (atsScore < ATS_MINIMUM) {
      console.log(`❌ Could not reach ${ATS_MINIMUM}% (best: ${atsScore}%) — skipping`);
      return;
    }

    console.log(`✅ ATS: ${originalScore}% → ${atsScore}%`);
    console.log(`✍️  Generating cover letter...`);
    const coverLetter = await generateCoverLetter(cvText, job.description, job.title, job.company);

    // Submit via email to user
    await submitViaEmail(job, tailoredCv, coverLetter, userEmail, firstName, lastName);

    // Save to database
    await prisma.application.create({
      data: {
        userId,
        jobTitle:    job.title,
        company:     job.company,
        jobUrl:      job.url,
        board:       job.board,
        status:      'applied',
        tailoredCv,
        coverLetter,
        atsScore
      }
    });

    // Save notification
    await prisma.notification.create({
      data: {
        userId,
        type:    'applied',
        title:   `Applied — ${job.title}`,
        message: `We found ${job.title} at ${job.company} on ${job.board}. Your tailored CV (ATS: ${atsScore}%) and cover letter have been sent to your email. Apply directly using the link provided.`
      }
    });

    // Send simple notification email
    try {
      await sendApplicationEmail(userEmail, firstName, job.title, job.company);
    } catch (err) { console.error('Notification email failed:', err); }

    console.log(`✅ Applied to ${job.title} at ${job.company} — ATS: ${originalScore}% → ${atsScore}%`);

  } catch (err) {
    console.error(`❌ Failed to process ${job.title}:`, err);
  }
};

export const runApplicationCycle = async (): Promise<void> => {
  console.log('\n🔄 Starting application cycle...');

  try {
    const users = await prisma.user.findMany({
      include: { preferences: true, cv: true },
      where:   { preferences: { isActive: true }, cv: { isNot: null } }
    });

    console.log(`👥 Found ${users.length} active users`);

    for (const user of users) {
      if (!user.preferences || !user.cv) continue;
      console.log(`\n👤 Processing: ${user.firstName} ${user.lastName}`);

      const { jobTitle, location, boards } = user.preferences;
      const boardList = Array.isArray(boards) ? boards as string[] : JSON.parse(boards as string);

      const { scrapeAllBoards } = await import('./scraper.service');
      const jobs = await scrapeAllBoards(jobTitle, location, boardList);

      if (jobs.length === 0) { console.log(`   No new jobs found`); continue; }

      const topJobs = jobs.slice(0, MAX_JOBS_PER_CYCLE);
      console.log(`   Found ${jobs.length} jobs — processing top ${topJobs.length}`);

      for (const job of topJobs) {
        await processAndApply(user.id, job, user.cv.rawText, user.email, user.firstName, user.lastName);
        await new Promise(resolve => setTimeout(resolve, 3000));
      }

      console.log(`✅ Done for ${user.firstName}`);
    }

    console.log('\n✅ Application cycle complete');
  } catch (err) {
    console.error('❌ Cycle failed:', err);
  }
};