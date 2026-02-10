import { Request, Response } from "express";
import ProjectModel from "../../../../models/project.model";
import UserSkillModel from "../../../../models/userskill.model";

/**
 * GET /api/v1/user/projects
 * Get all analyzed projects for the authenticated user
 */
export const getUserProjects = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;

    const projects = await ProjectModel.find({ userId }).sort({ analyzedAt: -1 });

    return res.status(200).json({
      success: true,
      data: projects,
    });
  } catch (error: any) {
    console.error("Error fetching user projects:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch projects",
      error: error.message,
    });
  }
};

/**
 * GET /api/v1/user/skills
 * Get all extracted skills for the authenticated user
 */
export const getUserSkills = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;

    const skills = await UserSkillModel.find({ userId }).sort({ lastUpdated: -1 });

    return res.status(200).json({
      success: true,
      data: skills,
    });
  } catch (error: any) {
    console.error("Error fetching user skills:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch skills",
      error: error.message,
    });
  }
};
