import { Schema } from "mongoose";
import { IQuizSession } from "../../@types/interfaces/quizSession.interface";
import SCHEMA_DEFINATION_PROPERTIES from "../../constants/model/model.constant";
import { GENERAL_SCHEMA_OPTIONS } from "../../constants/model/schemaOption";

const QuizSessionSchema = new Schema<IQuizSession>(
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
          options: {
            type: [String],
            required: true,
            validate: {
              validator: (v: string[]) => v.length > 0,
              message: "At least one option is required",
            },
          },
          correctAnswer: {
            type: String,
            required: true,
            trim: true,
          },
          userAnswer: {
            type: String,
            required: false,
            trim: true,
          },
          isCorrect: {
            type: Boolean,
            required: false,
          },
        },
      ],
      required: true,
      default: [],
    },
    score: {
      type: Number,
      required: false,
      min: 0,
      max: 100,
    },
    totalQuestions: {
      type: Number,
      required: true,
      min: 0,
    },
    correctAnswers: {
      type: Number,
      required: false,
      min: 0,
    },
    status: {
      type: String,
      required: true,
      enum: ["in_progress", "completed"],
      default: "in_progress",
    },
    startedAt: SCHEMA_DEFINATION_PROPERTIES.requiredDate,
    completedAt: SCHEMA_DEFINATION_PROPERTIES.optionalDate,
  },
  GENERAL_SCHEMA_OPTIONS,
);

export default QuizSessionSchema;
