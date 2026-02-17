import { Router } from "express";
import authMiddleware from "../middleware/auth.middleware";
import {
  startInterview,
  submitAnswer,
  completeInterview,
  getInterviewHistory,
  deleteInterview,
} from "../controllers/profile/interview.controller";

const interviewRouter = Router();

interviewRouter.post("/start", authMiddleware, startInterview);

interviewRouter.post("/:sessionId/answer", authMiddleware, submitAnswer);

interviewRouter.post("/:sessionId/complete", authMiddleware, completeInterview);

interviewRouter.get("/history", authMiddleware, getInterviewHistory);

interviewRouter.delete("/:sessionId", authMiddleware, deleteInterview);

export default interviewRouter;
