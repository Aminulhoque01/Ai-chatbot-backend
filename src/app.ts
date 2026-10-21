
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import authRoutes from "./module/auth/auth.routes.js";
import chatRouter from "./module/chat/chat.routes.js";
import { connectDB } from "./config/db.js";
 

const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_URL || "https://free-ai-chatbot-pi.vercel.app",
    credentials: true,
  })
);

app.use(express.json({ limit: "2mb" }));
app.use(cookieParser());

app.get("/api/health", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "AI Chatbot API is running",
  });
});


 
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    console.error("Database connection failed:", error);

    res.status(503).json({
      success: false,
      message: "Database temporarily unavailable",
    });
  }
});

app.use("/api/auth", authRoutes);
 app.use("/api/chats", chatRouter);

export default app;
