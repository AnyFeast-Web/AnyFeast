import { Request, Response } from 'express';
import { unauthorized } from '@/middleware/errors';
import {
  createConsultationDto,
  listConsultationsQuery,
  updateConsultationDto,
} from './consultations.dto';
import { consultationsService } from './consultations.service';

function ctx(req: Request) {
  if (!req.user) throw unauthorized();
  return { actorId: req.user.sub, ip: req.ip ?? null, requestId: req.id };
}

export const consultationsController = {
  async list(req: Request, res: Response): Promise<void> {
    if (!req.user) throw unauthorized();
    const q = listConsultationsQuery.parse(req.query);
    const page = await consultationsService.list(req.user.sub, q);
    res.json(page);
  },

  async get(req: Request, res: Response): Promise<void> {
    if (!req.user) throw unauthorized();
    const c = await consultationsService.get(req.user.sub, req.params.id);
    res.json({ consultation: c });
  },

  async create(req: Request, res: Response): Promise<void> {
    const c = ctx(req);
    const dto = createConsultationDto.parse(req.body);
    const consultation = await consultationsService.create(c.actorId, dto, c);
    res.status(201).json({ consultation });
  },

  async update(req: Request, res: Response): Promise<void> {
    const c = ctx(req);
    const dto = updateConsultationDto.parse(req.body);
    const consultation = await consultationsService.update(c.actorId, req.params.id, dto, c);
    res.json({ consultation });
  },

  async remove(req: Request, res: Response): Promise<void> {
    const c = ctx(req);
    await consultationsService.remove(c.actorId, req.params.id, c);
    res.status(204).end();
  },
};
