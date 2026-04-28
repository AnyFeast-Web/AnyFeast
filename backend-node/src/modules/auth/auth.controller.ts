import { Request, Response } from 'express';
import { authService } from './auth.service';
import {
  changePasswordDto,
  forgotPasswordDto,
  loginDto,
  refreshDto,
  registerDto,
  resetPasswordDto,
} from './auth.dto';
import { unauthorized } from '@/middleware/errors';

function ctxFrom(req: Request) {
  return { ip: req.ip ?? null, userAgent: req.header('user-agent') ?? null };
}

export const authController = {
  async register(req: Request, res: Response): Promise<void> {
    const dto = registerDto.parse(req.body);
    const result = await authService.register(dto, ctxFrom(req));
    res.status(201).json(result);
  },

  async login(req: Request, res: Response): Promise<void> {
    const dto = loginDto.parse(req.body);
    const result = await authService.login(dto, ctxFrom(req));
    res.json(result);
  },

  async refresh(req: Request, res: Response): Promise<void> {
    const dto = refreshDto.parse(req.body);
    const result = await authService.refresh(dto, ctxFrom(req));
    res.json(result);
  },

  async logout(req: Request, res: Response): Promise<void> {
    const dto = refreshDto.parse(req.body);
    await authService.logout(dto);
    res.status(204).end();
  },

  async me(req: Request, res: Response): Promise<void> {
    if (!req.user) throw unauthorized();
    const user = await authService.me(req.user.sub);
    res.json({ user });
  },

  async forgotPassword(req: Request, res: Response): Promise<void> {
    const dto = forgotPasswordDto.parse(req.body);
    await authService.forgotPassword(dto.email);
    res.status(202).json({ message: 'If that email exists, a reset link has been sent.' });
  },

  async resetPassword(req: Request, res: Response): Promise<void> {
    const dto = resetPasswordDto.parse(req.body);
    await authService.resetPassword(dto);
    res.status(204).end();
  },

  async changePassword(req: Request, res: Response): Promise<void> {
    if (!req.user) throw unauthorized();
    const dto = changePasswordDto.parse(req.body);
    await authService.changePassword(req.user.sub, dto);
    res.status(204).end();
  },
};
