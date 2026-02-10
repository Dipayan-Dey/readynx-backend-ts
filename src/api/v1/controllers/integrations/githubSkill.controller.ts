import { Request, Response } from "express";
import { convertGithubProjectToSkill } from "../../services/githubSkill.service";


export const generateGithubSkills = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;

    const skill = await convertGithubProjectToSkill(userId);

    // console.log("✅ GitHub skills generated successfully for user:", userId);

    return res.status(200).json({
      success: true,
      message: "GitHub skills generated successfully",
      data: skill,
    });
  } catch (error: any) {
    console.error("GitHub skill generation error:", error.message);
    
    if (error.message === "No analyzed GitHub project found") {
      return res.status(404).json({
        success: false,
        message: "No analyzed GitHub project found. Please analyze a repository first.",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to generate GitHub skills",
      error: error.message,
    });
  }
};
