import { Request, Response } from "express";
import ProfileModel from "../../../../../models/profile.model";
import UserModel from "../../../../../models/user.model";

interface AuthRequest extends Request {
  user?: {
    userId: string;
  };
}

export const getMyProfile = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const profile = await ProfileModel.findOne({ userId });
    const user = await UserModel.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!profile) {
      return res.status(404).json({ message: "Profile not found" });
    }

    const responseData = {
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        isEmailVerified: user.isEmailVerified,
      },
      profile: {
        targetRole: profile.targetRole,
        experienceLevel: profile.experienceLevel,
        bio: profile.bio,
        location: profile.location,
        website: profile.website,
        phone: profile.phone,
        skills: profile.skills,
        resumeUrl: profile.resumeUrl,
        profileCompleted: profile.profileCompleted,
      },
      connections: {
        github: {
          connected: profile.githubConnected,
          username: profile.githubUsername || null,
        },
        linkedin: {
          connected: profile.linkedinConnected,
          linkedinId: profile.linkedinId || null,
        },
      },
    };

    res.status(200).json({
      message: "Profile fetched successfully",
      data: responseData,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch profile",
      error: String(error),
    });
  }
};
