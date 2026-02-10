import { Request, Response } from "express";
import { convertGithubProjectToSkill } from "../../../../services/github/githubSkill.service";
// import { convertGithubProjectToSkill } from "../services/githubSkill.service";

export const generateGithubSkills = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;

    const skill = await convertGithubProjectToSkill(userId);

    return res.status(200).json({
      success: true,
      message: "GitHub skills generated successfully",
      data: skill,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: "Failed to generate GitHub skills",
      error: error.message,
    });
  }
};
