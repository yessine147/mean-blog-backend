export enum UserRole {
  Admin = 'Admin',
  Editor = 'Editor',
  Author = 'Author',
  Reader = 'Reader',
}

export interface PublicUser {
  id: string;
  email: string;
  userName: string;
  role: UserRole;
  avatarUrl?: string;
  createdAt: string;
  updatedAt: string;
}
