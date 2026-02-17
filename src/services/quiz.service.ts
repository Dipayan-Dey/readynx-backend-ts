import { Types } from "mongoose";
import QuizSessionModel from "../models/quizSession.model";
import ProfileModel from "../models/profile.model";
import ProjectModel from "../models/project.model";
import {
  IQuizSession,
  IQuizQuestion,
} from "../@types/interfaces/quizSession.interface";
import { generateTechnicalQuiz } from "./integrations/gemini.service";

export class QuizService {
  async generateQuiz(
    userId: Types.ObjectId,
    targetRole?: string,
    questionCount: number = 10,
  ): Promise<IQuizQuestion[]> {
    try {
      const profile = await ProfileModel.findOne({ userId }).select(
        "resumeAnalysis.skills targetRole",
      );

      const projects = await ProjectModel.find({ userId })
        .select("languageStats.primaryLanguage topics")
        .limit(20)
        .lean();

      const technologies = new Set<string>();
      projects.forEach((project) => {
        if (project.languageStats?.primaryLanguage) {
          technologies.add(project.languageStats.primaryLanguage);
        }
        if (project.topics) {
          project.topics.forEach((topic) => technologies.add(topic));
        }
      });

      const skills = profile?.resumeAnalysis?.skills || [];
      const techArray = Array.from(technologies);
      const finalTargetRole = targetRole || profile?.targetRole;

      const quizResponse = await generateTechnicalQuiz(
        skills,
        techArray,
        finalTargetRole,
        questionCount,
      );

      return quizResponse.questions;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to generate quiz: ${error.message}`);
      }
      throw new Error("Failed to generate quiz: Unknown error");
    }
  }

  async startQuizSession(
    userId: Types.ObjectId,
    questions: IQuizQuestion[],
  ): Promise<IQuizSession> {
    try {
      const session = await QuizSessionModel.create({
        userId,
        questions: questions.map((q) => ({
          question: q.question,
          options: q.options,
          correctAnswer: q.correctAnswer,
          userAnswer: undefined,
          isCorrect: undefined,
        })),
        totalQuestions: questions.length,
        status: "in_progress",
        startedAt: new Date(),
      });

      return session;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to start quiz session: ${error.message}`);
      }
      throw new Error("Failed to start quiz session: Unknown error");
    }
  }

  async submitQuizAnswers(
    sessionId: Types.ObjectId,
    userId: Types.ObjectId,
    answers: Array<{ questionIndex: number; answer: string }>,
  ): Promise<IQuizSession> {
    try {
      const session = await QuizSessionModel.findOne({
        _id: sessionId,
        userId,
      });

      if (!session) {
        throw new Error("Quiz session not found");
      }

      if (session.status === "completed") {
        throw new Error("Quiz session is already completed");
      }

      answers.forEach(({ questionIndex, answer }) => {
        if (questionIndex < 0 || questionIndex >= session.questions.length) {
          throw new Error(`Invalid question index: ${questionIndex}`);
        }

        const question = session.questions[questionIndex];
        if (!question) {
          throw new Error(`Question not found at index: ${questionIndex}`);
        }

        question.userAnswer = answer;
        question.isCorrect = answer === question.correctAnswer;
      });

      const score = this.calculateScore(session);

      session.score = score.score;
      session.correctAnswers = score.correctAnswers;
      session.status = "completed";
      session.completedAt = new Date();

      await session.save();

      return session;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to submit quiz answers: ${error.message}`);
      }
      throw new Error("Failed to submit quiz answers: Unknown error");
    }
  }

  calculateScore(session: IQuizSession): {
    score: number;
    correctAnswers: number;
  } {
    const correctAnswers = session.questions.filter(
      (q) => q.isCorrect === true,
    ).length;

    const totalQuestions = session.totalQuestions;
    const score =
      totalQuestions > 0
        ? Math.round((correctAnswers / totalQuestions) * 100)
        : 0;

    return {
      score,
      correctAnswers,
    };
  }

  async getQuizHistory(
    userId: Types.ObjectId,
    limit: number = 10,
    skip: number = 0,
  ): Promise<IQuizSession[]> {
    try {
      const sessions = await QuizSessionModel.find({ userId })
        .sort({ startedAt: -1 })
        .limit(limit)
        .skip(skip)
        .lean();

      return sessions;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to get quiz history: ${error.message}`);
      }
      throw new Error("Failed to get quiz history: Unknown error");
    }
  }
}

export default new QuizService();
