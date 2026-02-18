import { Router } from "express";
// import { isAuthenticated } from "../../middleware/auth.middleware";
import {
  startInterview,
  submitAnswer,
  finishInterview,
  getSessionDetails,
  getQuestionAudio,
} from "../controllers/liveInterview/liveInterview.controller";
import authMiddleware from "../middleware/auth.middleware";

const liveInterviewRoute = Router();

liveInterviewRoute.post("/start", authMiddleware, startInterview);
liveInterviewRoute.post("/answer", authMiddleware, submitAnswer);
liveInterviewRoute.post("/finish", authMiddleware, finishInterview);
liveInterviewRoute.get("/session/:id", authMiddleware, getSessionDetails);
liveInterviewRoute.get(
  "/question/:sessionId/:questionIndex/audio",
  authMiddleware,
  getQuestionAudio,
);

export default liveInterviewRoute;
