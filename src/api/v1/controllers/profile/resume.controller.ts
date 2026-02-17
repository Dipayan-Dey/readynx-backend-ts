import { Request, Response } from "express";
import { Types } from "mongoose";
import resumeService from "../../../../services/resume.service";

export const uploadResume = async (req: Request, res: Response) => {
  try {
    const userId = new Types.ObjectId((req as any).user.userId);


    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded. Please provide a PDF or DOCX file.",
      });
    }

    const { buffer, originalname, mimetype } = req.file;

    const result = await resumeService.uploadResume(
      userId,
      buffer,
      originalname,
      mimetype
    );

    return res.status(200).json({
      success: true,
      message: "Resume uploaded successfully",
      data: {
        resumeUrl: result.resumeUrl,
        textExtracted: result.resumeText.length > 0,
      },
    });
  } catch (error: any) {
    console.error("Error uploading resume:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to upload resume",
      error: error.message,
    });
  }
};


export const getResume = async (req: Request, res: Response) => {
  try {
    const userId = new Types.ObjectId((req as any).user.userId);

    const resumeDetails = await resumeService.getResumeDetails(userId);

    if (!resumeDetails || !resumeDetails.resumeUrl) {
      return res.status(404).json({
        success: false,
        message: "No resume found for this user",
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        // resumeUrl: resumeDetails.resumeUrl,
        // hasText: !!resumeDetails.resumeText,
        resumeDetails
      },
    });
  } catch (error: any) {
    console.error("Error fetching resume:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch resume",
      error: error.message,
    });
  }
};


export const deleteResume = async (req: Request, res: Response) => {
  try {
    const userId = new Types.ObjectId((req as any).user.userId);

    await resumeService.deleteResume(userId);

    return res.status(200).json({
      success: true,
      message: "Resume deleted successfully",
    });
  } catch (error: any) {
    console.error("Error deleting resume:", error);

    if (error.message.includes("No resume found")) {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to delete resume",
      error: error.message,
    });
  }
};
