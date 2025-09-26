import { Article, ArticleDocument } from './article.model';
import { CommentService } from '../comment/comment.service';
import { NotificationServiceClient } from '../../utils/notification.service';
import { AppError } from '../../utils/http-error';
import mongoose from 'mongoose';

export class ArticleService {
  private notificationService: NotificationServiceClient;

  constructor() {
    this.notificationService = new NotificationServiceClient();
  }
  async create(authorId: string, dto: { title: string; content: string; coverImageUrl?: string; }): Promise<ArticleDocument> {
    return Article.create({ ...dto, authorId });
  }

  async update(userId: string, userRole: string, id: string, dto: Partial<{ title: string; content: string; coverImageUrl?: string }>): Promise<ArticleDocument> {
    // Check if article exists first
    const article = await Article.findById(id);
    if (!article) {
      throw AppError.notFound('Article not found');
    }

    // Check ownership
    if (userRole !== 'Admin' && userRole !== 'Editor' && String(article.authorId) !== userId) {
      throw AppError.accessDenied('You can only edit your own articles');
    }

    // If someone else is updating the article (Admin/Editor), notify the author
    if (String(article.authorId) !== userId) {
      await this.notificationService.createNotification({
        userId: String(article.authorId),
        type: 'article_updated',
        title: 'Your article was updated',
        message: `Your article "${article.title}" was updated by an ${userRole.toLowerCase()}`,
        data: { articleId: id, updatedBy: userId, userRole }
      });
    }

    Object.assign(article, dto);
    await article.save();
    return article;
  }

  async getById(id: string): Promise<any | null> {
    const result = await Article.aggregate([
      { $match: { _id: new mongoose.Types.ObjectId(id) } },
      {
        $lookup: {
          from: 'users',
          let: { authorId: { $toObjectId: '$authorId' } },
          pipeline: [
            { $match: { $expr: { $eq: ['$_id', '$$authorId'] } } }
          ],
          as: 'author'
        }
      },
      {
        $unwind: {
          path: '$author',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $project: {
          _id: 1,
          title: 1,
          content: 1,
          coverImageUrl: 1,
          createdAt: 1,
          updatedAt: 1,
          authorId: 1,
          author: {
            _id: '$author._id',
            email: '$author.email',
            userName: '$author.userName',
            role: '$author.role'
          }
        }
      }
    ]);

    return result.length > 0 ? result[0] : null;
  }

  async list(page: number, pageSize: number, q?: string) {
    const skip = (page - 1) * pageSize;
    const matchFilter: any = {};
    if (q && q.trim()) {
      const regex = new RegExp(q.trim(), 'i');
      matchFilter.$or = [{ title: regex }, { content: regex }];
    }

    const [items, total] = await Promise.all([
      Article.aggregate([
        { $match: matchFilter },
        {
          $lookup: {
            from: 'users',
            let: { authorId: { $toObjectId: '$authorId' } },
            pipeline: [
              { $match: { $expr: { $eq: ['$_id', '$$authorId'] } } }
            ],
            as: 'author'
          }
        },
        {
          $unwind: {
            path: '$author',
            preserveNullAndEmptyArrays: true
          }
        },
        {
          $project: {
            _id: 1,
            title: 1,
            content: 1,
            coverImageUrl: 1,
            createdAt: 1,
            updatedAt: 1,
            authorId: 1,
            author: {
              _id: '$author._id',
              email: '$author.email',
              userName: '$author.userName',
              role: '$author.role'
            }
          }
        },
        { $sort: { createdAt: -1 } },
        { $skip: skip },
        { $limit: pageSize }
      ]),
      Article.countDocuments(matchFilter),
    ]);
    return { items, total, page, pageSize };
  }

  async delete(userId: string, userRole: string, id: string): Promise<void> {
    // Check if article exists first
    const article = await Article.findById(id);
    if (!article) {
      throw AppError.notFound('Article not found');
    }

    // Check ownership
    if (userRole !== 'Admin' && userRole !== 'Editor' && String(article.authorId) !== userId) {
      throw AppError.accessDenied('You can only delete your own articles');
    }
    
    // If someone else is deleting the article (Admin/Editor), notify the author
    if (String(article.authorId) !== userId) {
      await this.notificationService.createNotification({
        userId: String(article.authorId),
        type: 'article_deleted',
        title: 'Your article was deleted',
        message: `Your article "${article.title}" was deleted by an ${userRole.toLowerCase()}`,
        data: { articleId: id, deletedBy: userId, userRole }
      });
    }
    
    // Delete all comments for this article
    const commentService = new CommentService();
    await commentService.deleteByArticle(id);
    
    // Delete the article
    await Article.deleteOne({ _id: id });
  }
}
