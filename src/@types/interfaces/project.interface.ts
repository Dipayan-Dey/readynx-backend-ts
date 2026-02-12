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

  // 🔹 Popularity Metrics
  popularity: {
    stars: number;
    forks: number;
    watchers: number;
    openIssues: number;
    sizeKB: number;
  };

  // 🔹 Language Intelligence
  languageStats: {
    primaryLanguage: string;
    languageBreakdown: Record<string, number>; // { JS: 12000, TS: 8000 }
    dominantLanguagePercent: number;
    totalLanguagesUsed: number;
    multiLanguageScore: number; // 0–100
  };

  // 🔹 Commit Intelligence
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

  // 🔹 Collaboration Signals
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

  // 🔹 Architecture & Professional Signals
  architectureStats: {
    branchCount: number;
    releaseCount: number;
    hasReadme: boolean;
    readmeLength?: number;
    hasLicense: boolean;
    hasCI: boolean; // detect .github/workflows
    hasTests: boolean;
    documentationScore: number; // 0–100
  };

  // 🔹 Activity & Health
  activityStats: {
    repoAgeMonths: number;
    lastActivityDaysAgo: number;
    activeRatio: number; // activeWeeks / repoAgeWeeks
    maintenanceScore: number; // 0–100
    developmentBurstScore: number; // detect irregular bursts
  };

  // 🔹 Final Deterministic Metrics
  healthIndex: number; // 0–100
  maturityLevel: 1 | 2 | 3 | 4 | 5;

  analyzedAt: Date;
}
