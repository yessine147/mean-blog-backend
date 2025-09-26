import { Request, Response, NextFunction } from 'express';
import { CommentService } from './comment.service';
import { CreateCommentDto, ListCommentsQuery } from './comment.dtos';
import { AppError } from '../../utils/http-error';

const service = new CommentService();

export async function createComment(req: any, res: Response, next: NextFunction) {
  try {
    const body = CreateCommentDto.parse(req.body);
    const comment = await service.create(req.user.sub, body);
    res.status(201).json({ comment });
  } catch (err) {
    next(err);
  }
}

export async function listComments(req: Request, res: Response, next: NextFunction) {
  try {
    const q = ListCommentsQuery.parse(req.query);
    if (q.tree) {
      const tree = await service.listTree(q.articleId);
      return res.json({ items: tree });
    }
    const result = await service.listByArticle(q.articleId, q.page, q.pageSize, q.parentId);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function deleteCommentTree(req: any, res: Response, next: NextFunction) {
  try {
    const result = await service.deleteTree(req.user.sub, req.user.role, req.params.id);
    res.json({ message: 'Comment tree deleted successfully', deletedCount: result.deletedCount });
  } catch (err) {
    next(err);
  }
}
