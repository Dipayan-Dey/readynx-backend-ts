import { Types } from "mongoose";

export interface IProject {
  _id?: Types.ObjectId;
  userId: Types.ObjectId;

  // 🔹 Basic Repo Info
  repoName: string;
  repoFullName: string;
  repoUrl: string;
  description?: string;
  visibility: "public" | "private";
  topics: string[];
  license?: string;
  isFork: boolean;

 
  popularity: {
    stars: number;
    forks: number;
    watchers: number;
    openIssues: number;
    sizeKB: number;
  };

  
  languageStats: {
    primaryLanguage: string;
    languageBreakdown: Record<string, number>; 
    languagePercentage: Record<string, number>; 
    dominantLanguagePercent: number;
    totalLanguagesUsed: number;
    multiLanguageScore: number; 
  };


  commitStats: {
    totalCommits: number;
    totalAdditions: number;
    totalDeletions: number;
    totalFilesChanged: number;
    averageCommitSize: number;
    firstCommitDate?: Date;
    lastCommitDate?: Date;
    commitFrequencyPerWeek: number;
    activeWeeks: number;
    longestInactiveGapDays: number;
    consistencyScore: number; // 0–100
  };

  
  collaborationStats: {
    totalContributors: number;
    userContributionPercent: number;
    totalPRs: number;
    mergedPRs: number;
    prMergeRate: number; // %
    issuesOpened: number;
    issuesClosed: number;
    issueResolutionRate: number; // %
  };

  
  architectureStats: {
    branchCount: number;
    releaseCount: number;
    hasReadme: boolean;
    readmeLength?: number;
    hasLicense: boolean;
    hasCI: boolean; 
    hasTests: boolean;
    documentationScore: number; 
  };

  
  activityStats: {
    repoAgeMonths: number;
    lastActivityDaysAgo: number;
    activeRatio: number; 
    maintenanceScore: number; 
    developmentBurstScore: number; 
  };

 
  healthIndex: number; 
  maturityLevel: 1 | 2 | 3 | 4 | 5;

  analyzedAt: Date;
}
