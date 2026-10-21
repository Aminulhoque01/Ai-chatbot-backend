
import type { Request, Response } from "express";
import { OAuth2Client } from "google-auth-library";
import jwt from "jsonwebtoken";
import User from "./user.model.js";

const googleClient = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID
);

export async function googleLogin(
  req: Request,
  res: Response
) {
  try {
    const { credential } = req.body as {
      credential?: string;
    };

    if (!credential) {
      return res.status(400).json({
        success: false,
        message: "Google credential is required",
      });
    }

    const clientId = process.env.GOOGLE_CLIENT_ID;
    const jwtSecret = process.env.JWT_SECRET;

    if (!clientId || !jwtSecret) {
      return res.status(500).json({
        success: false,
        message: "Authentication is not configured",
      });
    }

    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: clientId,
    });

    const payload = ticket.getPayload();

    if (
      !payload?.sub ||
      !payload.email ||
      !payload.email_verified
    ) {
      return res.status(401).json({
        success: false,
        message: "Invalid or unverified Google account",
      });
    }

    const user = await User.findOneAndUpdate(
      { googleId: payload.sub },
      {
        $set: {
          email: payload.email,
          name: payload.name || payload.email,
          avatar: payload.picture || "",
        },
      },
      {
        new: true,
        upsert: true,
        runValidators: true,
        setDefaultsOnInsert: true,
      }
    );

    const token = jwt.sign(
      { userId: user._id.toString() },
      jwtSecret,
      { expiresIn: "7d" }
    );

    res.cookie("chat_session", token, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: "/",
    });

    return res.status(200).json({
      success: true,
      message: "Google login successful",
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    console.error("Google login failed:", error);

    return res.status(401).json({
      success: false,
      message: "Google authentication failed",
    });
  }
}


 

export async function getCurrentUser(req: Request, res: Response) {
  try {
    const token = req.cookies?.chat_session;
    const jwtSecret = process.env.JWT_SECRET;

    if (!token || !jwtSecret) {
      return res.status(401).json({
        success: false,
        message: "Not authenticated",
      });
    }

    const decoded = jwt.verify(token, jwtSecret) as {
      userId: string;
    };

    const user = await User.findById(decoded.userId).select(
      "_id name email avatar"
    );

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        avatar: user.avatar || "",
      },
    });
  } catch {
    return res.status(401).json({
      success: false,
      message: "Session expired or invalid",
    });
  }
}


export function logout(req: Request, res: Response) {
  res.clearCookie("chat_session", {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    path: "/",
  });

  return res.status(200).json({
    success: true,
    message: "Logged out successfully",
  });
}