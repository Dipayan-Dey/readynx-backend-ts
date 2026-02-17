import { Request, Response, NextFunction } from "express";

/**
 * Middleware to validate resume file uploads
 * Validates file size (max 10MB) and MIME type (PDF or DOCX only)
 * Requirements: 1.1, 1.4, 12.1, 12.2, 12.4
 */
export const validateResumeFile = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    // Check if file exists
    if (!req.file) {
      res.status(400).json({
        success: false,
        message: "No file uploaded. Please provide a resume file.",
      });
      return;
    }

    const file = req.file;
    const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB in bytes
    const ALLOWED_MIME_TYPES = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      res.status(400).json({
        success: false,
        message: "File size exceeds the maximum limit of 10MB. Please upload a smaller file.",
      });
      return;
    }

    // Validate MIME type
    if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      res.status(400).json({
        success: false,
        message: "Invalid file type. Only PDF and DOCX files are allowed.",
      });
      return;
    }

    // If all validations pass, proceed to next middleware
    next();
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "An error occurred while validating the file.",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};
