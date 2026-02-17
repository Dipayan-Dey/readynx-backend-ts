import { Request, Response } from "express";
import { Types } from "mongoose";
import resumeAnalysisService from "../../../../services/resumeAnalysis.service";


export const analyzeResume = async (req: Request, res: Response) => {
  try {
    const userId = new Types.ObjectId((req as any).user.userId);


    const analysis = await resumeAnalysisService.analyzeResume(userId);

    return res.status(200).json({
      success: true,
      message: "Resume analyzed successfully",
      data: analysis,
    });
  } catch (error: any) {
    console.error("Error analyzing resume:", error);

    if (error.message.includes("Profile not found")) {
      return res.status(404).json({
        success: false,
        message: "Profile not found",
      });
    }

    if (error.message.includes("Resume text is not available")) {
      return res.status(400).json({
        success: false,
        message: "No resume found. Please upload a resume first.",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to analyze resume",
      error: error.message,
    });
  }
};

export const getAnalysisResults = async (req: Request, res: Response) => {
  try {
    const userId = new Types.ObjectId((req as any).user.userId);

    const analysis = await resumeAnalysisService.getAnalysisResults(userId);

    if (!analysis) {
      return res.status(404).json({
        success: false,
        message: "No analysis results found. Please analyze your resume first.",
      });
    }

    return res.status(200).json({
      success: true,
      data: analysis,
    });
  } catch (error: any) {
    console.error("Error fetching analysis results:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch analysis results",
      error: error.message,
    });
  }
};
