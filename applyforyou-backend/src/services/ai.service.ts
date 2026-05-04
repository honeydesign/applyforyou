import Anthropic from '@anthropic-ai/sdk';
const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const MODEL = 'claude-haiku-4-5-20251001';

export const tailorCV = async (
  cvText:         string,
  jobDescription: string,
  jobTitle:       string
): Promise<string> => {
  const message = await client.messages.create({
    model:      MODEL,
    max_tokens: 2000,
    messages: [{
      role:    'user',
      content: `You are an expert ATS-optimised CV writer. Your goal is to rewrite this CV to score 80%+ on ATS systems for this specific job.

STRICT RULES:
- Only use REAL experience from the CV — never fabricate anything
- Mirror the EXACT keywords, skills and phrases from the job description
- Reorder bullet points to put most relevant experience first
- Use the same terminology as the job posting (e.g. if they say "Node.js" don't write "NodeJS")
- Quantify achievements where possible
- Keep the same overall structure but optimise every line

JOB TITLE: ${jobTitle}

JOB DESCRIPTION:
${jobDescription}

ORIGINAL CV:
${cvText}

Return ONLY the rewritten CV text. No commentary, no explanations.`
    }]
  });
  return (message.content[0] as { type: string; text: string }).text;
};

export const generateCoverLetter = async (
  cvText:         string,
  jobDescription: string,
  jobTitle:       string,
  company:        string
): Promise<string> => {
  const message = await client.messages.create({
    model:      MODEL,
    max_tokens: 800,
    messages: [{
      role:    'user',
      content: `Write a compelling, personalised cover letter for this job application.

RULES:
- Address it to the hiring team at ${company}
- Mention ${company} by name in the first paragraph
- Connect the candidate's REAL experience directly to the job requirements
- Show genuine interest in ${company} specifically
- Keep it to 3 focused paragraphs
- Professional but warm tone
- Do NOT start with "I am writing to apply"
- Do NOT fabricate any experience

JOB TITLE: ${jobTitle}
COMPANY: ${company}

JOB DESCRIPTION:
${jobDescription}

CANDIDATE CV:
${cvText}

Return ONLY the cover letter text.`
    }]
  });
  return (message.content[0] as { type: string; text: string }).text;
};

export const calculateATSScore = async (
  cvText:         string,
  jobDescription: string
): Promise<number> => {
  const message = await client.messages.create({
    model:      MODEL,
    max_tokens: 50,
    messages: [{
      role:    'user',
      content: `You are an ATS (Applicant Tracking System). Score how well this CV matches this job description.

Consider:
- Keyword matches (most important)
- Skills alignment
- Experience level match
- Education requirements

Return ONLY a number between 0 and 100. Nothing else.

JOB DESCRIPTION:
${jobDescription}

CV:
${cvText}`
    }]
  });

  const text  = (message.content[0] as { type: string; text: string }).text.trim();
  const score = parseInt(text.replace(/[^0-9]/g, ''));
  return isNaN(score) ? 70 : Math.min(100, Math.max(0, score));
};