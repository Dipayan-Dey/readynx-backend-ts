import { Types } from "mongoose";

export interface IQuizQuestion {
  question: string;
  options: string[];
  correctAnswer: string;
  userAnswer?: string;
  isCorrect?: boolean;
}

export interface IQuizSession {
  _id?: Types.ObjectId;
  userId: Types.ObjectId;
  questions: IQuizQuestion[];
  score?: number;
  totalQuestions: number;
  correctAnswers?: number;
  status: "in_progress" | "completed";
  startedAt: Date;
  completedAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}
