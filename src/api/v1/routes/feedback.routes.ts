import { Router } from "express";
import {
  submitFeedback,
  getAllFeedback,
  getAllUsersWithData,
  getUserDataById,
} from "../controllers/feedback/feedback.controller";
import authMiddleware from "../middleware/auth.middleware";

const router = Router();

router.post("/submit", authMiddleware, submitFeedback);
router.get("/all", getAllFeedback);
router.get("/users", getAllUsersWithData);
router.get("/users/:userId", getUserDataById);

export default router;
