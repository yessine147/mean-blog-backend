import { z } from 'zod';

export const ListNotificationsQuery = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(20),
  isRead: z.enum(['true', 'false']).optional(),
});

export type ListNotificationsQuery = z.infer<typeof ListNotificationsQuery>;

export const MarkReadDto = z.object({
  ids: z.array(z.string()).min(1),
});

export type MarkReadDto = z.infer<typeof MarkReadDto>;
