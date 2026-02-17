import { model } from "mongoose";

import { IInterviewSession } from "../@types/interfaces/interviewSession.interface";
import InterviewSessionSchema from "./schemaDefinitions/interviewSession.schema";

const InterviewSessionModel = model<IInterviewSession>(
  "InterviewSessions",
  InterviewSessionSchema,
);

export default InterviewSessionModel;
