import { Request, Response } from 'express';
import { z, ZodError } from 'zod';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

import User from '../models/user.model.js';
import Token from '../models/token.model.js';

import { throwIf, handleZodError, sendSuccess } from '../utils/helper.js';
import { ApiError } from '../utils/ApiError.js';

const REFRESH_EXPIRY_MS = Number(process.env.TOKEN_EXPIRY) || 7 * 24 * 60 * 60 * 1000;

const signupSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 chars'),
  email: z.string().email('Invalid email'),
  password: z.string().min(8, 'Password must be at least 8 chars'),
});
type SignupInput = z.infer<typeof signupSchema>;

const loginSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(1, 'Password required'),
});
type LoginInput = z.infer<typeof loginSchema>;

export const signup = async (req: Request, res: Response) => {
  let input: SignupInput;
  try {
    input = signupSchema.parse(req.body);
  } catch (err) {
    if (err instanceof ZodError) return handleZodError(err);
    throw err;
  }

  const { username, email, password } = input;
  const existingEmail = await User.findOne({ where: { email } });
  throwIf(existingEmail !== null, 409, 'Email already in use');

  const existingUsername = await User.findOne({ where: { username } });
  throwIf(existingUsername !== null, 409, 'Username already in use');

  const newUser = await User.create({ username, email, password, usertype: 'User' });
  return sendSuccess(res, 201, 'User created successfully', { id: newUser.id });
};

export const login = async (req: Request, res: Response) => {
  let input: LoginInput;
  try {
    input = loginSchema.parse(req.body);
  } catch (err) {
    if (err instanceof ZodError) return handleZodError(err);
    throw err;
  }

  const { email, password } = input;
  const user = await User.findOne({ where: { email } });
  throwIf(!user, 401, 'Invalid credentials');

  const valid = await bcrypt.compare(password, user?.password || '');
  throwIf(!valid, 401, 'Invalid credentials');

  const accessToken = jwt.sign(
    { id: user?.id },
    process.env.JWT_SECRET as string,
    { expiresIn: '15m' }
  );
  const refreshToken = jwt.sign(
    { id: user?.id },
    process.env.REFRESH_SECRET as string,
    { expiresIn: '7d' }
  );
  await Token.create({
    userId: user?.id,
    refreshToken,
    userAgent: req.headers['user-agent'],
    ipAddress: req.ip,
    expiresAt: new Date(Date.now() + REFRESH_EXPIRY_MS),
  });

  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/api/v1/auth',
    maxAge: REFRESH_EXPIRY_MS,
  });

  return sendSuccess(res, 200, 'Logged in successfully', { accessToken });

};

export const logout = async (req: Request, res: Response) => {
  const { refreshToken } = req.cookies;
  throwIf(!refreshToken, 400, 'Refresh token is required');

  const count = await Token.destroy({ where: { refreshToken } });
  throwIf(count === 0, 404, 'Refresh token not found');

  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/api/v1/auth',
  });

  return sendSuccess(res, 200, 'Logged out successfully');
};

export const getProfile = async (req: Request, res: Response) => {
  const username = req.params.username;
  const user = await User.findOne({
    where: { username },
    attributes: ['id', 'username', 'usertype', 'createdAt'],
  });
  throwIf(!user, 404, 'User not found');

  return sendSuccess(res, 200, 'Profile fetched', user);
};

export const getMe = async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const user = await User.findByPk(userId, {
    attributes: ['id', 'username', 'email', 'usertype', 'createdAt'],
  });
  throwIf(!user, 404, 'Authenticated user not found');

  return sendSuccess(res, 200, 'Profile fetched', user);
};

export const refresh = async (req: Request, res: Response) => {
  const token = req.cookies['refreshToken'];
  throwIf(!token, 401, 'No refresh token provided');

  let payload: any;
  try {
    payload = jwt.verify(token, process.env.REFRESH_SECRET!);
  } catch (err) {
    throw new ApiError(401, 'Invalid or expired refresh token');
  }

  const stored: Token | null = await Token.findOne({ where: { refreshToken: token }});
  throwIf(!stored, 401, 'Refresh token revoked');

  const newAccessToken = jwt.sign({ id: payload.id }, process.env.JWT_SECRET!, { expiresIn: '15m' });
  const newRefreshToken = jwt.sign({ id: payload.id }, process.env.REFRESH_SECRET!, { expiresIn: '7d' });
  if(stored){
    stored.refreshToken = newRefreshToken;
    await stored.save();
  }
  const refreshExpiryMs = REFRESH_EXPIRY_MS;

  res.cookie('refreshToken', newRefreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/api/v1/auth',
    maxAge: refreshExpiryMs,
  });

  return sendSuccess(res, 200, 'Token refreshed', { accessToken: newAccessToken });
};