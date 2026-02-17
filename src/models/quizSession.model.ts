import { model } from "mongoose";

import { IQuizSession } from "../@types/interfaces/quizSession.interface";
import QuizSessionSchema from "./schemaDefinitions/quizSession.schema";

const QuizSessionModel = model<IQuizSession>(
  "QuizSessions",
  QuizSessionSchema,
);

export default QuizSessionModel;
