import { Request, Response } from "express";
import jwt from "jsonwebtoken";

export const handleSession = async (req: Request, res: Response) => {
  try {
    const token = jwt.sign({ userId: "anonymous" }, process.env.JWT_SECRET!, {
      expiresIn: "1h",
    });

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",// Set to true in production
      sameSite: "strict",
      maxAge: 3600000, // 1 hour
    });

    res.json({ message: "Session initialized" });

  } catch (error) {
    return res.status(500).json({ message: "Internal session information error" });
  }
};
