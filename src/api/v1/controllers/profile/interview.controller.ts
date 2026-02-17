import { Request, Response } from "express";
import { Types } from "mongoose";
import interviewService from "../../../../services/interview.service";

export const startInterview = async (req: Request, res: Response) => {
  try {
    const userId = new Types.ObjectId((req as any).user.userId);
    const { targetRole, experienceLevel } = req.body;

    const session = await interviewService.startInterviewSession(
      userId,
      targetRole,
      experienceLevel,
    );

    return res.status(201).json({
      success: true,
      message: "Interview session started successfully",
      data: {
        sessionId: session._id,
        questions: session.questions.map((q) => q.question),
        status: session.status,
        startedAt: session.startedAt,
      },
    });
  } catch (error: any) {
    console.error("Error starting interview:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to start interview session",
      error: error.message,
    });
  }
};

export const submitAnswer = async (req: Request, res: Response) => {
  try {
    const userId = new Types.ObjectId((req as any).user.userId);
    const sessionIdParam = Array.isArray(req.params.sessionId)
      ? req.params.sessionId[0]
      : req.params.sessionId;
    const sessionId = new Types.ObjectId(sessionIdParam);
    const { questionIndex, answer } = req.body;

    // Validate request body
    if (questionIndex === undefined || questionIndex === null) {
      return res.status(400).json({
        success: false,
        message: "questionIndex is required",
      });
    }

    if (!answer || typeof answer !== "string" || answer.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: "answer is required and must be a non-empty string",
      });
    }

    // Submit answer
    const session = await interviewService.submitAnswer(
      sessionId,
      userId,
      questionIndex,
      answer,
    );

    const answeredQuestion = session.questions[questionIndex];

    return res.status(200).json({
      success: true,
      message: "Answer submitted successfully",
      data: {
        questionIndex,
        feedback: answeredQuestion?.aiFeedback,
        score: answeredQuestion?.score,
      },
    });
  } catch (error: any) {
    console.error("Error submitting answer:", error);

    // Handle specific errors
    if (error.message.includes("not found")) {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }

    if (
      error.message.includes("not in progress") ||
      error.message.includes("Invalid question index")
    ) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to submit answer",
      error: error.message,
    });
  }
};

export const completeInterview = async (req: Request, res: Response) => {
  try {
    const userId = new Types.ObjectId((req as any).user.userId);
    const sessionIdParam = Array.isArray(req.params.sessionId)
      ? req.params.sessionId[0]
      : req.params.sessionId;
    const sessionId = new Types.ObjectId(sessionIdParam);

    const session = await interviewService.completeSession(sessionId, userId);

    return res.status(200).json({
      success: true,
      message: "Interview session completed successfully",
      data: {
        sessionId: session._id,
        status: session.status,
        performanceMetrics: session.performanceMetrics,
        completedAt: session.completedAt,
      },
    });
  } catch (error: any) {
    console.error("Error completing interview:", error);

    if (error.message.includes("not found")) {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }

    if (error.message.includes("already completed")) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to complete interview session",
      error: error.message,
    });
  }
};

export const getInterviewHistory = async (req: Request, res: Response) => {
  try {
    const userId = new Types.ObjectId((req as any).user.userId);

    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const sessions = await interviewService.getInterviewHistory(
      userId,
      limit,
      skip,
    );

    return res.status(200).json({
      success: true,
      data: sessions,
      page,
      limit,
    });
  } catch (error: any) {
    console.error("Error fetching interview history:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch interview history",
      error: error.message,
    });
  }
};

export const deleteInterview = async (req: Request, res: Response) => {
  try {
    const userId = new Types.ObjectId((req as any).user.userId);
    const sessionIdParam = Array.isArray(req.params.sessionId)
      ? req.params.sessionId[0]
      : req.params.sessionId;
    const sessionId = new Types.ObjectId(sessionIdParam);

    await interviewService.deleteInterviewSession(sessionId, userId);

    return res.status(200).json({
      success: true,
      message: "Interview session deleted successfully",
    });
  } catch (error: any) {
    console.error("Error deleting interview:", error);

    if (error.message.includes("not found")) {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to delete interview session",
      error: error.message,
    });
  }
};
