import { Request, Response } from 'express';
import { unauthorized } from '@/middleware/errors';
import {
  createMealPlanDto,
  generateMealPlanDto,
  listMealPlansQuery,
  sendMealPlanEmailDto,
  updateMealPlanDto,
} from './mealplans.dto';
import { mealPlansService } from './mealplans.service';

function ctx(req: Request) {
  if (!req.user) throw unauthorized();
  return { actorId: req.user.sub, ip: req.ip ?? null, requestId: req.id };
}

export const mealPlansController = {
  async list(req: Request, res: Response): Promise<void> {
    if (!req.user) throw unauthorized();
    const q = listMealPlansQuery.parse(req.query);
    const page = await mealPlansService.list(req.user.sub, q);
    res.json(page);
  },

  async get(req: Request, res: Response): Promise<void> {
    if (!req.user) throw unauthorized();
    const plan = await mealPlansService.get(req.user.sub, req.params.id);
    res.json({ mealPlan: plan });
  },

  async create(req: Request, res: Response): Promise<void> {
    const c = ctx(req);
    const dto = createMealPlanDto.parse(req.body);
    const plan = await mealPlansService.create(c.actorId, dto, c);
    res.status(201).json({ mealPlan: plan });
  },

  async update(req: Request, res: Response): Promise<void> {
    const c = ctx(req);
    const dto = updateMealPlanDto.parse(req.body);
    const plan = await mealPlansService.update(c.actorId, req.params.id, dto, c);
    res.json({ mealPlan: plan });
  },

  async remove(req: Request, res: Response): Promise<void> {
    const c = ctx(req);
    await mealPlansService.remove(c.actorId, req.params.id, c);
    res.status(204).end();
  },

  async generate(req: Request, res: Response): Promise<void> {
    const c = ctx(req);
    const dto = generateMealPlanDto.parse(req.body);
    const plan = await mealPlansService.generate(c.actorId, dto, c);
    res.status(201).json({ mealPlan: plan });
  },

  async sendEmail(req: Request, res: Response): Promise<void> {
    const c = ctx(req);
    const dto = sendMealPlanEmailDto.parse(req.body);
    const result = await mealPlansService.enqueueEmail(c.actorId, req.params.id, dto.to, c);
    res.status(202).json(result);
  },
};
