import { Router } from "express";
import authMiddleware from "../middleware/auth.middleware";
import {
  validateRequest,
  validatePersonalInfoUpdate,
  validateProfileUpdate,
  validateSettingsUpdate,
} from "../../../utils/validation";
import {
  getProfile,
  updatePersonalInfo,
  updateProfile,
  updateSettings,
  disconnectLinkedIn,
  disconnectGitHub,
} from "../controllers/profile/profile.controller";


const profileRouter = Router();


profileRouter.get("/get-profile", authMiddleware, getProfile);


profileRouter.put(
  "/update-personal-info",
  authMiddleware,
  validateRequest(validatePersonalInfoUpdate),
  updatePersonalInfo
);


profileRouter.put(
  "/update-full-info",
  authMiddleware,
  validateRequest(validateProfileUpdate),
  updateProfile
);

  
profileRouter.put(
  "/update-settings",
  authMiddleware,
  validateRequest(validateSettingsUpdate),
  updateSettings
);



export default profileRouter;
