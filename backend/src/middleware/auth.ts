import jwt from "jsonwebtoken";
import type { Request, Response, NextFunction } from "express";
import { Role } from "@prisma/client";

const JWT_SECRET = process.env.JWT_SECRET || "supersecretdevkey_change_me";

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const auth = req.headers.authorization;
  if (!auth?.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Missing or invalid Authorization header" });
  }
  const token = auth.slice("Bearer ".length);
  try {
    const payload = jwt.verify(token, JWT_SECRET) as { userId: number; role: Role };
    req.user = { userId: payload.userId, role: payload.role };
    next();
  } catch {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}

export function requireRole(...roles: Role[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });
    if (!roles.includes(req.user.role)) return res.status(403).json({ message: "Forbidden" });
    next();
  };
}