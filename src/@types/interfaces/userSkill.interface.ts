import { Types } from "mongoose";

export interface IUserSkill {
  _id?: Types.ObjectId;
  userId: Types.ObjectId;
  skillName: string;
  level: number; // 1–5
  source?: "github" | "resume" | "interview";
  confidence: number; // 0–1
  lastUpdated: Date;
}
