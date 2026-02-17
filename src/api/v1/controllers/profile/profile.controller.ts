import { Request, Response } from "express";
import { Types } from "mongoose";
import profileService from "../../../../services/profile.service";


export const getProfile = async (req: Request, res: Response) => {
  try {
    const userId = new Types.ObjectId((req as any).user.userId);

  
    const completeProfile = await profileService.getCompleteProfile(userId);

    return res.status(200).json({
      success: true,
      data: completeProfile,
    });
  } catch (error: any) {
    console.error("Error fetching profile:", error);

    if (error.message.includes("not found")) {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to fetch profile",
      error: error.message,
    });
  }
};


export const updatePersonalInfo = async (req: Request, res: Response) => {
  try {
    const userId = new Types.ObjectId((req as any).user.userId);
    const { name, email } = req.body;


    if (!name && !email) {
      return res.status(400).json({
        success: false,
        message: "At least one field (name or email) must be provided",
      });
    }

 
    const updatedUser = await profileService.updatePersonalInfo(userId, {
      name,
      email,
    });

    return res.status(200).json({
      success: true,
      message: "Personal information updated successfully",
      data: updatedUser,
    });
  } catch (error: any) {
    console.error("Error updating personal info:", error);

   
    if (error.message.includes("Email is already in use")) {
      return res.status(409).json({
        success: false,
        message: error.message,
      });
    }

    if (error.message.includes("not found")) {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to update personal information",
      error: error.message,
    });
  }
};


export const updateProfile = async (req: Request, res: Response) => {
  try {
    const userId = new Types.ObjectId((req as any).user.userId);
    const { targetRole, experienceLevel, bio, location, website, skills } = req.body;

    // Check if at least one field is provided
    if (!targetRole && !experienceLevel && !bio && !location && !website && !skills) {
      return res.status(400).json({
        success: false,
        message: "At least one field must be provided",
      });
    }

    // Update profile
    const updateData: any = {};
    if (targetRole !== undefined) updateData.targetRole = targetRole;
    if (experienceLevel !== undefined) updateData.experienceLevel = experienceLevel;
    if (bio !== undefined) updateData.bio = bio;
    if (location !== undefined) updateData.location = location;
    if (website !== undefined) updateData.website = website;
    if (skills !== undefined) updateData.skills = skills;

    await profileService.updateProfileFields(userId, updateData);

    // Fetch full updated profile
    const completeProfile = await profileService.getCompleteProfile(userId);

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: completeProfile,
    });

  } catch (error: any) {
    console.error("Error updating profile:", error);

    if (error.message.includes("Invalid experience level")) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to update profile",
      error: error.message,
    });
  }
};


export const updateSettings = async (req: Request, res: Response) => {
  try {
    const userId = new Types.ObjectId((req as any).user.userId);
    const { targetRole, experienceLevel, privacySettings, notificationPreferences } =
      req.body;

    if (
      !targetRole &&
      !experienceLevel &&
      !privacySettings &&
      !notificationPreferences
    ) {
      return res.status(400).json({
        success: false,
        message: "At least one setting field must be provided",
      });
    }

await profileService.updateSettings(userId, {
  targetRole,
  experienceLevel,
  privacySettings,
  notificationPreferences,
});

const completeProfile = await profileService.getCompleteProfile(userId);

return res.status(200).json({
  success: true,
  message: "Settings updated successfully",
  data: completeProfile,
});

  } catch (error: any) {
    console.error("Error updating settings:", error);

 
    if (error.message.includes("Invalid experience level")) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to update settings",
      error: error.message,
    });
  }
};


export const disconnectLinkedIn = async (req: Request, res: Response) => {
  try {
    const userId = new Types.ObjectId((req as any).user.userId);

    // Disconnect LinkedIn
    await profileService.disconnectLinkedIn(userId);

    return res.status(200).json({
      success: true,
      message: "LinkedIn account disconnected successfully",
    });
  } catch (error: any) {
    console.error("Error disconnecting LinkedIn:", error);

    // Handle specific errors
    if (error.message.includes("not found")) {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to disconnect LinkedIn account",
      error: error.message,
    });
  }
};


export const disconnectGitHub = async (req: Request, res: Response) => {
  try {
    const userId = new Types.ObjectId((req as any).user.userId);

    // Disconnect GitHub
    await profileService.disconnectGitHub(userId);

    return res.status(200).json({
      success: true,
      message: "GitHub account disconnected successfully",
    });
  } catch (error: any) {
    console.error("Error disconnecting GitHub:", error);

    // Handle specific errors
    if (error.message.includes("not found")) {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to disconnect GitHub account",
      error: error.message,
    });
  }
};
