import twilio, { Twilio, validateRequest } from 'twilio';
import { config } from '@/config';
import { logger } from './logger';

let client: Twilio | null = null;

function getClient(): Twilio | null {
  if (client) return client;
  if (!config.TWILIO_ACCOUNT_SID || !config.TWILIO_AUTH_TOKEN) return null;
  client = twilio(config.TWILIO_ACCOUNT_SID, config.TWILIO_AUTH_TOKEN);
  return client;
}

export interface SendSmsInput {
  to: string;
  body: string;
}

export interface SendSmsResult {
  sid: string;
  status: string;
}

export async function sendSms(input: SendSmsInput): Promise<SendSmsResult> {
  const c = getClient();
  if (!c || !config.TWILIO_FROM_NUMBER) {
    logger.warn('twilio not configured; not sending sms', { to: input.to });
    return { sid: 'mock-' + Date.now().toString(36), status: 'mock' };
  }
  const msg = await c.messages.create({
    to: input.to,
    from: config.TWILIO_FROM_NUMBER,
    body: input.body,
  });
  return { sid: msg.sid, status: msg.status };
}

export function verifyTwilioSignature(
  signature: string,
  url: string,
  params: Record<string, unknown>,
): boolean {
  if (!config.TWILIO_AUTH_TOKEN) return false;
  return validateRequest(config.TWILIO_AUTH_TOKEN, signature, url, params as Record<string, string>);
}
