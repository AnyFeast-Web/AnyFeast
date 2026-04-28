import { Request, Response } from 'express';
import { unauthorized } from '@/middleware/errors';
import { dashboardService } from './dashboard.service';

export const dashboardController = {
  async stats(req: Request, res: Response): Promise<void> {
    if (!req.user) throw unauthorized();
    const data = await dashboardService.stats(req.user.sub);
    res.json(data);
  },

  async activity(req: Request, res: Response): Promise<void> {
    if (!req.user) throw unauthorized();
    const limit = Math.min(Number(req.query.limit ?? 20) || 20, 100);
    const items = await dashboardService.activity(req.user.sub, limit);
    res.json({ items });
  },
};
