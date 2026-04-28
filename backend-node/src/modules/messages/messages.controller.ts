import { Request, Response } from 'express';
import { unauthorized } from '@/middleware/errors';
import { listMessagesQuery, markReadDto, sendMessageDto } from './messages.dto';
import { messagesService } from './messages.service';

function ctx(req: Request) {
  if (!req.user) throw unauthorized();
  return { actorId: req.user.sub, ip: req.ip ?? null, requestId: req.id };
}

export const messagesController = {
  async list(req: Request, res: Response): Promise<void> {
    if (!req.user) throw unauthorized();
    const q = listMessagesQuery.parse(req.query);
    const page = await messagesService.list(req.user.sub, q);
    res.json(page);
  },

  async send(req: Request, res: Response): Promise<void> {
    const c = ctx(req);
    const dto = sendMessageDto.parse(req.body);
    const message = await messagesService.send(c.actorId, dto, c);
    res.status(202).json({ message });
  },

  async markRead(req: Request, res: Response): Promise<void> {
    if (!req.user) throw unauthorized();
    const dto = markReadDto.parse(req.body);
    const result = await messagesService.markRead(req.user.sub, dto);
    res.json(result);
  },
};
