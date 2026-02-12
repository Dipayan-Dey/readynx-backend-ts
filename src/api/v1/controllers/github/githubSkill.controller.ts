import { Request, Response } from "express";
import ProjectModel from "../../../../models/project.model";
import UserSkillModel from "../../../../models/userskill.model";
import { evaluateSkill } from "../../../../services/github/githubSkill.service";

export const evaluateGithubRepoSkill = async (
  req: Request,
  res: Response
) => {
  try {
    const userId = (req as any).user.userId;
    const { projectId } = req.body;

    // ✅ Pagination params (ADDED)
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = (req.query.search as string) || "";
    const skip = (page - 1) * limit;

    // 🔹 1️⃣ Check project exists
    const project = await ProjectModel.findOne({
      _id: projectId,
      userId,
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Analyzed project not found",
      });
    }

    // 🔹 2️⃣ Check if skill already evaluated
    const existingSkill = await UserSkillModel.findOne({
      userId,
      projectId,
    }).populate({
      path: "projectId",
      select: "repoName repoUrl",
    });

    if (existingSkill) {
      return res.status(200).json({
        success: true,
        message: "Skill already evaluated",
        page,
        limit,
        totalRecords: 1,
        totalPages: 1,
        skills: [
          {
            ...existingSkill.toObject(),
            repoName: (existingSkill.projectId as any)?.repoName,
            repoUrl: (existingSkill.projectId as any)?.repoUrl,
          },
        ],
      });
    }

    // 🔹 3️⃣ Evaluate skill
    const skillResult = evaluateSkill(project);

    // 🔹 4️⃣ Save skill
    const savedSkill = await UserSkillModel.create({
      userId,
      projectId,
      ...skillResult,
      evaluatedAt: new Date(),
    });

    // 🔹 5️⃣ Fetch with repoName
    const populatedSkill = await UserSkillModel.findById(
      savedSkill._id
    ).populate({
      path: "projectId",
      select: "repoName repoUrl",
    });

    // 🔍 SEARCH FILTER (ADDED)
    let skillsArray: Array<Record<string, any>>= [];

    if (populatedSkill) {
      const skillObj = {
        ...populatedSkill.toObject(),
        repoName: (populatedSkill.projectId as any)?.repoName,
        repoUrl: (populatedSkill.projectId as any)?.repoUrl,
      };

      if (
        search &&
        !skillObj.repoName?.toLowerCase().includes(search.toLowerCase())
      ) {
        skillsArray = [];
      } else {
        skillsArray = [skillObj];
      }
    }

    const total = skillsArray.length;

    return res.status(200).json({
      success: true,
      message: "Skill evaluated successfully",
      page,
      limit,
      totalRecords: total,
      totalPages: total === 0 ? 0 : 1,
      skills: skillsArray,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: "Skill evaluation failed",
      error: error.message,
    });
  }
};

