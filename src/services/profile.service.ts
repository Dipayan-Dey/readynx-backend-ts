import { Types } from "mongoose";
import UserModel from "../models/user.model";
import ProfileModel from "../models/profile.model";
import InterviewSessionModel from "../models/interviewSession.model";
import QuizSessionModel from "../models/quizSession.model";
import ProjectModel from "../models/project.model";
import { IUser } from "../@types/interfaces/user.interface";
import { IProfile } from "../@types/interfaces/profile.interfaces";
import {
  IUpdatePersonalInfoRequest,
  IUpdateProfileRequest,
  IUpdateSettingsRequest,
} from "../@types/interfaces/services.interface";

export interface ICompleteProfile {
  user: IUser;
  profile: IProfile;
  githubProjects?: any[];
  interviewHistory?: any[];
  quizHistory?: any[];
  stats?: {
    totalInterviews: number;
    totalQuizzes: number;
    averageInterviewScore: number;
    averageQuizScore: number;
  };
}

export class ProfileService {
  async getCompleteProfile(userId: Types.ObjectId): Promise<any> {
    try {
      // Get user data
      const user = await UserModel.findById(userId).select("-password").lean();

      if (!user) {
        throw new Error("User not found");
      }

      // Get profile data
      const profile = (await ProfileModel.findOne({ userId }).lean()) as any;

      if (!profile) {
        throw new Error("Profile not found");
      }

      // Get interview statistics
      const interviews = await InterviewSessionModel.find({ userId }).lean();
      const completedInterviews = interviews.filter(
        (i) => i.status === "completed",
      );
      const interviewCount = completedInterviews.length;
      const averageInterviewScore =
        interviewCount > 0
          ? completedInterviews.reduce(
              (sum, i) => sum + (i.performanceMetrics?.averageScore || 0),
              0,
            ) / interviewCount
          : 0;

      // Get quiz statistics
      const quizzes = await QuizSessionModel.find({ userId }).lean();
      const completedQuizzes = quizzes.filter((q) => q.status === "completed");
      const quizCount = completedQuizzes.length;
      const averageQuizScore =
        quizCount > 0
          ? completedQuizzes.reduce((sum, q) => sum + (q.score || 0), 0) /
            quizCount
          : 0;

      // Build complete profile response
      return {
        user: {
          name: user.name,
          email: user.email,
          avatar: user.avatar,
        },
        profile: {
          bio: profile.bio || "",
          location: profile.location || "",
          website: profile.website || "",
          phone: profile.phone || "",
          targetRole: profile.targetRole || "",
          experienceLevel: profile.experienceLevel || "",
          skills: profile.skills || [],
          privacySettings: {
            profileVisibility:
              profile.privacySettings?.profileVisibility || "public",
            showEmail: profile.privacySettings?.showEmail ?? true,
            showPhone: profile.privacySettings?.showPhone ?? false,
          },
          notificationPreferences: {
            emailNotifications:
              profile.notificationPreferences?.emailNotifications ?? true,
            pushNotifications:
              profile.notificationPreferences?.pushNotifications ?? false,
          },
        },
        resume: profile.resumeUrl
          ? {
              resumeUrl: profile.resumeUrl,
              hasResumeText: !!profile.resumeText,
              uploadedAt: profile.resumeUploadedAt,
            }
          : null,
        resumeAnalysis: profile.resumeAnalysis
          ? {
              atsScore: profile.resumeAnalysis.atsScore,
              suggestions: profile.resumeAnalysis.suggestions || [],
              skills: profile.resumeAnalysis.skills || [],
              experienceSummary: profile.resumeAnalysis.experienceSummary || "",
              strengths: profile.resumeAnalysis.strengths || [],
              weaknesses: profile.resumeAnalysis.weaknesses || [],
              analyzedAt: profile.resumeAnalysis.analyzedAt,
            }
          : null,
        connections: {
          linkedinConnected: profile.linkedinConnected || false,
          linkedinId: profile.linkedinId || null,
          githubConnected: profile.githubConnected || false,
          githubUsername: profile.githubUsername || null,
        },
        stats: {
          interviewCount,
          quizCount,
          averageInterviewScore: Math.round(averageInterviewScore * 10) / 10,
          averageQuizScore: Math.round(averageQuizScore * 10) / 10,
        },
      };
    } catch (error: any) {
      throw new Error(`Failed to get complete profile: ${error.message}`);
    }
  }

  async updatePersonalInfo(
    userId: Types.ObjectId,
    updates: IUpdatePersonalInfoRequest,
  ): Promise<IUser> {
    try {
      const updateData: Partial<IUser> = {};

      if (updates.name !== undefined) {
        updateData.name = updates.name;
      }

      if (updates.email !== undefined) {
        const existingUser = await UserModel.findOne({
          email: updates.email,
          _id: { $ne: userId },
        });

        if (existingUser) {
          throw new Error("Email is already in use");
        }

        updateData.email = updates.email;

        updateData.isEmailVerified = false;
      }

      const user = await UserModel.findByIdAndUpdate(
        userId,
        { $set: updateData },
        { new: true, runValidators: true },
      ).select("-password");

      if (!user) {
        throw new Error("User not found");
      }

      return user;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to update personal info: ${error.message}`);
      }
      throw new Error("Failed to update personal info: Unknown error");
    }
  }

  async updateProfileFields(
    userId: Types.ObjectId,
    updates: any,
  ): Promise<IProfile> {
    try {
      const updateData: any = {};

      if (updates.targetRole !== undefined)
        updateData.targetRole = updates.targetRole;

      if (updates.experienceLevel !== undefined) {
        const validLevels = ["beginner", "intermediate", "advanced"];
        if (!validLevels.includes(updates.experienceLevel)) {
          throw new Error("Invalid experience level");
        }
        updateData.experienceLevel = updates.experienceLevel;
      }

      if (updates.bio !== undefined) updateData.bio = updates.bio;

      if (updates.location !== undefined)
        updateData.location = updates.location;

      if (updates.website !== undefined) updateData.website = updates.website;

      if (updates.skills !== undefined) updateData.skills = updates.skills;

      const profile = await ProfileModel.findOneAndUpdate(
        { userId },
        { $set: updateData },
        { new: true, upsert: true, runValidators: true },
      );

      if (!profile) throw new Error("Profile not found");

      return profile;
    } catch (error: any) {
      throw new Error(`Failed to update profile: ${error.message}`);
    }
  }

  async updateSettings(
    userId: Types.ObjectId,
    updates: IUpdateSettingsRequest,
  ): Promise<IProfile> {
    try {
      const updateData: any = {};

      if (updates.targetRole !== undefined)
        updateData.targetRole = updates.targetRole;

      if (updates.experienceLevel !== undefined) {
        const validLevels = ["beginner", "intermediate", "advanced"];
        if (!validLevels.includes(updates.experienceLevel)) {
          throw new Error("Invalid experience level");
        }
        updateData.experienceLevel = updates.experienceLevel;
      }

      if (updates.privacySettings) {
        for (const key in updates.privacySettings) {
          updateData[`privacySettings.${key}`] = updates.privacySettings[key];
        }
      }

      if (updates.notificationPreferences) {
        for (const key in updates.notificationPreferences) {
          updateData[`notificationPreferences.${key}`] =
            updates.notificationPreferences[key];
        }
      }

      const profile = await ProfileModel.findOneAndUpdate(
        { userId },
        { $set: updateData },
        { new: true, runValidators: true },
      );

      if (!profile) throw new Error("Profile not found");

      return profile;
    } catch (error: any) {
      throw new Error(`Failed to update settings: ${error.message}`);
    }
  }

  async disconnectLinkedIn(userId: Types.ObjectId): Promise<IProfile> {
    try {
      const profile = await ProfileModel.findOneAndUpdate(
        { userId },
        {
          $set: {
            linkedinConnected: false,
            linkedinId: null,
            linkedinAccessToken: null,
          },
        },
        { new: true },
      );

      if (!profile) {
        throw new Error("Profile not found");
      }

      return profile;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to disconnect LinkedIn: ${error.message}`);
      }
      throw new Error("Failed to disconnect LinkedIn: Unknown error");
    }
  }

  async disconnectGitHub(userId: Types.ObjectId): Promise<IProfile> {
    try {
      const profile = await ProfileModel.findOneAndUpdate(
        { userId },
        {
          $set: {
            githubConnected: false,
            githubUsername: null,
            githubAccessToken: null,
          },
        },
        { new: true },
      );

      if (!profile) {
        throw new Error("Profile not found");
      }

      return profile;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to disconnect GitHub: ${error.message}`);
      }
      throw new Error("Failed to disconnect GitHub: Unknown error");
    }
  }
}

export default new ProfileService();
