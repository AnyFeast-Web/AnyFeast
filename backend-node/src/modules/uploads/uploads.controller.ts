import { Request, Response } from 'express';
import { unauthorized } from '@/middleware/errors';
import { createSignedUploadUrl } from '@/lib/storage';
import { signUrlDto } from './uploads.dto';

export const uploadsController = {
  async signUrl(req: Request, res: Response): Promise<void> {
    if (!req.user) throw unauthorized();
    const dto = signUrlDto.parse(req.body);
    const stamp = Date.now();
    const path = [
      req.user.sub,
      dto.scope,
      dto.clientId ?? 'general',
      `${stamp}-${dto.filename}`,
    ].join('/');
    const signed = await createSignedUploadUrl(path);
    res.json({
      uploadUrl: signed.uploadUrl,
      token: signed.token,
      path: signed.path,
      expiresIn: signed.expiresIn,
    });
  },
};
