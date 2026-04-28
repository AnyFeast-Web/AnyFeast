import { Request, Response } from 'express';
import { unauthorized } from '@/middleware/errors';
import {
  createClientDto,
  createMeasurementDto,
  listClientsQuery,
  updateClientDto,
} from './clients.dto';
import { clientsService } from './clients.service';

function ctx(req: Request) {
  if (!req.user) throw unauthorized();
  return { actorId: req.user.sub, ip: req.ip ?? null, requestId: req.id };
}

export const clientsController = {
  async list(req: Request, res: Response): Promise<void> {
    if (!req.user) throw unauthorized();
    const q = listClientsQuery.parse(req.query);
    const page = await clientsService.list(req.user.sub, q);
    res.json(page);
  },

  async get(req: Request, res: Response): Promise<void> {
    if (!req.user) throw unauthorized();
    const client = await clientsService.get(req.user.sub, req.params.id);
    res.json({ client });
  },

  async create(req: Request, res: Response): Promise<void> {
    const c = ctx(req);
    const dto = createClientDto.parse(req.body);
    const client = await clientsService.create(c.actorId, dto, c);
    res.status(201).json({ client });
  },

  async update(req: Request, res: Response): Promise<void> {
    const c = ctx(req);
    const dto = updateClientDto.parse(req.body);
    const client = await clientsService.update(c.actorId, req.params.id, dto, c);
    res.json({ client });
  },

  async remove(req: Request, res: Response): Promise<void> {
    const c = ctx(req);
    await clientsService.softDelete(c.actorId, req.params.id, c);
    res.status(204).end();
  },

  async addMeasurement(req: Request, res: Response): Promise<void> {
    const c = ctx(req);
    const dto = createMeasurementDto.parse(req.body);
    const m = await clientsService.addMeasurement(c.actorId, req.params.id, dto, c);
    res.status(201).json({ measurement: m });
  },
};
