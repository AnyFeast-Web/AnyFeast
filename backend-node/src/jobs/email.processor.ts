import fs from 'fs';
import path from 'path';
import Handlebars from 'handlebars';
import { renderEmail, sendEmail } from '@/lib/mailer';
import { logger } from '@/lib/logger';
import { startWorker } from '@/lib/queue';

Handlebars.registerHelper('add', (a: number, b: number) => a + b);

const TEMPLATES_DIR = path.resolve(__dirname, '..', 'templates', 'email');
const templateCache = new Map<string, string>();

function loadTemplate(name: string): string {
  const cached = templateCache.get(name);
  if (cached) return cached;
  const p = path.join(TEMPLATES_DIR, name);
  const src = fs.readFileSync(p, 'utf8');
  templateCache.set(name, src);
  return src;
}

export interface SendMealPlanEmailJob {
  mealPlanId: string;
  to: string;
  data: {
    title: string;
    clientName: string;
    nutritionistName: string;
    startDate: string;
    endDate: string;
    guidelines?: string;
    days: Array<{
      dayIndex: number;
      date?: string | null;
      meals: Array<{ mealType: string; title: string }>;
    }>;
    subject: string;
  };
}

export function startEmailWorker() {
  return startWorker<SendMealPlanEmailJob>('email', async (jobName, data) => {
    if (jobName === 'send-meal-plan') {
      const tpl = loadTemplate('meal-plan.mjml.hbs');
      const rendered = await renderEmail({ template: tpl, data: data.data });
      await sendEmail({
        to: data.to,
        subject: rendered.subject,
        html: rendered.html,
        text: rendered.text,
      });
      logger.info('meal plan email sent', { mealPlanId: data.mealPlanId, to: data.to });
      return;
    }
    logger.warn('unknown email job', { jobName });
  });
}
