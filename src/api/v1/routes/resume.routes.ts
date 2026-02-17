import { Router } from "express";
import authMiddleware from "../middleware/auth.middleware";
import { uploadResume as uploadMiddleware } from "../../../config/multer";
import { validateResumeFile } from "../middleware/fileValidation.middleware";
import {
  uploadResume,
  getResume,
  deleteResume,
} from "../controllers/profile/resume.controller";



const resumeRouter = Router();


resumeRouter.post(
  "/upload",
  authMiddleware,
  uploadMiddleware,
  validateResumeFile,
  uploadResume
);


resumeRouter.get("/", authMiddleware, getResume);


resumeRouter.delete("/", authMiddleware, deleteResume);

export default resumeRouter;
