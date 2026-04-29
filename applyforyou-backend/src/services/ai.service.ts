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
