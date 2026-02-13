import { Router } from "express";
import authMiddleware from "../middleware/auth.middleware";
import {
  analyzeGithubRepo,
  getAllGithubRepos,
} from "../controllers/github/githubAnalysis.controller";
import { 
  evaluateGithubRepoSkill,
  getAllUserSkills 
} from "../controllers/github/githubSkill.controller";
import { getUserProjects } from "../controllers/github/getUserProjects";

const githubrouter = Router();

// GET routes for fetching stored/analyzed data
githubrouter.get("/projects", authMiddleware, getUserProjects);
githubrouter.get("/skills/all", authMiddleware, getAllUserSkills);

// Existing routes
githubrouter.get("/repos", authMiddleware, getAllGithubRepos); // Fetches from GitHub API
githubrouter.post("/analyze", authMiddleware, analyzeGithubRepo);

githubrouter.post("/skills", authMiddleware, evaluateGithubRepoSkill);
export default githubrouter;
