import express from "express";
import cors from "cors";

const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:3000",
  })
);

app.use(express.json({ limit: "2mb" }));

app.get("/api/health", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "AI Chatbot API is running",
  });
});

export default app;