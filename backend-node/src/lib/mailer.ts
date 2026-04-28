import sgMail from '@sendgrid/mail';
import mjml2html from 'mjml';
import Handlebars from 'handlebars';
import { config } from '@/config';
import { logger } from './logger';

if (config.SENDGRID_API_KEY) sgMail.setApiKey(config.SENDGRID_API_KEY);

export interface RenderInput {
  template: string;
  data: Record<string, unknown>;
}

export async function renderEmail(
  input: RenderInput,
): Promise<{ subject: string; html: string; text: string }> {
  const tpl = Handlebars.compile(input.template);
  const mjml = tpl(input.data);
  const subject = (input.data.subject as string) ?? 'AnyFeast notification';
  const out = await mjml2html(mjml, { validationLevel: 'soft' });
  if (out.errors.length) {
    logger.warn('mjml warnings', { count: out.errors.length });
  }
  const text = stripHtml(out.html);
  return { subject, html: out.html, text };
}

function stripHtml(html: string): string {
  return html
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export interface SendEmailInput {
  to: string;
  subject: string;
  html: string;
  text: string;
}

export async function sendEmail(input: SendEmailInput): Promise<void> {
  if (!config.SENDGRID_API_KEY) {
    logger.warn('sendgrid not configured; skipping email', { to: input.to });
    return;
  }
  await sgMail.send({
    to: input.to,
    from: { email: config.EMAIL_FROM_ADDRESS, name: config.EMAIL_FROM_NAME },
    subject: input.subject,
    html: input.html,
    text: input.text,
  });
}
