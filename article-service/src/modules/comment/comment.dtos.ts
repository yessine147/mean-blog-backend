import { z } from 'zod';

export const CreateCommentDto = z.object({
  articleId: z.string().min(1),
  content: z.string().min(1),
  parentId: z.string().optional(),
});
export type CreateCommentDto = z.infer<typeof CreateCommentDto>;

export const ListCommentsQuery = z.object({
  articleId: z.string().min(1),
  parentId: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(20),
  tree: z.coerce.boolean().optional(),
});
export type ListCommentsQuery = z.infer<typeof ListCommentsQuery>;
