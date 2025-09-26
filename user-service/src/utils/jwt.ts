import jwt, { SignOptions, Secret } from 'jsonwebtoken';
import { env } from '../config/env';
import { unauthorized } from './http-error';

export type JwtPayload = {
  sub: string;
  email: string;
  role: string;
};

const secret: Secret = env.JWT_SECRET as unknown as Secret;

export function signAccessToken(payload: JwtPayload) {
  const options: SignOptions = { expiresIn: env.ACCESS_TOKEN_EXPIRES_IN as unknown as SignOptions['expiresIn'] };
  return jwt.sign(payload, secret, options);
}

export function signRefreshToken(payload: JwtPayload) {
  const options: SignOptions = { expiresIn: env.REFRESH_TOKEN_EXPIRES_IN as unknown as SignOptions['expiresIn'] };
  return jwt.sign(payload, secret, options);
}

export function verifyToken<T = any>(token: string): T {
  try {
    return jwt.verify(token, secret) as T;
  } catch (_err) {
    throw unauthorized('Invalid token');
  }
}
