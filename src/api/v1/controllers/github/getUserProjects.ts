import ProjectModel from "../../../../models/project.model";
import { Request, Response } from "express";
export const getUserProjects = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;

    const page = Number(req.query.page) || 1; // ✅ ADDED
    const limit = Number(req.query.limit) || 10; // ✅ ADDED

    const skip = (page - 1) * limit; // ✅ ADDED

    const projects = await ProjectModel.find({ userId })
      .sort({ createdAt: -1 })
      .skip(skip) // ✅ ADDED
      .limit(limit) // ✅ ADDED
      .select("repoName repoUrl repoFullName createdAt"); // ✅ CHANGED (light fields only)

    const total = await ProjectModel.countDocuments({ userId });

    return res.status(200).json({
      success: true,
      data: projects,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


export const getProjectById = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const { projectId } = req.params;

    const project = await ProjectModel.findOne({
      _id: projectId,
      userId,
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: project,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

