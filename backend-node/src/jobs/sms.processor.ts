import { sendSms } from '@/lib/sms';
import { startWorker } from '@/lib/queue';
import { Message } from '@/models/Message';
import { logger } from '@/lib/logger';

export interface SendSmsJob {
  messageId: string;
}

export function startSmsWorker() {
  return startWorker<SendSmsJob>('sms', async (jobName, data) => {
    if (jobName !== 'send') {
      logger.warn('unknown sms job', { jobName });
      return;
    }
    const message = await Message.findByPk(data.messageId);
    if (!message) {
      logger.warn('sms job: message missing', { id: data.messageId });
      return;
    }
    if (!message.toNumber) {
      message.status = 'failed';
      message.error = { reason: 'no_to_number' };
      await message.save();
      return;
    }

    try {
      const res = await sendSms({ to: message.toNumber, body: message.body });
      message.twilioSid = res.sid;
      message.status = res.status;
      await message.save();
      logger.info('sms sent', { messageId: message.id, sid: res.sid });
    } catch (err) {
      const e = err as Error;
      message.status = 'failed';
      message.error = { message: e.message };
      await message.save();
      throw e;
    }
  });
}
