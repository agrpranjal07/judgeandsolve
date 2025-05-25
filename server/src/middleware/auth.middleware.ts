import { Request, Response, NextFunction } from "express";
import passport from "passport";
import "./passport.js"; // Import the passport configuration

export const authenticateJWT = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  passport.authenticate(
    "jwt",
    { session: false },
    (err: any, user: any, info: any) => {
      if (err) {
        return next(err);
      }
      if (!user) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      req.user = user;
      next();
    }
  )(req, res, next);
};

// Middleware to check if the user is an admin
export const isAdmin = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (req.user && (req.user as any).usertype === "Admin") {
    return next();
  }
  return res.status(403).json({ message: "Forbidden" });
}