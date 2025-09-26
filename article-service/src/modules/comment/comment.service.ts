import { Comment } from './comment.model';
import { Article } from '../article/article.model';
import mongoose from 'mongoose';
import { AppError } from '../../utils/http-error';
import { NotificationServiceClient } from '../../utils/notification.service';

export class CommentService {
  private notificationService: NotificationServiceClient;

  constructor() {
    this.notificationService = new NotificationServiceClient();
  }

  async create(authorId: string, dto: { articleId: string; content: string; parentId?: string }) {
    // Validate ObjectId format for articleId
    if (!mongoose.Types.ObjectId.isValid(dto.articleId)) {
      throw AppError.badRequest('Invalid article id');
    }

    const article = await Article.findById(dto.articleId);
    if (!article) {
      throw AppError.notFound('Article not found');
    }

    if (dto.parentId) {
      // Validate ObjectId format for parentId
      if (!mongoose.Types.ObjectId.isValid(dto.parentId)) {
        throw AppError.badRequest('Invalid parent comment id');
      }

      const parentComment = await Comment.findById(dto.parentId);
      if (!parentComment) {
        throw AppError.notFound('Parent comment not found');
      }
      if (String(parentComment.articleId) !== String(dto.articleId)) {
        throw AppError.badRequest('Parent comment does not belong to this article');
      }
    }

    const comment = await Comment.create({ articleId: dto.articleId, content: dto.content, parentId: dto.parentId, authorId });
    
    // Emit comment event to notification service
    await this.notificationService.emitCommentEvent(dto.articleId, comment);
    
    // Create notifications for relevant users
    const articleDoc = await Article.findById(dto.articleId);
    
    if (articleDoc) {
      // Notify article author if comment is on their article and commenter is different
      if (String(articleDoc.authorId) !== authorId) {
        await this.notificationService.createNotification({
          userId: String(articleDoc.authorId),
          type: 'comment_created',
          title: 'New comment on your article',
          message: `Someone commented on your article "${articleDoc.title}"`,
          data: { articleId: dto.articleId, commentId: comment._id }
        });
      }
      
      // If this is a reply, notify the parent comment author
      if (dto.parentId) {
        const parentComment = await Comment.findById(dto.parentId);
        if (parentComment && String(parentComment.authorId) !== authorId) {
          await this.notificationService.createNotification({
            userId: String(parentComment.authorId),
            type: 'reply_created',
            title: 'New reply to your comment',
            message: `Someone replied to your comment on "${articleDoc.title}"`,
            data: { articleId: dto.articleId, commentId: comment._id, parentCommentId: dto.parentId }
          });
        }
      }
    }
    
    return comment;
  }

  async listByArticle(articleId: string, page: number, pageSize: number, parentId?: string) {
    const filter: any = { articleId };
    if (parentId !== undefined) filter.parentId = parentId;
    const skip = (page - 1) * pageSize;
    const [items, total] = await Promise.all([
      Comment.find(filter).sort({ createdAt: -1 }).skip(skip).limit(pageSize),
      Comment.countDocuments(filter),
    ]);
    return { items, total, page, pageSize };
  }

  async listTree(articleId: string) {
    const all = await Comment.aggregate([
      { $match: { articleId: articleId } },
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
          content: 1,
          articleId: 1,
          parentId: 1,
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
      { $sort: { createdAt: 1 } }
    ]);
    
    
    const byId = new Map<string, any>();
    const roots: any[] = [];
    
    for (const c of all) {
      const commentWithId = { ...c, id: String(c._id), replies: [] };
      byId.set(String(c._id), commentWithId);
    }
    
    for (const c of byId.values()) {
      if (c.parentId) {
        const parent = byId.get(String(c.parentId));
        if (parent) parent.replies.push(c);
        else roots.push(c);
      } else {
        roots.push(c);
      }
    }
    
    return roots;
  }

  async deleteByArticle(articleId: string): Promise<number> {
    // Get all comments for the article (including nested ones)
    const getAllCommentIds = async (articleId: string): Promise<string[]> => {
      const directComments = await Comment.find({ articleId }, '_id').lean();
      const directIds = directComments.map(c => String(c._id));
      
      let allIds: string[] = [...directIds];
      
      // Recursively get all nested comment IDs
      for (const commentId of directIds) {
        const nestedIds = await this.getAllDescendantIds(commentId);
        allIds = allIds.concat(nestedIds);
      }
      
      return allIds;
    };

    const allCommentIds = await getAllCommentIds(articleId);
    
    // Delete all comments in one operation
    const result = await Comment.deleteMany({ _id: { $in: allCommentIds } });
    return result.deletedCount || 0;
  }

  private async getAllDescendantIds(parentId: string): Promise<string[]> {
    const directChildren = await Comment.find({ parentId }, '_id').lean();
    const childIds = directChildren.map(c => String(c._id));
    
    let allDescendants: string[] = [];
    for (const childId of childIds) {
      const descendants = await this.getAllDescendantIds(childId);
      allDescendants = allDescendants.concat(descendants);
    }
    
    return childIds.concat(allDescendants);
  }

  async deleteTree(userId: string, userRole: string, id: string): Promise<{ deletedCount: number }> {
    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw AppError.badRequest('Invalid comment id');
    }

    // Check if root comment exists first
    const rootComment = await Comment.findById(id);
    if (!rootComment) {
      throw AppError.notFound('Comment not found');
    }

    // Check ownership of root comment
    if (userRole !== 'Admin' && String(rootComment.authorId) !== userId) {
      throw AppError.accessDenied('You can only delete your own comments');
    }

    const descendantIds = await this.getAllDescendantIds(id);
    const allIdsToDelete = [id, ...descendantIds];

    // Delete all comments in the tree
    const result = await Comment.deleteMany({ _id: { $in: allIdsToDelete } });
    
    return { deletedCount: result.deletedCount || 0 };
  }
}
