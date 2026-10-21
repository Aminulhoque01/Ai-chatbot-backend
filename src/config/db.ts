
import mongoose from "mongoose";

export async function connectDB(): Promise<void> {
  const mongoUri = process.env.MONGODB_URI;

  if (!mongoUri) {
    throw new Error("MONGODB_URI is missing");
  }

  if (mongoose.connection.readyState === 1) {
    return;
  }

  try {
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 15000,
      bufferCommands: false,
    });

    console.log("MongoDB connected successfully:", {
      database: mongoose.connection.name,
      host: mongoose.connection.host,
    });
  } catch (error) {
    console.error("MongoDB connection failed:", error);
    throw error;
  }
}
