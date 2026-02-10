import { Types } from "mongoose";

export interface IProject {
  _id?: Types.ObjectId;
  userId: Types.ObjectId;
  repoName: string;
  repoUrl: string;
  primaryLanguage: string;
  totalCommits: number;
  lastCommitDate: Date | null;
  analyzedAt: Date;
}