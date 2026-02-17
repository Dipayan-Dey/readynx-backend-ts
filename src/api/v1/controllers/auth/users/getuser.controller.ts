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

    if (!profile) {
      return res.status(404).json({ message: "Profile not found" });
    }

    const combinedResult = {
      ...profile.toObject(),
      user: user ,
    };

    res.status(200).json({
      message: "Profile fetched successfully",
      data: user,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch profile",
      error: String(error),
    });
  }
};


