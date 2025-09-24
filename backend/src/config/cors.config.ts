import { CorsOptions } from "cors";
import loggers from "../logs/loggers";

export const corsConfig = {
  development: {
    origins: [
      "http://localhost:5173",
      "http://localhost:5174",
      "http://localhost:3000", 
      "http://127.0.0.1:5173", 
      "http://127.0.0.1:3000", 
     ],
    credentials: true,
  },

  production: {
    origins: [
      process.env.FRONTEND_URL,
      // Add other production URLs as needed
    ].filter(Boolean),
    credentials: true,
  },
};

export const createCorsOptions = (env: string = "development"): CorsOptions => {
  const isDev = env !== "production";

  if (isDev) {
    return {
      origin: corsConfig.development.origins,
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
      allowedHeaders: [
        "Content-Type",
        "Authorization",
        "X-Requested-With",
        "Accept",
      ],
      credentials: corsConfig.development.credentials,
      optionsSuccessStatus: 200, 
      preflightContinue: false,
    };
  }

  // Production CORS options
  return {
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, Postman, etc.)
      if (!origin) return callback(null, true);

      if (corsConfig.production.origins.includes(origin)) {
        return callback(null, true);
      }

      loggers.warn(`🚫 CORS blocked request from origin: ${origin}`);
      return callback(new Error("CORS policy violation"));
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "X-Requested-With",
      "Accept",
    ],
    credentials: corsConfig.production.credentials,
    maxAge: 86400, // 24 hours
    optionsSuccessStatus: 200,
  };
};
