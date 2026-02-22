// controllers/integrations.controller.ts
import { Request, Response } from "express";
// import jwt from "jsonwebtoken";
import ProfileModel from "../../../../models/profile.model";
import { verifyToken } from "../../../../utils/token.utils";
export const githubRedirect = async (req: Request, res: Response) => {
  try {
    const { token } = req.query;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Authentication token required",
      });
    }

    // Verify the token
    try {
      const decoded = verifyToken(token as string);
      const userId = (decoded as any).userId;

      // Store token in state to retrieve in callback
      const redirectUri = `${process.env.BACKEND_URL || "http://localhost:5000"}/api/v1/integrations/github/callback`;

      const githubAuthUrl =
        `https://github.com/login/oauth/authorize` +
        `?client_id=${process.env.CLIENT_ID_GITHUB}` +
        `&redirect_uri=${encodeURIComponent(redirectUri)}` +
        `&scope=read:user repo` +
        `&state=${token}`; // Pass token in state parameter

      return res.redirect(githubAuthUrl);
    } catch (err) {
      return res.status(401).json({
        success: false,
        message: "Invalid token",
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "GitHub redirect failed",
    });
  }
};

export const githubCallback = async (req: Request, res: Response) => {
  try {
    const { code, state } = req.query;
    const token = state as string; // Token from state parameter

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    // Verify token
    const decoded = verifyToken(token as string);
    const userId = (decoded as any).userId;

    // Exchange code for GitHub access token
    const redirectUri = `${process.env.BACKEND_URL || "http://localhost:5000"}/api/v1/integrations/github/callback`;

    const tokenResponse = await fetch(
      "https://github.com/login/oauth/access_token",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          client_id: process.env.CLIENT_ID_GITHUB,
          client_secret: process.env.CLIENT_SECRET_GITHUB,
          code,
          redirect_uri: redirectUri,
        }),
      },
    );

    const tokenData = await tokenResponse.json();
    const githubAccessToken = tokenData.access_token;

    // Fetch GitHub user info
    const userResponse = await fetch("https://api.github.com/user", {
      headers: {
        Authorization: `Bearer ${githubAccessToken}`,
      },
    });

    const githubUser = await userResponse.json();

    // Update user profile in database (query by userId field, not _id)
    const updatedProfile = await ProfileModel.findOneAndUpdate(
      { userId }, // Query by userId field
      {
        githubAccessToken,
        githubUsername: githubUser.login,
        githubConnected: true,
      },
      { new: true }, // Return updated document
    );

    if (!updatedProfile) {
      console.error("Profile not found for userId:", userId);
      return res.redirect(
        `${process.env.FRONTEND_URL}/dashboard/integrations?error=profile_not_found`,
      );
    }

    // console.log("✅ GitHub connected successfully for user:", userId);
    // console.log("GitHub username:", githubUser.login);

    // Redirect back to frontend
    return res.redirect(
      `${process.env.FRONTEND_URL}/dashboard/integrations?github=connected`,
    );
  } catch (error: any) {
    console.error("GitHub callback error:", error);
    return res.redirect(
      `${process.env.FRONTEND_URL}/dashboard/integrations?error=github_failed`,
    );
  }
};

// Disconnect GitHub
export const githubDisconnect = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;

    // Update user profile to remove GitHub connection
    const updatedProfile = await ProfileModel.findOneAndUpdate(
      { userId },
      {
        githubAccessToken: null,
        githubUsername: null,
        githubConnected: false,
      },
      { new: true },
    );

    if (!updatedProfile) {
      return res.status(404).json({
        success: false,
        message: "Profile not found",
      });
    }

    // console.log("✅ GitHub disconnected successfully for user:", userId);

    return res.status(200).json({
      success: true,
      message: "GitHub disconnected successfully",
    });
  } catch (error: any) {
    console.error("GitHub disconnect error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to disconnect GitHub",
      error: error.message,
    });
  }
};
