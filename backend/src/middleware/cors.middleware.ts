import cors from "cors";
import { Request, Response, NextFunction } from "express";
import { createCorsOptions } from "../config/cors.config";

export const corsMiddleware = () => {
  const env = process.env.NODE_ENV || "development";
  const corsOptions = createCorsOptions(env);

  // Log CORS configuration in development
  if (env === "development") {
    console.log("🌐 CORS Configuration:", {
      environment: env,
      allowedOrigins: corsOptions.origin,
      credentials: corsOptions.credentials,
    });
  }

  return cors(corsOptions);
};

// Custom CORS error handler
export const corsErrorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (err.message.includes("CORS")) {
    return res.status(403).json({
      error: "CORS Error",
      message: "Origin not allowed by CORS policy",
      origin: req.get("Origin"),
    });
  }
  next(err);
};
