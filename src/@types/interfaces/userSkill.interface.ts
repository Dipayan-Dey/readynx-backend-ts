import { Types } from "mongoose";

export interface IUserSkill {
  _id?: Types.ObjectId;
  userId: Types.ObjectId;
  projectId: Types.ObjectId;
  projectName: string;

 
  technicalDepthScore: number;
  collaborationScore: number;
  consistencyScore: number;
  architectureScore: number;
  maturityScore: number;


  languageSkills: {
    skillName: string;
   level: 1 | 2 | 3 | 4 | 5;

    confidence: number; 
    weightedScore: number; 
  }[];

 
  engineeringSkills: {
    gitWorkflowLevel: 1 | 2 | 3 | 4 | 5;
    testingLevel: 1 | 2 | 3 | 4 | 5;
    ciCdLevel: 1 | 2 | 3 | 4 | 5;
    codeQualityLevel: 1 | 2 | 3 | 4 | 5;
    collaborationLevel: 1 | 2 | 3 | 4 | 5;
  };

  
  gaps: string[];
  strengths: string[];
  improvementAreas: string[];

  
  overallScore: number; 
  overallLevel: 1 | 2 | 3 | 4 | 5;
  careerReadinessIndex: number; 
  confidenceScore: number; 

  evaluatedAt: Date;
}
