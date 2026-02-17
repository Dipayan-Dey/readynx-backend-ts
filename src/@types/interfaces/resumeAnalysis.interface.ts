export interface IResumeAnalysis {
  atsScore: number;
  suggestions: string[];
  skills: string[];
  experienceSummary: string;
  strengths: string[];
  weaknesses: string[];
  analyzedAt: Date;
}

export interface IProfileWithAnalysis {
  resumeAnalysis?: IResumeAnalysis;
  resumeUploadedAt?: Date;
  resumeAnalyzedAt?: Date;
}
