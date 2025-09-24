import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export const authenticateJWT = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Bearer <token> for the authorization header
    const authtoken = req.cookies.token;

    if (!authtoken) {
      return res.status(401).json({ message: "No token provided" });
    }

    const decoded = jwt.verify(authtoken, process.env.JWT_SECRET!);
    (req as any).user = decoded;
      next();
  } catch (error) {
    return res
      .status(403)
      .json({ message: "Invalid token or expired token" });
  }
};
