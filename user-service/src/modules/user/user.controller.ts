import { Request, Response, NextFunction } from 'express';
import { UserService } from './user.service';
import { RegisterDto, LoginDto, RefreshDto } from './user.dtos';

const userService = new UserService();

export async function register(req: Request, res: Response, next: NextFunction) {
  try {
    const body = RegisterDto.parse(req.body);
    const user = await userService.register(body.email, body.password, body.userName, body.role);
    res.status(201).json({ user });
  } catch (err) {
    next(err);
  }
}

export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const body = LoginDto.parse(req.body);
    const user = await userService.validateUser(body.email, body.password);
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });
    const tokens = userService.generateTokens(user);
    res.json({ user, tokens });
  } catch (err) {
    next(err);
  }
}

export async function refresh(req: Request, res: Response, next: NextFunction) {
  try {
    const body = RefreshDto.parse(req.body);
    const tokens = await userService.refreshTokens(body.refreshToken);
    res.json({ tokens });
  } catch (err) {
    next(err);
  }
}

export async function me(req: any, res: Response, next: NextFunction) {
  try {
    const userId = req.user?.sub as string;
    const user = await userService.getMe(userId);
    res.json({ user });
  } catch (err) {
    next(err);
  }
}

export async function logout(_req: Request, res: Response) {
  res.status(204).send();
}
