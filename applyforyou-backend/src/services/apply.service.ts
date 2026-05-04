import prisma from '../utils/prisma';
import { JobListing } from './scraper.service';
import { tailorCV, generateCoverLetter, calculateATSScore } from './ai.service';
import { sendApplicationEmail } from './email.service';

const ATS_MINIMUM   = 80;  // Must hit this after tailoring
const MAX_ATTEMPTS  = 2;   // Max times to retry tailoring to hit 80%

// ── Tailor CV until ATS score hits minimum ────────────────────
const tailorUntilScore = async (
  cvText:         string,
  jobDescription: string,
  jobTitle:       string,
  targetScore:    number
): Promise<{ tailoredCv: string; atsScore: number }> => {

  let tailoredCv = cvText;
  let atsScore   = 0;

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    console.log(`   ✍️  Tailoring attempt ${attempt}/${MAX_ATTEMPTS}...`);

    // Tailor the CV
    tailoredCv = await tailorCV(tailoredCv, jobDescription, jobTitle);

    // Recalculate ATS score on tailored CV
    atsScore = await calculateATSScore(tailoredCv, jobDescription);
    console.log(`   📊 ATS score after attempt ${attempt}: ${atsScore}%`);

    if (atsScore >= targetScore) {
      console.log(`   ✅ Hit target score of ${targetScore}% on attempt ${attempt}`);
      break;
    }

    if (attempt < MAX_ATTEMPTS) {
      console.log(`   🔄 Score below ${targetScore}% — retrying with stronger tailoring...`);
    }
  }

  return { tailoredCv, atsScore };
};

// ── Process and apply to a single job ─────────────────────────
export const processAndApply = async (
  userId:    string,
  job:       JobListing,
  cvText:    string,
  userEmail: string,
  firstName: string,
  lastName:  string
): Promise<void> => {
  try {
    console.log(`\n⚡ Processing: ${job.title} at ${job.company} (${job.board})`);

    // 1. Skip if already applied
    const existing = await prisma.application.findFirst({
      where: { userId, jobUrl: job.url }
    });
    if (existing) {
      console.log(`⏭  Already applied to ${job.title} at ${job.company}`);
      return;
    }

    // 2. Skip if job description is too short
    if (job.description.length < 50) {
      console.log(`⏭  Job description too short — skipping`);
      return;
    }

    // 3. Check original ATS score first
    console.log(`📊 Checking original CV ATS score...`);
    const originalScore = await calculateATSScore(cvText, job.description);
    console.log(`📊 Original ATS score: ${originalScore}%`);

    // 4. Tailor CV until it hits 80%+
    const { tailoredCv, atsScore } = await tailorUntilScore(
      cvText,
      job.description,
      job.title,
      ATS_MINIMUM
    );

    // 5. Skip if even after tailoring we can't hit 80%
    if (atsScore < ATS_MINIMUM) {
      console.log(`❌ Could not reach ${ATS_MINIMUM}% ATS score (best: ${atsScore}%) — skipping ${job.title}`);
      return;
    }

    console.log(`✅ ATS score: ${originalScore}% → ${atsScore}% after tailoring`);

    // 6. Generate cover letter
    console.log(`✍️  Generating cover letter...`);
    const coverLetter = await generateCoverLetter(cvText, job.description, job.title, job.company);

    // 7. Save application to database
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

    // 8. Save notification
    await prisma.notification.create({
      data: {
        userId,
        type:    'applied',
        title:   `Applied — ${job.title}`,
        message: `Applied to ${job.title} at ${job.company} on ${job.board}. ATS score: ${atsScore}% (was ${originalScore}%)`
      }
    });

    // 9. Send email notification
    try {
      await sendApplicationEmail(userEmail, firstName, job.title, job.company);
    } catch (emailErr) {
      console.error('Email notification failed:', emailErr);
    }

    console.log(`✅ Applied to ${job.title} at ${job.company} — ATS: ${originalScore}% → ${atsScore}%`);

  } catch (err) {
    console.error(`❌ Failed to process ${job.title}:`, err);
  }
};

// ── Run full application cycle for all users ──────────────────
export const runApplicationCycle = async (): Promise<void> => {
  console.log('\n🔄 ═══════════════════════════════════════');
  console.log('🔄 Starting application cycle...');
  console.log('🔄 ═══════════════════════════════════════');

  try {
    const users = await prisma.user.findMany({
      include: { preferences: true, cv: true },
      where: {
        preferences: { isActive: true },
        cv:          { isNot: null }
      }
    });

    console.log(`👥 Found ${users.length} active users`);

    for (const user of users) {
      if (!user.preferences || !user.cv) continue;

      console.log(`\n👤 Processing: ${user.firstName} ${user.lastName}`);

      const { jobTitle, location, boards } = user.preferences;
      const boardList = Array.isArray(boards)
        ? boards as string[]
        : JSON.parse(boards as string);

      console.log(`   Looking for: ${jobTitle} in ${location}`);
      console.log(`   Boards: ${boardList.join(', ')}`);

      const { scrapeAllBoards } = await import('./scraper.service');
      const jobs = await scrapeAllBoards(jobTitle, location, boardList);

      if (jobs.length === 0) {
        console.log(`   No new jobs found`);
        continue;
      }

      console.log(`   Found ${jobs.length} potential jobs`);

      for (const job of jobs) {
        await processAndApply(
          user.id,
          job,
          user.cv.rawText,
          user.email,
          user.firstName,
          user.lastName
        );
        // 3 second delay between applications
        await new Promise(resolve => setTimeout(resolve, 3000));
      }

      console.log(`\n✅ Done processing jobs for ${user.firstName}`);
    }

    console.log('\n✅ Application cycle complete');
  } catch (err) {
    console.error('❌ Application cycle failed:', err);
  }
};