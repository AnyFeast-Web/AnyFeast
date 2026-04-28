import express, { NextFunction, Request, Response, Router } from 'express';
import crypto from 'crypto';
import { config } from '@/config';
import { logger } from '@/lib/logger';
import { verifyTwilioSignature } from '@/lib/sms';
import { messagesService } from '@/modules/messages/messages.service';
import { unauthorized } from '@/middleware/errors';

const asyncH =
  <T extends (req: Request, res: Response) => Promise<unknown>>(fn: T) =>
  (req: Request, res: Response, next: NextFunction) =>
    Promise.resolve(fn(req, res)).catch(next);

export const webhooksRoutes = Router();

// Twilio sends application/x-www-form-urlencoded
webhooksRoutes.post(
  '/twilio/sms',
  express.urlencoded({ extended: false }),
  asyncH(async (req: Request, res: Response) => {
    const sig = req.header('x-twilio-signature');
    const proto = req.header('x-forwarded-proto') ?? req.protocol;
    const host = req.header('host');
    const url = `${proto}://${host}${req.originalUrl}`;
    if (!sig || !verifyTwilioSignature(sig, url, req.body)) {
      logger.warn('twilio signature invalid');
      throw unauthorized('INVALID_SIGNATURE', 'Invalid Twilio signature');
    }

    const body = req.body as Record<string, string>;
    await messagesService.recordInbound({
      fromNumber: body.From ?? '',
      toNumber: body.To ?? '',
      body: body.Body ?? '',
      twilioSid: body.MessageSid ?? '',
    });

    res.set('Content-Type', 'text/xml');
    res.status(200).send('<Response/>');
  }),
);

webhooksRoutes.post(
  '/n8n/order-status',
  asyncH(async (req: Request, res: Response) => {
    const sig = req.header('x-n8n-signature');
    if (!config.N8N_WEBHOOK_SECRET || !sig) {
      throw unauthorized('NO_SIGNATURE', 'Missing webhook signature');
    }
    const expected = crypto
      .createHmac('sha256', config.N8N_WEBHOOK_SECRET)
      .update(JSON.stringify(req.body))
      .digest('hex');
    if (!crypto.timingSafeEqual(Buffer.from(sig, 'utf8'), Buffer.from(expected, 'utf8'))) {
      throw unauthorized('INVALID_SIGNATURE', 'Invalid webhook signature');
    }

    logger.info('n8n order-status received', { body: req.body });
    res.json({ received: true });
  }),
);
