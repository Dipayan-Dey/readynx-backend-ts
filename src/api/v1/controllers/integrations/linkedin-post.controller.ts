import { Request, Response } from "express";
import axios from "axios";
import ProfileModel from "../../../../models/profile.model";


export const linkedinPost = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const { text } = req.body;

    if (!text || text.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: "Post text is required",
      });
    }

 
    const profile = await ProfileModel.findOne({ userId });

    if (!profile || !profile.linkedinConnected || !profile.linkedinAccessToken) {
      return res.status(400).json({
        success: false,
        message: "LinkedIn not connected. Please connect your LinkedIn account first.",
      });
    }

 
    const userInfoResponse = await axios.get(
      "https://api.linkedin.com/v2/userinfo",
      {
        headers: {
          Authorization: `Bearer ${profile.linkedinAccessToken}`,
        },
      }
    );

    const linkedinUserId = userInfoResponse.data.sub;

 
    const postData = {
      author: `urn:li:person:${linkedinUserId}`,
      lifecycleState: "PUBLISHED",
      specificContent: {
        "com.linkedin.ugc.ShareContent": {
          shareCommentary: {
            text: text,
          },
          shareMediaCategory: "NONE",
        },
      },
      visibility: {
        "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC",
      },
    };

    const postResponse = await axios.post(
      "https://api.linkedin.com/v2/ugcPosts",
      postData,
      {
        headers: {
          Authorization: `Bearer ${profile.linkedinAccessToken}`,
          "Content-Type": "application/json",
          "X-Restli-Protocol-Version": "2.0.0",
        },
      }
    );

    console.log("✅ Posted to LinkedIn successfully for user:", userId);

    return res.status(200).json({
      success: true,
      message: "Posted to LinkedIn successfully!",
      data: {
        postId: postResponse.data.id,
      },
    });
  } catch (error: any) {
    console.error("LinkedIn post error:", error.response?.data || error.message);
    
    // Check if token expired
    if (error.response?.status === 401) {
      return res.status(401).json({
        success: false,
        message: "LinkedIn access token expired. Please reconnect your account.",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to post to LinkedIn",
      error: error.response?.data?.message || error.message,
    });
  }
};
