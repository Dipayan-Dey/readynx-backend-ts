import { Types } from "mongoose";

export interface IInterviewQuestion {
  question: string;
  userAnswer?: string;
  aiFeedback?: string;
  score?: number;
}

export interface IPerformanceMetrics {
  averageScore: number;
  totalQuestions: number;
  answeredQuestions: number;
  completionRate: number;
}

export interface IInterviewSession {
  _id?: Types.ObjectId;
  userId: Types.ObjectId;
  questions: IInterviewQuestion[];
  performanceMetrics?: IPerformanceMetrics;
  status: "in_progress" | "completed" | "abandoned";
  startedAt: Date;
  completedAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}
