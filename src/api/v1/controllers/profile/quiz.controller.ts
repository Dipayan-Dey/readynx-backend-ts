import { Request, Response } from "express";
import { Types } from "mongoose";
import quizService from "../../../../services/quiz.service";

export const generateQuiz = async (req: Request, res: Response) => {
  try {
    const userId = new Types.ObjectId((req as any).user.userId);
    const { targetRole, questionCount } = req.body;

    const questions = await quizService.generateQuiz(
      userId,
      targetRole,
      questionCount,
    );

    return res.status(200).json({
      success: true,
      message: "Quiz generated successfully",
      data: {
        questions: questions.map((q) => ({
          question: q.question,
          options: q.options,
        })),
        totalQuestions: questions.length,
      },
    });
  } catch (error: any) {
    console.error("Error generating quiz:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to generate quiz",
      error: error.message,
    });
  }
};

export const startQuiz = async (req: Request, res: Response) => {
  try {
    const userId = new Types.ObjectId((req as any).user.userId);
    const { targetRole, questionCount } = req.body;

    const questions = await quizService.generateQuiz(
      userId,
      targetRole,
      questionCount,
    );

    const session = await quizService.startQuizSession(userId, questions);

    return res.status(201).json({
      success: true,
      message: "Quiz session started successfully",
      data: {
        sessionId: session._id,
        questions: session.questions.map((q) => ({
          question: q.question,
          options: q.options,
        })),
        totalQuestions: session.totalQuestions,
        status: session.status,
        startedAt: session.startedAt,
      },
    });
  } catch (error: any) {
    console.error("Error starting quiz:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to start quiz session",
      error: error.message,
    });
  }
};

export const submitQuizAnswers = async (req: Request, res: Response) => {
  try {
    const userId = new Types.ObjectId((req as any).user.userId);
    const sessionIdParam = Array.isArray(req.params.sessionId)
      ? req.params.sessionId[0]
      : req.params.sessionId;
    const sessionId = new Types.ObjectId(sessionIdParam);
    const { answers } = req.body;

    if (!answers || !Array.isArray(answers)) {
      return res.status(400).json({
        success: false,
        message: "answers must be an array",
      });
    }

    for (const answer of answers) {
      if (
        typeof answer.questionIndex !== "number" ||
        typeof answer.answer !== "string"
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Each answer must have questionIndex (number) and answer (string)",
        });
      }
    }

    const session = await quizService.submitQuizAnswers(
      sessionId,
      userId,
      answers,
    );

    return res.status(200).json({
      success: true,
      message: "Quiz submitted successfully",
      data: {
        sessionId: session._id,
        score: session.score,
        correctAnswers: session.correctAnswers,
        totalQuestions: session.totalQuestions,
        status: session.status,
        completedAt: session.completedAt,
        questions: session.questions.map((q) => ({
          question: q.question,
          options: q.options,
          userAnswer: q.userAnswer,
          correctAnswer: q.correctAnswer,
          isCorrect: q.isCorrect,
        })),
      },
    });
  } catch (error: any) {
    console.error("Error submitting quiz answers:", error);

    if (error.message.includes("not found")) {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }

    if (
      error.message.includes("already completed") ||
      error.message.includes("Invalid question index")
    ) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to submit quiz answers",
      error: error.message,
    });
  }
};

export const getQuizHistory = async (req: Request, res: Response) => {
  try {
    const userId = new Types.ObjectId((req as any).user.userId);

    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const sessions = await quizService.getQuizHistory(userId, limit, skip);

    return res.status(200).json({
      success: true,
      data: sessions,
      page,
      limit,
    });
  } catch (error: any) {
    console.error("Error fetching quiz history:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch quiz history",
      error: error.message,
    });
  }
};

export const deleteQuizHistory =async (req: Request, res: Response) => {
  try {
    const userId=new Types.ObjectId((req as any).user.userId)
    const { sessionId } = req.params;
       if (!sessionId || Array.isArray(sessionId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid session ID",
      });
    }
    if (!Types.ObjectId.isValid(sessionId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid session ID",
      });
    }

    await quizService.deleteQuizHistory(
      new Types.ObjectId(sessionId),
      new Types.ObjectId(userId),
    );
  } catch (error) {
    return res.status(500).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to delete quiz session",
    });
  
  }
};
