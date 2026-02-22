import { model } from "mongoose";
import { feedbackSchema } from "./schemaDefinitions/feedback.schema";
import { IFeedback } from "../@types/interfaces/feedback.interface";

export const Feedback = model<IFeedback>("Feedback", feedbackSchema);
