import { Router } from "express";
import authMiddleware from "../middleware/auth.middleware";
import {
  analyzeGithubRepo,
  getAllGithubRepos,
} from "../controllers/github/githubAnalysis.controller";
import { evaluateGithubRepoSkill } from "../controllers/github/githubSkill.controller";
// import { generateGithubSkills } from "../controllers/github/userskill.controller";

const githubrouter = Router();

githubrouter.get("/repos", authMiddleware, getAllGithubRepos);
githubrouter.post("/analyze", authMiddleware, analyzeGithubRepo);

githubrouter.post("/skills", authMiddleware, evaluateGithubRepoSkill);
export default githubrouter;
