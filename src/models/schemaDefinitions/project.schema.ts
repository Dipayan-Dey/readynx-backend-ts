import { Schema } from "mongoose";
// import { IProject } from "../../@types/interfaces/project.schema";
import SCHEMA_DEFINATION_PROPERTIES from "../../constants/model/model.constant";
import { GENERAL_SCHEMA_OPTIONS } from "../../constants/model/schemaOption";
import { IProject } from "../../@types/interfaces/project.interface";

const projectSchema = new Schema<IProject>(
   {
    userId: SCHEMA_DEFINATION_PROPERTIES.requiredObjectId,

    // 🔹 Basic Repo Info
    repoName: SCHEMA_DEFINATION_PROPERTIES.requiredString,
    repoFullName: SCHEMA_DEFINATION_PROPERTIES.requiredString,
    repoUrl: SCHEMA_DEFINATION_PROPERTIES.requiredString,
    description: SCHEMA_DEFINATION_PROPERTIES.optionalNullString,
    visibility: {
      type: String,
      enum: ["public", "private"],
      required: true,
    },
    license: SCHEMA_DEFINATION_PROPERTIES.optionalNullString,
    isFork: SCHEMA_DEFINATION_PROPERTIES.requiredBoolean,

    // 🔹 Popularity
    popularity: {
      stars: SCHEMA_DEFINATION_PROPERTIES.requiredNumber,
      forks: SCHEMA_DEFINATION_PROPERTIES.requiredNumber,
      watchers: SCHEMA_DEFINATION_PROPERTIES.requiredNumber,
      openIssues: SCHEMA_DEFINATION_PROPERTIES.requiredNumber,
      sizeKB: SCHEMA_DEFINATION_PROPERTIES.requiredNumber,
    },

    // 🔹 Language Stats
    languageStats: {
      primaryLanguage: SCHEMA_DEFINATION_PROPERTIES.requiredString,
      dominantLanguagePercent: SCHEMA_DEFINATION_PROPERTIES.requiredNumber,
      totalLanguagesUsed: SCHEMA_DEFINATION_PROPERTIES.requiredNumber,
      multiLanguageScore: SCHEMA_DEFINATION_PROPERTIES.requiredNumber,

      languageBreakdown: {
        type: Map,
        of: Number,
        default: {},
      },
    },

    // 🔹 Commit Stats
    commitStats: {
      totalCommits: SCHEMA_DEFINATION_PROPERTIES.requiredNumber,
      totalAdditions: SCHEMA_DEFINATION_PROPERTIES.requiredNumber,
      totalDeletions: SCHEMA_DEFINATION_PROPERTIES.requiredNumber,
      totalFilesChanged: SCHEMA_DEFINATION_PROPERTIES.requiredNumber,
      averageCommitSize: SCHEMA_DEFINATION_PROPERTIES.requiredNumber,
      firstCommitDate: SCHEMA_DEFINATION_PROPERTIES.optionalDate,
      lastCommitDate: SCHEMA_DEFINATION_PROPERTIES.optionalDate,
      commitFrequencyPerWeek: SCHEMA_DEFINATION_PROPERTIES.requiredNumber,
      activeWeeks: SCHEMA_DEFINATION_PROPERTIES.requiredNumber,
      longestInactiveGapDays: SCHEMA_DEFINATION_PROPERTIES.requiredNumber,
      consistencyScore: SCHEMA_DEFINATION_PROPERTIES.requiredNumber,
    },

    // 🔹 Collaboration
    collaborationStats: {
      totalContributors: SCHEMA_DEFINATION_PROPERTIES.requiredNumber,
      userContributionPercent: SCHEMA_DEFINATION_PROPERTIES.requiredNumber,
      totalPRs: SCHEMA_DEFINATION_PROPERTIES.requiredNumber,
      mergedPRs: SCHEMA_DEFINATION_PROPERTIES.requiredNumber,
      prMergeRate: SCHEMA_DEFINATION_PROPERTIES.requiredNumber,
      issuesOpened: SCHEMA_DEFINATION_PROPERTIES.requiredNumber,
      issuesClosed: SCHEMA_DEFINATION_PROPERTIES.requiredNumber,
      issueResolutionRate: SCHEMA_DEFINATION_PROPERTIES.requiredNumber,
    },

    // 🔹 Architecture
    architectureStats: {
      branchCount: SCHEMA_DEFINATION_PROPERTIES.requiredNumber,
      releaseCount: SCHEMA_DEFINATION_PROPERTIES.requiredNumber,
      hasReadme: SCHEMA_DEFINATION_PROPERTIES.requiredBoolean,
      readmeLength: SCHEMA_DEFINATION_PROPERTIES.optionalNullNumber,
      hasLicense: SCHEMA_DEFINATION_PROPERTIES.requiredBoolean,
      hasCI: SCHEMA_DEFINATION_PROPERTIES.requiredBoolean,
      hasTests: SCHEMA_DEFINATION_PROPERTIES.requiredBoolean,
      documentationScore: SCHEMA_DEFINATION_PROPERTIES.requiredNumber,
    },

    // 🔹 Activity & Health
    activityStats: {
      repoAgeMonths: SCHEMA_DEFINATION_PROPERTIES.requiredNumber,
      lastActivityDaysAgo: SCHEMA_DEFINATION_PROPERTIES.requiredNumber,
      activeRatio: SCHEMA_DEFINATION_PROPERTIES.requiredNumber,
      maintenanceScore: SCHEMA_DEFINATION_PROPERTIES.requiredNumber,
      developmentBurstScore: SCHEMA_DEFINATION_PROPERTIES.requiredNumber,
    },

    healthIndex: SCHEMA_DEFINATION_PROPERTIES.requiredNumber,
    maturityLevel: {
      type: Number,
      enum: [1, 2, 3, 4, 5],
      required: true,
    },

    analyzedAt: SCHEMA_DEFINATION_PROPERTIES.requiredDate,
  },
  GENERAL_SCHEMA_OPTIONS
);

export default projectSchema;
