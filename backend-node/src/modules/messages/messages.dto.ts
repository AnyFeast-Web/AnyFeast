import { z } from 'zod';

export const sendMessageDto = z.object({
  clientId: z.string().uuid(),
  body: z.string().min(1).max(1600),
  to: z.string().min(5).max(32).optional(),
});
export type SendMessageDto = z.infer<typeof sendMessageDto>;

export const listMessagesQuery = z.object({
  cursor: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
  clientId: z.string().uuid().optional(),
});
export type ListMessagesQuery = z.infer<typeof listMessagesQuery>;

export const markReadDto = z.object({
  ids: z.array(z.string().uuid()).min(1).max(100),
});
export type MarkReadDto = z.infer<typeof markReadDto>;
