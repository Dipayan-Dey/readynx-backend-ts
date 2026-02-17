import { Router } from "express";
import authMiddleware from "../middleware/auth.middleware";
import {
  generateQuiz,
  startQuiz,
  submitQuizAnswers,
  getQuizHistory,
} from "../controllers/profile/quiz.controller";



const quizRouter = Router();


quizRouter.post("/generate", authMiddleware, generateQuiz);

quizRouter.post("/start", authMiddleware, startQuiz);


quizRouter.post("/:sessionId/submit", authMiddleware, submitQuizAnswers);


quizRouter.get("/history", authMiddleware, getQuizHistory);

export default quizRouter;
