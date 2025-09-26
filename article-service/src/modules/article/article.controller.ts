import { Request, Response, NextFunction } from 'express';
import { ArticleService } from './article.service';
import { CreateArticleDto, UpdateArticleDto } from './article.dtos';
import { CommentService } from '../comment/comment.service';
import mongoose from 'mongoose';
import { AppError } from '../../utils/http-error';

const service = new ArticleService();
const commentService = new CommentService();

export async function createArticle(req: any, res: Response, next: NextFunction) {
  try {
    const body = CreateArticleDto.parse(req.body);
    const article = await service.create(req.user.sub, body);
    res.status(201).json({ article });
  } catch (err) {
    next(err);
  }
}

export async function updateArticle(req: any, res: Response, next: NextFunction) {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      throw AppError.badRequest('Invalid article id');
    }
    const body = UpdateArticleDto.parse(req.body);
    const article = await service.update(req.user.sub, req.user.role, req.params.id, body);
    res.json({ article });
  } catch (err) {
    next(err);
  }
}

export async function getArticle(req: Request, res: Response, next: NextFunction) {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      throw AppError.badRequest('Invalid article id');
    }
    const article = await service.getById(req.params.id);
    if (!article) throw AppError.notFound('Article not found');
    const comments = await commentService.listTree(String(article._id));
    res.json({ article, comments });
  } catch (err) {
    next(err);
  }
}

export async function listArticles(req: Request, res: Response, next: NextFunction) {
  try {
    const page = Number((req.query.page as string) || 1);
    const pageSize = Number((req.query.pageSize as string) || 20);
    const q = (req.query.q as string) || undefined;
    const result = await service.list(page, pageSize, q);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function deleteArticle(req: any, res: Response, next: NextFunction) {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      throw AppError.badRequest('Invalid article id');
    }
    await service.delete(req.user.sub, req.user.role, req.params.id);
    res.json({ message: 'Article deleted successfully' });
  } catch (err) {
    next(err);
  }
}
