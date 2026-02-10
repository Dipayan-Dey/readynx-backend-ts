import { Router } from "express";
import authMiddleware from "../middleware/auth.middleware";
import { githubCallback, githubRedirect, githubDisconnect } from "../controllers/integrations/github.controller";
import { linkedinCallback, linkedinRedirect, linkedinDisconnect } from "../controllers/integrations/linkedin.controller";
import { linkedinPost } from "../controllers/integrations/linkedin-post.controller";
import { getGithubRepos, analyzeGithubRepo } from "../controllers/integrations/githubAnalysis.controller";
import { generateGithubSkills } from "../controllers/integrations/githubSkill.controller";
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
integrationrouter.get("/github/repos", authMiddleware, getGithubRepos);
integrationrouter.post("/github/analyze", authMiddleware, analyzeGithubRepo);
integrationrouter.post("/github/skills", authMiddleware, generateGithubSkills);

// const router = Router();

integrationrouter.get("/linkedin", authMiddleware, linkedinRedirect);
integrationrouter.get("/linkedin/callback", linkedinCallback); // No authMiddleware - token in state
integrationrouter.post("/linkedin/disconnect", authMiddleware, linkedinDisconnect);
integrationrouter.post("/linkedin/post", authMiddleware, linkedinPost);

export default integrationrouter;
