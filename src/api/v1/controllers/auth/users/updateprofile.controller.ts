import { Request, Response } from "express";
import ProfileModel from "../../../../../models/profile.model";

export const updateProfile = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;

    const {
      targetRole,
      experienceLevel,
      githubUsername,
      linkedinId,
    } = req.body;

    const profile = await ProfileModel.findOne({ userId });

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: "Profile not found",
      });
    }

 
    if (targetRole !== undefined) profile.targetRole = targetRole;
    if (experienceLevel !== undefined)
      profile.experienceLevel = experienceLevel;

    if (githubUsername !== undefined)
      profile.githubUsername = githubUsername;

    if (linkedinId !== undefined) profile.linkedinId = linkedinId;


    profile.profileCompleted = Boolean(
      profile.targetRole && profile.experienceLevel
    );

    await profile.save();

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: profile,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: "Failed to update profile",
      error: error.message,
    });
  }
};
