import { Types } from "mongoose";
import { IResumeAnalysis } from "./resumeAnalysis.interface";

export interface IProfile {
  _id?: Types.ObjectId;
  userId: Types.ObjectId;
  targetRole?: string;
  experienceLevel?: "beginner" | "intermediate" | "advanced";

  bio?: string;
  location?: string;
  website?: string;
  phone?: string;
  skills?: string[];
  resumeUrl?: string | null;
  resumeText?: string | null;
  resumeUploadedAt?: Date;
  resumeAnalysis?: IResumeAnalysis;
  resumeAnalyzedAt?: Date;
  githubUsername?: string | null;
  githubAccessToken?: string | null;
  githubConnected: boolean;
  linkedinId?: string | null;
  linkedinAccessToken?: string | null;
  linkedinConnected: boolean;
  profileCompleted: boolean;
  privacySettings?: {
    profileVisibility?: "public" | "private";
    showEmail?: boolean;
    showPhone?: boolean;
  };
  notificationPreferences?: {
    emailNotifications?: boolean;
    pushNotifications?: boolean;
  };
  createdAt?: Date;
  updatedAt?: Date;
}
