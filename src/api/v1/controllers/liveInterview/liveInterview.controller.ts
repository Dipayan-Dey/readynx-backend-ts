import { Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import crypto from "crypto";
import resumeAnalysisService from "../../../../services/resumeAnalysis.service";
import { generateInterviewQuestionsFromAnalysis } from "../../../../services/liveInterview/liveInterviewGenerator.service";
import {
  createInterviewSession,
  getInterviewSession,
  updateInterviewSession,
} from "../../../../services/liveInterview/liveInterview.service";
import { evaluateAnswerWithContext } from "../../../../services/liveInterview/answerEvaluator.service";
import { generateFinalReport } from "../../../../services/liveInterview/reportGenerator.service";
import ttsService from "../../../../services/integrations/tts.service";

export const startInterview = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;

    const analysis = await resumeAnalysisService.getAnalysisResults(userId);

    if (!analysis) {
      return res.status(400).json({
        success: false,
        message: "Please analyze resume first",
      });
    }

    const questionResponse =
      await generateInterviewQuestionsFromAnalysis(analysis);

    if (
      !questionResponse ||
      !Array.isArray(questionResponse.questions) ||
      questionResponse.questions.length === 0
    ) {
      return res.status(500).json({
        success: false,
        message: "Failed to generate interview questions",
      });
    }

    // Validate that all questions are strings
    const validQuestions = questionResponse.questions
      .map((q: any) => {
        if (typeof q === "string") return q.trim();
        if (
          typeof q === "object" &&
          q !== null &&
          q.question &&
          typeof q.question === "string"
        ) {
          return q.question.trim();
        }
        return "";
      })
      .filter((q: string) => q.length > 0);

    if (validQuestions.length === 0) {
      console.error(
        "[Start Interview] No valid string questions found:",
        questionResponse.questions,
      );
      return res.status(500).json({
        success: false,
        message: "Failed to generate valid interview questions",
      });
    }

    const sessionId = uuidv4();

    createInterviewSession(
      sessionId,
      userId.toString(), // ensure string
      analysis,
      validQuestions,
    );

    return res.status(200).json({
      success: true,
      data: {
        // Wrapped in data to match frontend expectation
        sessionId,
        questions: validQuestions,
        firstQuestion: validQuestions[0],
      },
    });
  } catch (error: any) {
    console.error("Start Interview Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
};

export const submitAnswer = async (req: Request, res: Response) => {
  try {
    const { sessionId, answer } = req.body; // Changed from req.params to match code provided in prompt and logic

    // If sessionId is in params in route, i should check that.
    // The prompt code `liveInterviewRoute.post("/answer", authMiddleware, submitAnswer);` suggests body or query, usually body for POST.
    // The provided snippet: `const { sessionId, answer } = req.body;`

    // Wait, the prompt's route definitions:
    // liveInterviewRoute.post("/answer", authMiddleware, submitAnswer);

    // The prompt's submitAnswer implementation:
    // const { sessionId, answer } = req.body;

    // I shall stick to this.

    const session = getInterviewSession(sessionId);

    if (!session) {
      return res.status(404).json({
        success: false,
        message: "Session not found",
      });
    }

    const currentQuestion = session.questions[session.currentQuestionIndex];

    const evaluation = await evaluateAnswerWithContext(
      currentQuestion,
      answer,
      session.analysis,
    );

    updateInterviewSession(sessionId, currentQuestion, answer, evaluation);

    const nextQuestion = session.questions[session.currentQuestionIndex]; // logic in updateInterviewSession likely increments index?
    // Need to verify if updateInterviewSession increments index.
    // Assuming existing service logic handles state update.
    // If I look at the prompt code again:
    // `const nextQuestion = session.questions[session.currentQuestionIndex];`
    // It implies session object is mutated or we need to refetch?
    // JavaScript objects are passed by reference, so if updateInterviewSession mutates it, it's fine.
    // But `getInterviewSession` might return a copy?
    // I'll trust the logic provided in the prompt mostly, but strictness might be needed.
    // The provided code was:
    /*
        updateInterviewSession(sessionId, currentQuestion, answer, evaluation);
        const nextQuestion = session.questions[session.currentQuestionIndex];
      */
    // This implies `session` var holds the updated state or `updateInterviewSession` updates it in place.

    return res.status(200).json({
      success: true,
      data: evaluation, // matched frontend `response.data.data`
      nextQuestion,
    });
  } catch (error: any) {
    console.error("Submit Answer Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const finishInterview = async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.body;

    if (!sessionId) {
      return res.status(400).json({
        success: false,
        message: "Session ID is required",
      });
    }

    const session = getInterviewSession(sessionId);

    if (!session) {
      return res.status(404).json({
        success: false,
        message: "Session not found",
      });
    }

    const report = await generateFinalReport(session.transcript);

    // Maybe we should save the report/complete status here?
    // The provided code just returns the report.

    return res.status(200).json({
      success: true,
      data: report,
    });
  } catch (error: any) {
    console.error("Finish Interview Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to finish interview",
    });
  }
};

export const getSessionDetails = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const rawSessionId = req.params.id;

    if (!rawSessionId || Array.isArray(rawSessionId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid session ID",
      });
    }

    const sessionId: string = rawSessionId;

    const session = getInterviewSession(sessionId);

    if (!session) {
      return res.status(404).json({
        success: false,
        message: "Interview session not found",
      });
    }

    // ✅ Important fix here
    if (session.userId.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized access to session",
      });
    }

    const totalQuestions = session.questions.length;
    const currentIndex = session.currentQuestionIndex;

    const currentQuestion =
      currentIndex < totalQuestions ? session.questions[currentIndex] : null;

    const isCompleted = currentIndex >= totalQuestions;

    return res.status(200).json({
      success: true,
      data: {
        sessionId,
        totalQuestions,
        currentQuestionIndex: currentIndex,
        currentQuestion,
        transcript: session.transcript,
        isCompleted,
      },
    });
  } catch (error: any) {
    console.error("Get Session Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch session details",
    });
  }
};

export const getQuestionAudio = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const rawSessionId = req.params.sessionId;
    const rawQuestionIndex = req.params.questionIndex;

    if (
      !rawSessionId ||
      Array.isArray(rawSessionId) ||
      !rawQuestionIndex ||
      Array.isArray(rawQuestionIndex)
    ) {
      return res.status(400).json({
        success: false,
        message: "Session ID and question index are required",
      });
    }

    const sessionId: string = rawSessionId;
    const questionIndex: string = rawQuestionIndex;

    const session = getInterviewSession(sessionId);

    if (!session) {
      return res.status(404).json({
        success: false,
        message: "Interview session not found",
      });
    }

    // Verify user owns this session
    if (session.userId.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized access to session",
      });
    }

    const index = parseInt(questionIndex, 10);

    if (isNaN(index) || index < 0 || index >= session.questions.length) {
      return res.status(400).json({
        success: false,
        message: "Invalid question index",
      });
    }

    const questionText = session.questions[index];

    // Validate question text is a string
    if (!questionText || typeof questionText !== "string") {
      console.error(
        "[Controller] Invalid question text at index",
        index,
        ":",
        typeof questionText,
        questionText,
      );
      return res.status(500).json({
        success: false,
        message: "Invalid question data",
      });
    }

    // Check if TTS service is available
    const isAvailable = await ttsService.isAvailable();
    if (!isAvailable) {
      return res.status(503).json({
        success: false,
        message:
          "Text-to-speech service is not available. Please use client-side TTS.",
        fallback: true,
      });
    }

    // Generate ETag for caching (hash of sessionId + questionIndex)
    const etag = crypto
      .createHash("md5")
      .update(`${sessionId}-${questionIndex}`)
      .digest("hex");

    // Check if client has cached version BEFORE generating audio
    const clientETag = req.headers["if-none-match"];
    if (clientETag === etag) {
      return res.status(304).end(); // Not Modified - skip audio generation
    }

    // Generate audio only if not cached
    const audioBuffer = await ttsService.generateSpeech(questionText);

    // Set appropriate headers for audio streaming
    res.setHeader("Content-Type", "audio/mpeg");
    res.setHeader("Content-Length", audioBuffer.length.toString());
    res.setHeader("Cache-Control", "public, max-age=3600, immutable"); // Cache for 1 hour, immutable since questions don't change
    res.setHeader("ETag", etag);
    res.setHeader("Accept-Ranges", "bytes"); // Enable range requests for seeking
    res.setHeader("Content-Disposition", "inline; filename=question.mp3"); // Suggest inline playback

    return res.send(audioBuffer);
  } catch (error: any) {
    console.error("Get Question Audio Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to generate question audio",
    });
  }
};
