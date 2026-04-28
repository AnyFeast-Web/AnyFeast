import { Request, Response } from 'express';
import { unauthorized } from '@/middleware/errors';
import {
  createIngredientDto,
  listIngredientsQuery,
  updateIngredientDto,
} from './ingredients.dto';
import { ingredientsService } from './ingredients.service';

function ctx(req: Request) {
  if (!req.user) throw unauthorized();
  return { actorId: req.user.sub, ip: req.ip ?? null, requestId: req.id };
}

export const ingredientsController = {
  async list(req: Request, res: Response): Promise<void> {
    const q = listIngredientsQuery.parse(req.query);
    const page = await ingredientsService.list(q);
    res.json(page);
  },

  async get(req: Request, res: Response): Promise<void> {
    const ing = await ingredientsService.get(req.params.id);
    res.json({ ingredient: ing });
  },

  async create(req: Request, res: Response): Promise<void> {
    const c = ctx(req);
    const dto = createIngredientDto.parse(req.body);
    const ing = await ingredientsService.create(c.actorId, dto, c);
    res.status(201).json({ ingredient: ing });
  },

  async update(req: Request, res: Response): Promise<void> {
    const c = ctx(req);
    const dto = updateIngredientDto.parse(req.body);
    const ing = await ingredientsService.update(c.actorId, req.params.id, dto, c);
    res.json({ ingredient: ing });
  },

  async remove(req: Request, res: Response): Promise<void> {
    const c = ctx(req);
    await ingredientsService.remove(c.actorId, req.params.id, c);
    res.status(204).end();
  },
};
