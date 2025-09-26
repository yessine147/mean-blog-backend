import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ArticleDocument extends Document {
  title: string;
  authorId: string;
  content: string;
  coverImageUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

const articleSchema = new Schema<ArticleDocument>(
  {
    title: { type: String, required: true },
    authorId: { type: String, required: true, index: true },
    content: { type: String, required: true },
    coverImageUrl: { type: String },
  },
  { timestamps: true }
);

export const Article: Model<ArticleDocument> = mongoose.model<ArticleDocument>('Article', articleSchema);
