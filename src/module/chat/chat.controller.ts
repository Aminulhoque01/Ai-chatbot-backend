
import type { Request, Response } from "express";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";

import Chat from "./chat.model.js";

interface AuthenticatedRequest extends Request {
  userId?: string;
}

function getAuthenticatedUserId(req: Request): string | null {
  const token = req.cookies?.chat_session;
  const jwtSecret = process.env.JWT_SECRET;

  if (!token || !jwtSecret) {
    return null;
  }

  try {
    const decoded = jwt.verify(token, jwtSecret) as {
      userId: string;
    };

    if (!mongoose.Types.ObjectId.isValid(decoded.userId)) {
      return null;
    }

    return decoded.userId;
  } catch {
    return null;
  }
}

// POST /api/chats
export async function createChat(req: Request, res: Response) {
  try {
    const userId = getAuthenticatedUserId(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Please login first",
      });
    }

    const { title, messages } = req.body as {
      title?: string;
      messages?: Array<{
        role: "user" | "assistant";
        content: string;
      }>;
    };

    if (messages !== undefined && !Array.isArray(messages)) {
      return res.status(400).json({
        success: false,
        message: "Messages must be an array",
      });
    }

    const chat = await Chat.create({
      userId,
      title:
        typeof title === "string" && title.trim()
          ? title.trim().slice(0, 200)
          : "New Chat",
      messages: (messages ?? []).map((message) => ({
        role: message.role,
        content: message.content,
      })),
    });

    return res.status(201).json({
      success: true,
      chat,
    });
  } catch (error) {
    console.error("Create chat failed:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create chat",
    });
  }
}

// GET /api/chats
export async function getChats(req: Request, res: Response) {
  try {
    const userId = getAuthenticatedUserId(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Please login first",
      });
    }

    const chats = await Chat.find({ userId })
      .sort({ updatedAt: -1 })
      .select("-messages");

    return res.status(200).json({
      success: true,
      chats,
    });
  } catch (error) {
    console.error("Get chats failed:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to load chats",
    });
  }
}

// GET /api/chats/:id
export async function getChatById(req: Request, res: Response) {
  try {
    const userId = getAuthenticatedUserId(req);
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Please login first",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(id as string)) {
      return res.status(400).json({
        success: false,
        message: "Invalid chat ID",
      });
    }

    const chat = await Chat.findOne({
      _id: id,
      userId,
    });

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: "Chat not found",
      });
    }

    return res.status(200).json({
      success: true,
      chat,
    });
  } catch (error) {
    console.error("Get chat failed:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to load chat",
    });
  }
}


// PUT /api/chats/:id
export async function updateChat(req: Request, res: Response) {
  try {
    const userId = getAuthenticatedUserId(req);
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Please login first",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(id as string)) {
      return res.status(400).json({
        success: false,
        message: "Invalid chat ID",
      });
    }

    const { title, messages } = req.body;

    const updates: Record<string, unknown> = {};

    if (typeof title === "string") {
      updates.title = title.trim().slice(0, 200) || "New Chat";
    }

    if (messages !== undefined) {
      if (
        !Array.isArray(messages) ||
        !messages.every(
          (message: any) =>
            message &&
            ["user", "assistant"].includes(message.role) &&
            typeof message.content === "string"
        )
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid messages",
        });
      }

      updates.messages = messages.map((message: any) => ({
        role: message.role,
        content: message.content,
      }));
    }

    const chat = await Chat.findOneAndUpdate(
      { _id: id, userId },
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: "Chat not found",
      });
    }

    return res.status(200).json({
      success: true,
      chat,
    });
  } catch (error) {
    console.error("Update chat failed:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update chat",
    });
  }
}

// DELETE /api/chats/:id
export async function deleteChat(req: Request, res: Response) {
  try {
    const userId = getAuthenticatedUserId(req);
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Please login first",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(id as string)) {
      return res.status(400).json({
        success: false,
        message: "Invalid chat ID",
      });
    }

    const chat = await Chat.findOneAndDelete({
      _id: id,
      userId,
    });

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: "Chat not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Chat deleted successfully",
    });
  } catch (error) {
    console.error("Delete chat failed:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete chat",
    });
  }
}


