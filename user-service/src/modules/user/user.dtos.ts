import { z } from 'zod';
import { UserRole } from './user.types';

export const strongPassword = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/(?=.*[a-z])/, 'Password must contain a lowercase letter')
  .regex(/(?=.*[A-Z])/, 'Password must contain an uppercase letter')
  .regex(/(?=.*\d)/, 'Password must contain a number')
  .regex(/(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?])/, 'Password must contain a special character');

export const RegisterDto = z.object({
  email: z.string().email(),
  password: strongPassword,
  userName: z.string().min(1),
  role: z.nativeEnum(UserRole).optional(),
});

export type RegisterDto = z.infer<typeof RegisterDto>;

export const LoginDto = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export type LoginDto = z.infer<typeof LoginDto>;

export const RefreshDto = z.object({
  refreshToken: z.string().min(1),
});

export type RefreshDto = z.infer<typeof RefreshDto>;
