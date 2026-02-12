import { Router } from "express";
import authMiddleware from "../middleware/auth.middleware";
import {
  githubCallback,
  githubRedirect,
  githubDisconnect,
} from "../controllers/integrations/github.controller";
import {
  linkedinCallback,
  linkedinRedirect,
  linkedinDisconnect,
} from "../controllers/integrations/linkedin.controller";
import { linkedinPost } from "../controllers/integrations/linkedin-post.controller";
import {
  
  analyzeGithubRepo,
  getAllGithubRepos,
} from "../controllers/github/githubAnalysis.controller";
import { evaluateGithubRepoSkill } from "../controllers/github/githubSkill.controller";
// import {
//   githubRedirect,
//   githubCallback,
// } from "../controllers/integrations/github.controller";

const integrationrouter = Router();

// GitHub OAuth routes
integrationrouter.get("/github", authMiddleware, githubRedirect);
integrationrouter.get("/github/callback", githubCallback); // No authMiddleware - token in state
integrationrouter.post("/github/disconnect", authMiddleware, githubDisconnect);

// GitHub Analysis routes
integrationrouter.get("/github/repos", authMiddleware, getAllGithubRepos);
integrationrouter.post("/github/analyze", authMiddleware, analyzeGithubRepo);
integrationrouter.post("/github/skills", authMiddleware, evaluateGithubRepoSkill);

// const router = Router();

integrationrouter.get("/linkedin", authMiddleware, linkedinRedirect);
integrationrouter.get("/linkedin/callback", linkedinCallback); // No authMiddleware - token in state
integrationrouter.post(
  "/linkedin/disconnect",
  authMiddleware,
  linkedinDisconnect,
);
integrationrouter.post("/linkedin/post", authMiddleware, linkedinPost);

export default integrationrouter;
