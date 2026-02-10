import {Router} from "express";
import authMiddleware from "../middleware/auth.middleware";
import { analyzeGithubRepo, getGithubRepos } from "../controllers/integrations/githubAnalysis.controller";
import { generateGithubSkills } from "../controllers/github/userskill.controller";


const githubrouter = Router();

githubrouter.get("/repos", authMiddleware, getGithubRepos);
githubrouter.post("/analyze", authMiddleware, analyzeGithubRepo);

githubrouter.post("/skills", authMiddleware, generateGithubSkills);
export default githubrouter;