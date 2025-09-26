import { User, UserDocument } from './user.model';
import { UserRole } from './user.types';
import { comparePassword, hashPassword } from '../../utils/password';
import { signAccessToken, signRefreshToken, verifyToken } from '../../utils/jwt';
import { conflict, unauthorized, notFound } from '../../utils/http-error';

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export class UserService {
  async register(email: string, password: string, userName: string, role: UserRole = UserRole.Reader): Promise<UserDocument> {
    const existing = await User.findOne({ email });
    if (existing) {
      throw conflict('Email already in use');
    }
    const passwordHash = await hashPassword(password);
    const user = await User.create({ email, passwordHash, userName, role });
    return user;
  }

  async validateUser(email: string, password: string): Promise<UserDocument | null> {
    const user = await User.findOne({ email });
    if (!user) return null;
    const ok = await comparePassword(password, user.passwordHash);
    if (!ok) return null;
    return user;
  }

  generateTokens(user: UserDocument): AuthTokens {
    const payload = { sub: String(user._id), email: user.email, role: user.role };
    return {
      accessToken: signAccessToken(payload),
      refreshToken: signRefreshToken(payload),
    };
  }

  async refreshTokens(refreshToken: string): Promise<AuthTokens> {
    try {
      const payload = verifyToken<{ sub: string }>(refreshToken);
      const user = await User.findById(payload.sub);
      if (!user) throw unauthorized('Invalid refresh token');
      return this.generateTokens(user);
    } catch (e) {
      throw unauthorized('Invalid refresh token');
    }
  }

  async getMe(userId: string): Promise<UserDocument> {
    const user = await User.findById(userId);
    if (!user) throw notFound('User not found');
    return user;
  }
}
