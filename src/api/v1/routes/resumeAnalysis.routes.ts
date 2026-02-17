import { Router } from "express";
import authMiddleware from "../middleware/auth.middleware";
import {
  analyzeResume,
  getAnalysisResults,
} from "../controllers/profile/resumeAnalysis.controller";



const resumeAnalysisRouter = Router();


resumeAnalysisRouter.post("/analyze", authMiddleware, analyzeResume);


resumeAnalysisRouter.get("/analysis", authMiddleware, getAnalysisResults);

export default resumeAnalysisRouter;
