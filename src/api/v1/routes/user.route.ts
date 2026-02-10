import { Router } from "express";

import authMiddleware from "../middleware/auth.middleware";
import { getMyProfile } from "../controllers/auth/users/getuser.controller";
import { updateProfile } from "../controllers/auth/users/updateprofile.controller";
import { getUserProjects, getUserSkills } from "../controllers/user/userData.controller";

const userrouter = Router();

userrouter.get("/me", authMiddleware, getMyProfile);
userrouter.put("/update", authMiddleware, updateProfile);
userrouter.get("/projects", authMiddleware, getUserProjects);
userrouter.get("/skills", authMiddleware, getUserSkills);

export default userrouter;
