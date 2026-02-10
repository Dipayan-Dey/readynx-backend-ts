import { Types } from "mongoose";

export interface IProfile {
  _id?: Types.ObjectId;
  userId: Types.ObjectId;
  targetRole?: string;
  experienceLevel?: "beginner" | "intermediate" | "advanced";
  resumeUrl?: string | null;
  resumeText?: string | null;
  githubUsername?: string | null;
  githubAccessToken?: string | null;
  githubConnected: boolean;
  linkedinId?: string | null;
  linkedinAccessToken?: string | null;
  linkedinConnected: boolean;
  profileCompleted: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}
