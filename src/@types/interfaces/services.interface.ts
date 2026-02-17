import { IResumeAnalysis } from "./resumeAnalysis.interface";
import {
  IInterviewQuestion,
  IPerformanceMetrics,
} from "./interviewSession.interface";
import { IQuizQuestion } from "./quizSession.interface";

// Cloudinary Service Types
export interface ICloudinaryUploadResult {
  url: string;
  publicId: string;
  format: string;
  resourceType: string;
}

// Resume Service Types
export interface IResumeUploadResult {
  resumeUrl: string;
  resumeText: string;
}

// Groq API Service Types
export interface IGeminiAnalysisResponse {
  atsScore: number;
  suggestions: string[];
  skills: string[];
  experienceSummary: string;
  strengths: string[];
  weaknesses: string[];
}

export interface IGeminiInterviewQuestionsResponse {
  questions: string[];
}

export interface IGeminiAnswerEvaluationResponse {
  feedback: string;
  score: number;
}

export interface IGeminiQuizResponse {
  questions: IQuizQuestion[];
}

// Interview Service Types
export interface IStartInterviewRequest {
  targetRole?: string;
  experienceLevel?: string;
}

export interface ISubmitAnswerRequest {
  questionIndex: number;
  answer: string;
}

export interface IInterviewSessionResponse {
  sessionId: string;
  questions: IInterviewQuestion[];
  status: string;
  performanceMetrics?: IPerformanceMetrics;
}

// Quiz Service Types
export interface IGenerateQuizRequest {
  skills?: string[];
  targetRole?: string;
  questionCount?: number;
}

export interface ISubmitQuizRequest {
  answers: { questionIndex: number; answer: string }[];
}

export interface IQuizSessionResponse {
  sessionId: string;
  questions: IQuizQuestion[];
  score?: number;
  totalQuestions: number;
  correctAnswers?: number;
  status: string;
}

// Profile Service Types
export interface IUpdatePersonalInfoRequest {
  name?: string;
  email?: string;
}

export interface IUpdateProfileRequest {
  targetRole?: string;
  experienceLevel?: "beginner" | "intermediate" | "advanced";
  bio?: string;
  location?: string;
  website?: string;
  phone?: string;
  skills?: string[];
}

export interface IUpdateSettingsRequest {
  targetRole?: string;
  experienceLevel?: "beginner" | "intermediate" | "advanced";
  privacySettings?: {
    profileVisibility?: "public" | "private";
    showEmail?: boolean;
    showPhone?: boolean;
  };
  notificationPreferences?: {
    emailNotifications?: boolean;
    pushNotifications?: boolean;
  };
}
