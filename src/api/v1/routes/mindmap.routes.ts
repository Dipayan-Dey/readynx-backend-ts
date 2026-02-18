import { Router } from "express";
import {
  generateCVMindMap,
  generateTechRoadmap,
} from "../controllers/mindmap/mindmap.controller";
import authMiddleware from "../middleware/auth.middleware";
// import { authenticateToken } from "../middleware/auth.middleware";

const router = Router();

// Generate mind map based on CV analysis
router.get("/cv-mindmap", authMiddleware, generateCVMindMap);

// Generate technology roadmap (no CV data needed)
router.post("/tech-roadmap", authMiddleware, generateTechRoadmap);

export default router;
