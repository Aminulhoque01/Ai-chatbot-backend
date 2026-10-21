
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import authRoutes from "./module/auth/auth.routes.js";
import chatRouter from "./module/chat/chat.routes.js";

const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:3000",
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

app.use("/api/auth", authRoutes);
 app.use("/api/chats", chatRouter);

export default app;
