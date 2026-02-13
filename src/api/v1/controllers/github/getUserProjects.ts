import ProjectModel from "../../../../models/project.model";
import { Request, Response } from "express";
export const getUserProjects = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;

    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const search = (req.query.search as string) || ""; // ✅ Added search
    const skip = (page - 1) * limit;

    const query: any = { userId };
    if (search) {
      query.repoName = { $regex: search, $options: "i" };
    }

    const projects = await ProjectModel.find(query)
      .sort({ createdAt: -1 })
      .skip(skip) 
      .limit(limit);
      // .select("repoName repoUrl repoFullName createdAt"); // Removed select to return all stats for current display

    const total = await ProjectModel.countDocuments(query);

    return res.status(200).json({
      success: true,
      data: projects,
      totalRecords: total, // ✅ Matches frontend
      totalPages: Math.ceil(total / limit), // ✅ Matches frontend
      page,
      limit,
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

