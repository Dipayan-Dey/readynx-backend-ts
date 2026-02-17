import { Schema } from "mongoose";
import { IInterviewSession } from "../../@types/interfaces/interviewSession.interface";
import SCHEMA_DEFINATION_PROPERTIES from "../../constants/model/model.constant";
import { GENERAL_SCHEMA_OPTIONS } from "../../constants/model/schemaOption";

const InterviewSessionSchema = new Schema<IInterviewSession>(
  {
    userId: SCHEMA_DEFINATION_PROPERTIES.requiredObjectId,
    questions: {
      type: [
        {
          question: {
            type: String,
            required: true,
            trim: true,
          },
          userAnswer: {
            type: String,
            required: false,
            trim: true,
          },
          aiFeedback: {
            type: String,
            required: false,
            trim: true,
          },
          score: {
            type: Number,
            required: false,
            min: 0,
            max: 100,
          },
        },
      ],
      required: true,
      default: [],
    },
    performanceMetrics: {
      type: {
        averageScore: {
          type: Number,
          required: true,
          min: 0,
          max: 100,
        },
        totalQuestions: {
          type: Number,
          required: true,
          min: 0,
        },
        answeredQuestions: {
          type: Number,
          required: true,
          min: 0,
        },
        completionRate: {
          type: Number,
          required: true,
          min: 0,
          max: 100,
        },
      },
      required: false,
      default: undefined,
    },
    status: {
      type: String,
      required: true,
      enum: ["in_progress", "completed", "abandoned"],
      default: "in_progress",
    },
    startedAt: SCHEMA_DEFINATION_PROPERTIES.requiredDate,
    completedAt: SCHEMA_DEFINATION_PROPERTIES.optionalDate,
  },
  GENERAL_SCHEMA_OPTIONS,
);

export default InterviewSessionSchema;
