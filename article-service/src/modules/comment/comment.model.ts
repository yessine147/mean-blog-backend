import mongoose, { Schema, Document, Model } from 'mongoose';

export interface CommentDocument extends Document {
  articleId: string;
  authorId: string;
  content: string;
  parentId?: string;
  createdAt: Date;
  updatedAt: Date;
}

const commentSchema = new Schema<CommentDocument>(
  {
    articleId: { type: String, index: true, required: true },
    authorId: { type: String, required: true },
    content: { type: String, required: true },
    parentId: { type: String },
  },
  { timestamps: true }
);

export const Comment: Model<CommentDocument> = mongoose.model<CommentDocument>('Comment', commentSchema);
