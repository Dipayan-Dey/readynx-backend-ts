import { Types } from "mongoose";
import { geminiModel } from "../config/gemini";
import ProfileModel from "../models/profile.model";
import ProjectModel from "../models/project.model";
import UserModel from "../models/user.model";

export class ChatbotService {
  async generateResponse(
    userId: Types.ObjectId,
    userMessage: string,
  ): Promise<string> {
    try {
      // Fetch user data
      const user = await UserModel.findById(userId).select("name email");

      // Fetch profile data
      const profile = (await ProfileModel.findOne({ userId }).lean()) as any;

      // Fetch GitHub projects
      const projects = (await ProjectModel.find({ userId })
        .select("repoName description languageStats topics stars forks")
        .limit(10)
        .lean()) as any[];

      // Build context for the AI
      const contextParts: string[] = [];

      // User basic info
      if (user) {
        contextParts.push(`User Name: ${user.name}`);
        contextParts.push(`User Email: ${user.email}`);
      }

      // Profile information
      if (profile) {
        if (profile.bio) contextParts.push(`Bio: ${profile.bio}`);
        if (profile.location)
          contextParts.push(`Location: ${profile.location}`);
        if (profile.targetRole)
          contextParts.push(`Target Role: ${profile.targetRole}`);
        if (profile.experienceLevel)
          contextParts.push(`Experience Level: ${profile.experienceLevel}`);
        if (profile.website) contextParts.push(`Website: ${profile.website}`);

        // Skills
        if (profile.skills && profile.skills.length > 0) {
          contextParts.push(`Skills: ${profile.skills.join(", ")}`);
        }

        // Resume text
        if (profile.resumeText) {
          contextParts.push(
            `\nResume Content:\n${profile.resumeText.substring(0, 2000)}`,
          );
        }

        // Resume analysis
        if (profile.resumeAnalysis) {
          const analysis = profile.resumeAnalysis;
          if (analysis.atsScore) {
            contextParts.push(`\nResume ATS Score: ${analysis.atsScore}/100`);
          }
          if (analysis.strengths && analysis.strengths.length > 0) {
            contextParts.push(
              `Resume Strengths: ${analysis.strengths.join(", ")}`,
            );
          }
          if (analysis.weaknesses && analysis.weaknesses.length > 0) {
            contextParts.push(
              `Resume Weaknesses: ${analysis.weaknesses.join(", ")}`,
            );
          }
        }
      }

      // GitHub projects
      if (projects && projects.length > 0) {
        contextParts.push(`\nGitHub Projects (${projects.length}):`);
        projects.forEach((project, index) => {
          contextParts.push(`\n${index + 1}. ${project.repoName}`);
          if (project.description)
            contextParts.push(`   Description: ${project.description}`);
          if (project.languageStats?.primaryLanguage) {
            contextParts.push(
              `   Primary Language: ${project.languageStats.primaryLanguage}`,
            );
          }
          if (project.topics && project.topics.length > 0) {
            contextParts.push(`   Topics: ${project.topics.join(", ")}`);
          }
          if (project.stars) contextParts.push(`   Stars: ${project.stars}`);
        });
      }

      const userContext = contextParts.join("\n");

      // Create the prompt
      const systemPrompt = `You are a helpful career assistant chatbot for a professional profile platform. You have access to the user's profile information, resume, and GitHub projects.

Your role is to:
- Answer questions about the user's profile, skills, and experience
- Provide career advice based on their background
- Suggest improvements for their resume or profile
- Discuss their projects and technical skills
- Help them prepare for interviews
- Give personalized recommendations

Always be professional, encouraging, and provide actionable advice. Use the user's data to give personalized responses.

USER PROFILE DATA:
${userContext}

Now respond to the user's message in a helpful and personalized way.`;

      const fullPrompt = `${systemPrompt}\n\nUser Message: ${userMessage}\n\nYour Response:`;

      // Generate response using Gemini
      const result = await geminiModel.generateContent(fullPrompt);
      const response = result.response;
      const text = response.text();

      return text;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(
          `Failed to generate chatbot response: ${error.message}`,
        );
      }
      throw new Error("Failed to generate chatbot response: Unknown error");
    }
  }
}

export default new ChatbotService();
