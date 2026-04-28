import { NextFunction, Request, Response } from 'express';
import { ZodTypeAny, z } from 'zod';

type Source = 'body' | 'query' | 'params';

export function validate<S extends ZodTypeAny>(schema: S, source: Source = 'body') {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req[source]);
    if (!result.success) return next(result.error);
    (req as unknown as Record<Source, z.infer<S>>)[source] = result.data;
    next();
  };
}
