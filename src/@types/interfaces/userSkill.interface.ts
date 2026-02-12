import { Types } from "mongoose";

export interface IUserSkill {
  _id?: Types.ObjectId;
  userId: Types.ObjectId;
  projectId: Types.ObjectId;
  projectName: string;

  // 🔹 Core Skill Scores (0–100)
  technicalDepthScore: number;
  collaborationScore: number;
  consistencyScore: number;
  architectureScore: number;
  maturityScore: number;

  // 🔹 Language-Based Skill Levels
  languageSkills: {
    skillName: string;
   level: 1 | 2 | 3 | 4 | 5;

    confidence: number; // 0–1
    weightedScore: number; // 0–100
  }[];

  // 🔹 Derived Engineering Skills
  engineeringSkills: {
    gitWorkflowLevel: 1 | 2 | 3 | 4 | 5;
    testingLevel: 1 | 2 | 3 | 4 | 5;
    ciCdLevel: 1 | 2 | 3 | 4 | 5;
    codeQualityLevel: 1 | 2 | 3 | 4 | 5;
    collaborationLevel: 1 | 2 | 3 | 4 | 5;
  };

  // 🔹 Gap Detection
  gaps: string[];
  strengths: string[];
  improvementAreas: string[];

  // 🔹 Overall Results
  overallScore: number; // 0–100
  overallLevel: 1 | 2 | 3 | 4 | 5;
  careerReadinessIndex: number; // 0–100
  confidenceScore: number; // final confidence

  evaluatedAt: Date;
}
