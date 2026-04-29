import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);
const from = `${process.env.FROM_NAME} <${process.env.FROM_EMAIL}>`;

export const sendWelcomeEmail = async (email: string, firstName: string): Promise<void> => {
  await resend.emails.send({
    from,
    to: email,
    subject: 'Welcome to Apply-4You 🎉',
    html: `<div style="font-family:sans-serif;max-width:500px;margin:0 auto;">
      <h2 style="color:#7C3AED;">Welcome, ${firstName}!</h2>
      <p>Upload your CV, set your preferences, and let us apply to jobs on your behalf — 24/7.</p>
      <a href="${process.env.FRONTEND_URL}/onboarding" style="background:#7C3AED;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;display:inline-block;margin-top:16px;">Complete your setup →</a>
      <p style="margin-top:24px;color:#6B7280;font-size:13px;">The Apply-4You team</p>
    </div>`
  });
};

export const sendApplicationEmail = async (email: string, firstName: string, jobTitle: string, company: string): Promise<void> => {
  await resend.emails.send({
    from,
    to: email,
    subject: `✅ Applied to ${jobTitle} at ${company}`,
    html: `<div style="font-family:sans-serif;max-width:500px;margin:0 auto;">
      <h2 style="color:#7C3AED;">Application sent!</h2>
      <p>Hi ${firstName}, we applied to <strong>${jobTitle}</strong> at <strong>${company}</strong> on your behalf.</p>
      <a href="${process.env.FRONTEND_URL}/dashboard" style="background:#7C3AED;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;display:inline-block;margin-top:16px;">View dashboard →</a>
    </div>`
  });
};

export const sendInterviewEmail = async (email: string, firstName: string, jobTitle: string, company: string): Promise<void> => {
  await resend.emails.send({
    from,
    to: email,
    subject: `🎉 Interview request — ${company}`,
    html: `<div style="font-family:sans-serif;max-width:500px;margin:0 auto;">
      <h2 style="color:#7C3AED;">You got an interview! 🎉</h2>
      <p>Hi ${firstName}, <strong>${company}</strong> wants to interview you for <strong>${jobTitle}</strong>.</p>
      <a href="${process.env.FRONTEND_URL}/applications" style="background:#7C3AED;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;display:inline-block;margin-top:16px;">View application →</a>
    </div>`
  });
};