import { Types } from "mongoose";
import InterviewSessionModel from "../models/interviewSession.model";
import ProfileModel from "../models/profile.model";
import ProjectModel from "../models/project.model";
import {
  IInterviewSession,
  IInterviewQuestion,
  IPerformanceMetrics,
} from "../@types/interfaces/interviewSession.interface";
import {
  generateInterviewQuestions,
  evaluateInterviewAnswer,
} from "./integrations/gemini.service";

export class InterviewService {
  async startInterviewSession(
    userId: Types.ObjectId,
    targetRole?: string,
    experienceLevel?: string,
  ): Promise<IInterviewSession> {
    try {
      const profile = await ProfileModel.findOne({ userId }).select(
        "resumeText targetRole experienceLevel",
      );

      const finalTargetRole = targetRole || profile?.targetRole;
      const finalExperienceLevel = experienceLevel || profile?.experienceLevel;

      const projects = await ProjectModel.find({ userId })
        .select("repoName description languageStats.primaryLanguage topics")
        .limit(10)
        .lean();

      const githubProjects = projects.map((project) => ({
        repoName: project.repoName,
        description: project.description,
        primaryLanguage: project.languageStats?.primaryLanguage || "Unknown",
        topics: project.topics || [],
      }));

      const questionsResponse = await generateInterviewQuestions(
        profile?.resumeText || undefined,
        // githubProjects,
        finalTargetRole,
        finalExperienceLevel,
      );

      const questions: IInterviewQuestion[] = questionsResponse.questions.map(
        (q) => ({
          question: q,
          userAnswer: undefined,
          aiFeedback: undefined,
          score: undefined,
        }),
      );

      const session = await InterviewSessionModel.create({
        userId,
        questions,
        status: "in_progress",
        startedAt: new Date(),
      });

      return session;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to start interview session: ${error.message}`);
      }
      throw new Error("Failed to start interview session: Unknown error");
    }
  }

  async submitAnswer(
    sessionId: Types.ObjectId,
    userId: Types.ObjectId,
    questionIndex: number,
    answer: string,
  ): Promise<IInterviewSession> {
    try {
      // Find the session
      const session = await InterviewSessionModel.findOne({
        _id: sessionId,
        userId,
      });

      if (!session) {
        throw new Error("Interview session not found");
      }

      if (session.status !== "in_progress") {
        throw new Error("Interview session is not in progress");
      }

      // Validate question index
      if (questionIndex < 0 || questionIndex >= session.questions.length) {
        throw new Error("Invalid question index");
      }

      const question = session.questions[questionIndex];

      if (!question) {
        throw new Error("Question not found");
      }

      // Evaluate the answer using AI
      const evaluation = await evaluateInterviewAnswer(
        question.question,
        answer,
      );

      // Update the question with answer and feedback
      session.questions[questionIndex].userAnswer = answer;
      session.questions[questionIndex].aiFeedback = evaluation.feedback;
      session.questions[questionIndex].score = evaluation.score * 10; // Convert 0-10 to 0-100

      // Mark the questions array as modified for Mongoose
      session.markModified("questions");

      // Save the session
      await session.save();

      return session;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to submit answer: ${error.message}`);
      }
      throw new Error("Failed to submit answer: Unknown error");
    }
  }

  async completeSession(
    sessionId: Types.ObjectId,
    userId: Types.ObjectId,
  ): Promise<IInterviewSession> {
    try {
      const session = await InterviewSessionModel.findOne({
        _id: sessionId,
        userId,
      });

      if (!session) {
        throw new Error("Interview session not found");
      }

      if (session.status === "completed") {
        throw new Error("Interview session is already completed");
      }

      const totalQuestions = session.questions.length;
      const answeredQuestions = session.questions.filter(
        (q) => q.userAnswer && q.userAnswer.trim().length > 0,
      ).length;

      const scoredQuestions = session.questions.filter(
        (q) => q.score !== undefined && q.score !== null,
      );

      const totalScore = scoredQuestions.reduce(
        (sum, q) => sum + (q.score || 0),
        0,
      );

      const averageScore =
        scoredQuestions.length > 0 ? totalScore / scoredQuestions.length : 0;

      const completionRate =
        totalQuestions > 0 ? (answeredQuestions / totalQuestions) * 100 : 0;

      const performanceMetrics: IPerformanceMetrics = {
        averageScore: Math.round(averageScore * 100) / 100,
        totalQuestions,
        answeredQuestions,
        completionRate: Math.round(completionRate * 100) / 100,
      };

      session.status = "completed";
      session.completedAt = new Date();
      session.performanceMetrics = performanceMetrics;

      await session.save();

      return session;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to complete session: ${error.message}`);
      }
      throw new Error("Failed to complete session: Unknown error");
    }
  }

  async getInterviewHistory(
    userId: Types.ObjectId,
    limit: number = 10,
    skip: number = 0,
  ): Promise<IInterviewSession[]> {
    try {
      const sessions = await InterviewSessionModel.find({ userId })
        .sort({ startedAt: -1 })
        .limit(limit)
        .skip(skip)
        .lean();

      return sessions;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to get interview history: ${error.message}`);
      }
      throw new Error("Failed to get interview history: Unknown error");
    }
  }

  async deleteInterviewSession(
    sessionId: Types.ObjectId,
    userId: Types.ObjectId,
  ): Promise<void> {
    try {
      const session = await InterviewSessionModel.findOne({
        _id: sessionId,
        userId,
      });

      if (!session) {
        throw new Error("Interview session not found");
      }

      await InterviewSessionModel.deleteOne({ _id: sessionId, userId });
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to delete interview session: ${error.message}`);
      }
      throw new Error("Failed to delete interview session: Unknown error");
    }
  }
}

export default new InterviewService();
