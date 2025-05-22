import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import Token from "../models/token.model.js";
import { sendSuccess } from "../utils/helper.js";
import dotenv from "dotenv";
dotenv.config();

const REFRESH_EXPIRY_MS =
  Number(process.env.TOKEN_EXPIRY) || 7 * 24 * 60 * 60 * 1000; // 7 days

export const handleOAuthSuccess = async (req: Request, res: Response) => {
  const user = req.user as any;
  if (!user) {
    return res.status(401).json({ message: "Authentication failed" });
  }
  const accessToken = jwt.sign(
    { id: user.id },
    process.env.JWT_SECRET as string,
    { expiresIn: "15m" }
  );
  const refreshToken = jwt.sign(
    { id: user.id },
    process.env.REFRESH_SECRET as string,
    { expiresIn: "7d" }
  );
  await Token.create({
    userId: user.id,
    refreshToken,
    userAgent: req.headers["user-agent"],
    ipAddress: req.ip,
    expiresAt: new Date(Date.now() + REFRESH_EXPIRY_MS),
  });
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: REFRESH_EXPIRY_MS,
  });
  return sendSuccess(res, 200, "OAuth login successful", { accessToken });
};
