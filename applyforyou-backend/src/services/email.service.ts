import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);
const from   = `${process.env.FROM_NAME} <${process.env.FROM_EMAIL}>`;

export const sendWelcomeEmail = async (email: string, firstName: string): Promise<void> => {
  await resend.emails.send({
    from,
    to:      email,
    subject: 'Welcome to Apply-4You 🎉',
    html: `
      <div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:2rem;">
        <h2 style="color:#7C3AED;font-family:sans-serif;">Welcome, ${firstName}! 🎉</h2>
        <p style="color:#374151;">You're all set! Our AI is now scanning job boards and will start applying to jobs that match your preferences within the next 2 hours.</p>
        <p style="color:#374151;">Every time we find a great match, we'll:</p>
        <ul style="color:#374151;">
          <li>Tailor your CV to score 80%+ on ATS systems</li>
          <li>Write a personalised cover letter</li>
          <li>Send everything to your inbox so you can apply directly</li>
        </ul>
        <a href="${process.env.FRONTEND_URL}/dashboard" style="display:inline-block;background:#7C3AED;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;margin-top:1rem;font-weight:600;">Go to dashboard →</a>
        <p style="margin-top:2rem;color:#9CA3AF;font-size:13px;">The Apply-4You team</p>
      </div>`
  });
};

export const sendApplicationEmail = async (
  email: string, firstName: string, jobTitle: string, company: string
): Promise<void> => {
  await resend.emails.send({
    from,
    to:      email,
    subject: `✅ New job match — ${jobTitle} at ${company}`,
    html: `
      <div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:2rem;">
        <h2 style="color:#7C3AED;">New job match found! 🎯</h2>
        <p style="color:#374151;">Hi ${firstName}, we found a great match for you:</p>
        <div style="background:#F5F3FF;border-radius:12px;padding:1.25rem;margin:1rem 0;">
          <strong style="color:#111;font-size:16px;">${jobTitle}</strong><br/>
          <span style="color:#6B7280;">${company}</span>
        </div>
        <p style="color:#374151;">We've tailored your CV and written a cover letter. Check your inbox for another email with all the details to apply directly!</p>
        <a href="${process.env.FRONTEND_URL}/activity" style="display:inline-block;background:#7C3AED;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;margin-top:1rem;font-weight:600;">View activity →</a>
      </div>`
  });
};

export const sendCoverLetterEmail = async (
  email:       string,
  firstName:   string,
  jobTitle:    string,
  company:     string,
  jobUrl:      string,
  coverLetter: string,
  tailoredCv:  string
): Promise<void> => {
  await resend.emails.send({
    from,
    to:      email,
    subject: `📄 Your tailored CV for ${jobTitle} at ${company}`,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:2rem;">
        <h2 style="color:#7C3AED;">Your application is ready! 🚀</h2>
        <p style="color:#374151;">Hi ${firstName}, we've tailored your CV and written a personalised cover letter for this role. Click the button below to apply directly — it only takes 2 minutes!</p>

        <div style="background:#F5F3FF;border-radius:12px;padding:1.25rem;margin:1rem 0;">
          <strong style="color:#111;font-size:16px;">${jobTitle}</strong><br/>
          <span style="color:#6B7280;">${company}</span>
        </div>

        <a href="${jobUrl}" style="display:inline-block;background:#7C3AED;color:#fff;padding:14px 28px;border-radius:8px;text-decoration:none;margin:1rem 0;font-weight:700;font-size:15px;">Apply now →</a>

        <hr style="border:none;border-top:1px solid #E5E7EB;margin:1.5rem 0;"/>

        <h3 style="color:#111;font-size:14px;margin-bottom:0.5rem;">📄 Your tailored cover letter</h3>
        <div style="background:#fff;border:1px solid #E5E7EB;border-radius:8px;padding:1rem;font-size:13px;color:#374151;line-height:1.7;white-space:pre-wrap;">${coverLetter}</div>

        <hr style="border:none;border-top:1px solid #E5E7EB;margin:1.5rem 0;"/>

        <h3 style="color:#111;font-size:14px;margin-bottom:0.5rem;">📋 Your tailored CV</h3>
        <div style="background:#fff;border:1px solid #E5E7EB;border-radius:8px;padding:1rem;font-size:13px;color:#374151;line-height:1.7;white-space:pre-wrap;">${tailoredCv}</div>

        <p style="margin-top:1.5rem;color:#9CA3AF;font-size:12px;">Copy your cover letter and CV above when applying. Good luck! 🍀</p>
        <p style="color:#9CA3AF;font-size:12px;">— The Apply-4You team</p>
      </div>`
  });
};

export const sendInterviewEmail = async (
  email: string, firstName: string, jobTitle: string, company: string
): Promise<void> => {
  await resend.emails.send({
    from,
    to:      email,
    subject: `🎉 Interview request — ${company}`,
    html: `
      <div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:2rem;">
        <h2 style="color:#7C3AED;">You got an interview! 🎉</h2>
        <p style="color:#374151;">Hi ${firstName}, <strong>${company}</strong> wants to interview you for <strong>${jobTitle}</strong>.</p>
        <a href="${process.env.FRONTEND_URL}/applications" style="display:inline-block;background:#7C3AED;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;margin-top:1rem;font-weight:600;">View application →</a>
      </div>`
  });
};