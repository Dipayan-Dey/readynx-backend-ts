import { Schema } from "mongoose";
import SCHEMA_DEFINATION_PROPERTIES from "../../constants/model/model.constant";
import { GENERAL_SCHEMA_OPTIONS } from "../../constants/model/schemaOption";
import { IUserSkill } from "../../@types/interfaces/userSkill.interface";

const userSkillSchema = new Schema<IUserSkill>(
  {
    userId: SCHEMA_DEFINATION_PROPERTIES.requiredObjectId,
    projectId: SCHEMA_DEFINATION_PROPERTIES.requiredObjectId,
    projectName: SCHEMA_DEFINATION_PROPERTIES.requiredString,
    // 🔹 Core Scores
    technicalDepthScore: SCHEMA_DEFINATION_PROPERTIES.requiredNumber,
    collaborationScore: SCHEMA_DEFINATION_PROPERTIES.requiredNumber,
    consistencyScore: SCHEMA_DEFINATION_PROPERTIES.requiredNumber,
    architectureScore: SCHEMA_DEFINATION_PROPERTIES.requiredNumber,
    maturityScore: SCHEMA_DEFINATION_PROPERTIES.requiredNumber,

    // 🔹 Overall
    overallScore: SCHEMA_DEFINATION_PROPERTIES.requiredNumber,

    overallLevel: {
      type: Number,
      enum: [1, 2, 3, 4, 5],
      required: true,
    },

    careerReadinessIndex: SCHEMA_DEFINATION_PROPERTIES.requiredNumber,

    confidenceScore: {
      ...SCHEMA_DEFINATION_PROPERTIES.requiredNumber,
      min: 0,
      max: 1,
    },

    // 🔹 Language Skills
    languageSkills: [
      {
        skillName: SCHEMA_DEFINATION_PROPERTIES.requiredString,

        level: {
          ...SCHEMA_DEFINATION_PROPERTIES.requiredNumber,
          min: 1,
          max: 5,
        },

        confidence: {
          ...SCHEMA_DEFINATION_PROPERTIES.requiredNumber,
          min: 0,
          max: 1,
        },

        weightedScore: SCHEMA_DEFINATION_PROPERTIES.requiredNumber,
      },
    ],

    // 🔹 Engineering Skills
    engineeringSkills: {
      gitWorkflowLevel: SCHEMA_DEFINATION_PROPERTIES.requiredNumber,
      testingLevel: SCHEMA_DEFINATION_PROPERTIES.requiredNumber,
      ciCdLevel: SCHEMA_DEFINATION_PROPERTIES.requiredNumber,
      codeQualityLevel: SCHEMA_DEFINATION_PROPERTIES.requiredNumber,
      collaborationLevel: SCHEMA_DEFINATION_PROPERTIES.requiredNumber,
    },

    // 🔹 AI/Gap Layer
    gaps: {
      type: [String],
      default: [],
    },

    strengths: {
      type: [String],
      default: [],
    },

    improvementAreas: {
      type: [String],
      default: [],
    },

    evaluatedAt: SCHEMA_DEFINATION_PROPERTIES.requiredDate,
  },
  GENERAL_SCHEMA_OPTIONS,
);

export default userSkillSchema;
