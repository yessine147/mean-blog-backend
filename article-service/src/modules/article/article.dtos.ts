import { z } from 'zod';

export const CreateArticleDto = z.object({
  title: z.string().min(1),
  content: z.string().min(1),
  coverImageUrl: z.string().url().optional(),
});
export type CreateArticleDto = z.infer<typeof CreateArticleDto>;

export const UpdateArticleDto = z.object({
  title: z.string().min(1).optional(),
  content: z.string().min(1).optional(),
  coverImageUrl: z.string().url().optional(),
});
export type UpdateArticleDto = z.infer<typeof UpdateArticleDto>;

export const AddCommentDto = z.object({
  content: z.string().min(1),
  parentId: z.string().optional(),
});
export type AddCommentDto = z.infer<typeof AddCommentDto>;
