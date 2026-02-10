// middleware/authMiddleware.ts
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

interface JwtPayload {
  userId: string;
}

export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Check multiple sources for token
    const token =
      req.cookies?.token ||
      req.headers.authorization?.split(" ")[1] ||
      req.query.token; // ✅ ADD THIS LINE

    if (!token) {
      // console.log("❌ No token found");
      return res.status(401).json({ message: "Unauthorized" });
    }

    const decoded = jwt.verify(token as string, process.env.JWT_SECRET!);
    (req as any).user = decoded;

    next();
  } catch (error) {
    console.log("❌ Token invalid", error);
    return res.status(401).json({ message: "Unauthorized" });
  }
};

export default authMiddleware;
