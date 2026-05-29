import dotenv from "dotenv";
import path from "path";

dotenv.config({
  path: path.resolve(process.cwd(), ".env"),
});

export const ENV = {
  PORT: Number(process.env.PORT) || 3001,
  QUEUE_SECRET: process.env.QUEUE_SECRET || "",
  CORS_ORIGIN: process.env.CORS_ORIGIN || "http://localhost:5173",
};
