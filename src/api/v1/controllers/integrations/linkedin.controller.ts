import { Request, Response } from "express";
import axios from "axios";
import ProfileModel from "../../../../models/profile.model";
// const jwt = require('jsonwebtoken');
import { verifyToken } from "../../../../utils/token.utils";

export const linkedinRedirect = async (req: Request, res: Response) => {
  try {
    const { token } = req.query;
    
    if (!token) {
      return res.status(401).json({ success: false, message: "Authentication token required" });
    }
    
    // Verify the token
    const decoded = verifyToken(token as string);
    
    // Store token in state to retrieve in callback
    const redirectUri = `${process.env.BACKEND_URL || 'http://localhost:5000'}/api/v1/integrations/linkedin/callback`;
    
    // SCOPES: 'openid' is required for the new OIDC flow
    const linkedinAuthUrl =
      `https://www.linkedin.com/oauth/v2/authorization` +
      `?response_type=code` +
      `&client_id=${process.env.LINKEDIN_CLIENT_ID}` +
      `&redirect_uri=${encodeURIComponent(redirectUri)}` +
      `&scope=openid profile email w_member_social` + 
      `&state=${token}`;

    return res.redirect(linkedinAuthUrl);
  } catch (error) {
    console.error("LinkedIn Redirect Error:", error);
    return res.status(500).json({ success: false, message: "LinkedIn redirect failed" });
  }
};


export const linkedinCallback = async (req: Request, res: Response) => {
  try {
    const { code, state, error } = req.query;

    if (error) {
        return res.redirect(`${process.env.FRONTEND_URL}/dashboard/integrations?error=linkedin_denied`);
    }

    const token = state as string; 
    
    if (!token) {
      return res.redirect(`${process.env.FRONTEND_URL}/dashboard/integrations?error=no_token`);
    }

    // Verify token
    const decoded = verifyToken(token as string);
    const userId = (decoded as any).userId;

    const redirectUri = `${process.env.BACKEND_URL || 'http://localhost:5000'}/api/v1/integrations/linkedin/callback`;
    
    // Exchange code for access token
    const tokenResponse = await axios.post(
      "https://www.linkedin.com/oauth/v2/accessToken",
      null,
      {
        params: {
          grant_type: "authorization_code",
          code,
          redirect_uri: redirectUri,
          client_id: process.env.LINKEDIN_CLIENT_ID,
          client_secret: process.env.LINKEDIN_CLIENT_SECRET,
        },
        headers: { "Content-Type": "application/x-www-form-urlencoded" }
      }
    );

    const accessToken = tokenResponse.data.access_token;

    // FIX: Use 'userinfo' endpoint for 'openid' scope
    const userInfoResponse = await axios.get("https://api.linkedin.com/v2/userinfo", {
        headers: { Authorization: `Bearer ${accessToken}` },
    });

    const userInfo = userInfoResponse.data;
    // For 'openid', the ID is in 'sub'
    const linkedinId = userInfo.sub; 

    // Update user profile in database
    const updatedProfile = await ProfileModel.findOneAndUpdate(
      { userId }, 
      {
        linkedinConnected: true,
        linkedinAccessToken: accessToken,
        linkedinId: linkedinId, 
        linkedinName: userInfo.name, // OpenID provides 'name'
        linkedinAvatar: userInfo.picture // OpenID provides 'picture'
      },
      { new: true } 
    );

    if (!updatedProfile) {
      return res.redirect(`${process.env.FRONTEND_URL}/dashboard/integrations?error=profile_not_found`);
    }

    // Redirect back to integrations page
    return res.redirect(`${process.env.FRONTEND_URL}/dashboard/integrations?linkedin=connected`);

  } catch (error: any) {
    console.error("LinkedIn Callback Error:", error.response?.data || error.message);
    return res.redirect(`${process.env.FRONTEND_URL}/dashboard/integrations?error=linkedin_callback_failed`);
  }
};


export const linkedinPost = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const { text } = req.body;

    if (!text) return res.status(400).json({ success: false, message: "Text required" });

    const profile = await ProfileModel.findOne({ userId });

    if (!profile || !profile.linkedinConnected || !profile.linkedinAccessToken) {
      return res.status(401).json({ success: false, message: "LinkedIn not connected" });
    }

    const postBody = {
      author: `urn:li:person:${profile.linkedinId}`,
      lifecycleState: "PUBLISHED",
      specificContent: {
        "com.linkedin.ugc.ShareContent": {
          shareCommentary: { text: text },
          shareMediaCategory: "NONE",
        },
      },
      visibility: { "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC" },
    };

    const response = await axios.post("https://api.linkedin.com/v2/ugcPosts", postBody, {
      headers: {
        Authorization: `Bearer ${profile.linkedinAccessToken}`,
        "X-Restli-Protocol-Version": "2.0.0",
      },
    });

    return res.status(200).json({ success: true, message: "Posted successfully", data: response.data });

  } catch (error: any) {
    console.error("LinkedIn Post Error:", error.response?.data || error.message);
    return res.status(500).json({ success: false, message: "Failed to post", error: error.message });
  }
};

export const linkedinDisconnect = async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user.userId;
  
      await ProfileModel.findOneAndUpdate(
        { userId },
        {
          linkedinConnected: false,
          linkedinId: null,
          linkedinAccessToken: null,
          linkedinName: null,
          linkedinAvatar: null
        }
      );
  
      return res.status(200).json({ success: true, message: "Disconnected" });
    } catch (error) {
      return res.status(500).json({ success: false, message: "Disconnect failed" });
    }
  };

