export interface Tag {
  id?: string;
  name: string;
  slug: string;
}

export interface CommentInput {
  content: string;
  parentId?: string;
}
