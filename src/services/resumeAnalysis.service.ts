import { Types } from "mongoose";
import ProfileModel from "../models/profile.model";
import { IProfile } from "../@types/interfaces/profile.interfaces";
import { IResumeAnalysis } from "../@types/interfaces/resumeAnalysis.interface";
import { analyzeResumeWithAI } from "./integrations/gemini.service";

export class ResumeAnalysisService {
  async analyzeResume(userId: Types.ObjectId): Promise<IResumeAnalysis> {
    try {
      const profile = await ProfileModel.findOne({ userId }).select(
        "resumeText resumeUrl",
      );

      if (!profile) {
        throw new Error("Profile not found for this user");
      }

      if (!profile.resumeText || profile.resumeText.trim().length === 0) {
        throw new Error(
          "Resume text is not available. Please upload a resume first.",
        );
      }

      const analysisResponse = await analyzeResumeWithAI(profile.resumeText);

      const analysis: IResumeAnalysis = {
        atsScore: analysisResponse.atsScore,
        suggestions: analysisResponse.suggestions,
        skills: analysisResponse.skills,
        experienceSummary: analysisResponse.experienceSummary,
        strengths: analysisResponse.strengths,
        weaknesses: analysisResponse.weaknesses,
        analyzedAt: new Date(),
      };

      await ProfileModel.updateOne(
        { userId },
        {
          $set: {
            resumeAnalysis: analysis,
            resumeAnalyzedAt: analysis.analyzedAt,
          },
        },
      );

      return analysis;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Resume analysis failed: ${error.message}`);
      }
      throw new Error("Resume analysis failed: Unknown error");
    }
  }

  async getAnalysisResults(
    userId: Types.ObjectId,
  ): Promise<IResumeAnalysis | null> {
    try {
      const profile = await ProfileModel.findOne({ userId }).select(
        "resumeAnalysis resumeAnalyzedAt",
      );

      if (!profile || !profile.resumeAnalysis) {
        return null;
      }

      return profile.resumeAnalysis;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to get analysis results: ${error.message}`);
      }
      throw new Error("Failed to get analysis results: Unknown error");
    }
  }
}

export default new ResumeAnalysisService();
