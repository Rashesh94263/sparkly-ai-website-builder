import express from "express";
import templateRoutes from "./routes/template.routes";
import chatRoutes from "./routes/chat.routes";
import { corsMiddleware, corsErrorHandler } from "./middleware/cors.middleware";
import helmet from "helmet";
import loggers from "./logs/loggers";
import { authenticateJWT } from "./middleware/authenticateJWT";
import { apiLimiter } from "./middleware/rateLimiter";
import cookieParser from "cookie-parser";
import handleSessionRoutes  from "./routes/session.routes";

const app = express();



// Security middleware
app.use(helmet());

// CORS middleware (must be before routes)
app.use(corsMiddleware());

// Parse the cookies securely
app.use(cookieParser());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/session", apiLimiter, handleSessionRoutes);
app.use("/api/chat", apiLimiter, authenticateJWT, chatRoutes);
app.use("/api/template", apiLimiter, authenticateJWT, templateRoutes);

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    environment: process.env.NODE_ENV || "development",
    timestamp: new Date().toISOString(),
  });
});

app.get("/health/log", (req, res) => {
  loggers.info("Health check log");
  res.send("Log sent");
});


// CORS error handler
app.use(corsErrorHandler);

export default app;


