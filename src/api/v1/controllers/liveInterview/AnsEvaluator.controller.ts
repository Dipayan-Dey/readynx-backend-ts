import { evaluateAnswerWithContext } from "../../../../services/liveInterview/answerEvaluator.service";
import { getInterviewSession, updateInterviewSession } from "../../../../services/liveInterview/liveInterview.service";
import { Request,Response } from "express";
export const submitAnswer = async (req: Request, res: Response) => {
  try {
    const { sessionId, answer } = req.body;

    const session = getInterviewSession(sessionId);

    if (!session) {
      return res.status(404).json({
        success: false,
        message: "Session not found",
      });
    }

    const currentQuestion =
      session.questions[session.currentQuestionIndex];

    const evaluation = await evaluateAnswerWithContext(
      currentQuestion,
      answer,
      session.analysis,
    );

    updateInterviewSession(
      sessionId,
      currentQuestion,
      answer,
      evaluation,
    );

    const nextQuestion =
      session.questions[session.currentQuestionIndex];

    return res.status(200).json({
      success: true,
      evaluation,
      nextQuestion,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};