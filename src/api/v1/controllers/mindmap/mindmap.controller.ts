import { Request, Response } from "express";
import { Types } from "mongoose";
import mindmapService from "../../../../services/mindmap.service";

export const generateCVMindMap = async (req: Request, res: Response) => {
  try {
    const userId = new Types.ObjectId((req as any).user.userId);

    const mindMap = await mindmapService.generateCVBasedMindMap(userId);

    return res.status(200).json({
      success: true,
      message: "Mind map generated successfully",
      data: mindMap,
    });
  } catch (error: any) {
    console.error("Error generating CV mind map:", error);

    if (error.message.includes("Profile not found")) {
      return res.status(404).json({
        success: false,
        message: "Profile not found",
      });
    }

    if (error.message.includes("Resume analysis not found")) {
      return res.status(400).json({
        success: false,
        message: "Resume analysis not found. Please analyze your resume first.",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to generate mind map",
      error: error.message,
    });
  }
};

export const generateTechRoadmap = async (req: Request, res: Response) => {
  try {
    const { technology, experienceLevel } = req.body;

    if (!technology) {
      return res.status(400).json({
        success: false,
        message: "Technology name is required",
      });
    }

    const roadmap = await mindmapService.generateTechnologyRoadmap(
      technology,
      experienceLevel,
    );

    return res.status(200).json({
      success: true,
      message: "Technology roadmap generated successfully",
      data: roadmap,
    });
  } catch (error: any) {
    console.error("Error generating technology roadmap:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to generate technology roadmap",
      error: error.message,
    });
  }
};
