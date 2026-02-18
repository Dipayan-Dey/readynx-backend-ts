import { Types } from "mongoose";
import ProfileModel from "../models/profile.model";
import {
  callGroqWithRetry,
  makeGroqChatCompletion,
  parseGroqJsonResponse,
} from "./integrations/groq.service";

interface IMindMapNode {
  id: string;
  label: string;
  children?: IMindMapNode[];
}

interface IMindMapResponse {
  title: string;
  nodes: IMindMapNode[];
}

interface IRoadmapResponse {
  technology: string;
  phases: Array<{
    phase: string;
    duration: string;
    topics: string[];
    resources: string[];
  }>;
}

export const generateCVBasedMindMap = async (
  userId: Types.ObjectId,
): Promise<IMindMapResponse> => {
  const profile = await ProfileModel.findOne({ userId });

  if (!profile) {
    throw new Error("Profile not found");
  }

  if (!profile.resumeAnalysis) {
    throw new Error(
      "Resume analysis not found. Please analyze your resume first.",
    );
  }

  const { skills, weaknesses, experienceSummary, strengths } =
    profile.resumeAnalysis;

  const systemMessage = `You are an expert career coach and learning path designer. Your task is to create a comprehensive mind map that helps candidates identify what topics they need to practice and improve based on their CV analysis.`;

  const prompt = `Based on the following CV analysis, create a detailed learning mind map that shows what topics the candidate needs to practice and improve.

CV Analysis:
- Skills: ${skills.join(", ")}
- Strengths: ${strengths.join(", ")}
- Weaknesses: ${weaknesses.join(", ")}
- Experience Summary: ${experienceSummary}

Create a mind map that:
1. Identifies skill gaps and areas for improvement
2. Suggests related topics to strengthen existing skills
3. Recommends complementary skills to learn
4. Organizes topics in a hierarchical structure
5. Focuses on practical, career-relevant learning paths

Return your response in the following JSON format:
{
  "title": "Learning Path for [Role/Focus Area]",
  "nodes": [
    {
      "id": "1",
      "label": "Main Category",
      "children": [
        {
          "id": "1.1",
          "label": "Subcategory",
          "children": [
            {
              "id": "1.1.1",
              "label": "Specific Topic"
            }
          ]
        }
      ]
    }
  ]
}

Guidelines:
- Create 3-5 main categories (e.g., "Technical Skills to Improve", "Soft Skills Development", "Domain Knowledge")
- Each main category should have 2-4 subcategories
- Each subcategory should have 2-5 specific topics
- Use clear, actionable labels
- Prioritize weaknesses and skill gaps identified in the CV

Return ONLY the JSON object, no additional text.`;

  return callGroqWithRetry(async () => {
    const content = await makeGroqChatCompletion(prompt, systemMessage);
    return parseGroqJsonResponse<IMindMapResponse>(
      content,
      "CV-Based Mind Map Generation",
    );
  }, "CV-Based Mind Map Generation");
};

export const generateTechnologyRoadmap = async (
  technology: string,
  experienceLevel?: string,
): Promise<IRoadmapResponse> => {
  if (!technology || technology.trim().length === 0) {
    throw new Error("Technology name is required");
  }

  const level = experienceLevel || "beginner";

  const systemMessage = `You are an expert technology educator and curriculum designer. Your task is to create comprehensive, practical learning roadmaps for various technologies that help developers progress from their current level to mastery.`;

  const prompt = `Create a detailed learning roadmap for ${technology} tailored for a ${level} level developer.

The roadmap should:
1. Be structured in progressive phases (e.g., Fundamentals, Intermediate, Advanced, Expert)
2. Include realistic time estimates for each phase
3. List specific topics to learn in each phase
4. Suggest practical resources (courses, documentation, projects)
5. Focus on hands-on, project-based learning
6. Include best practices and real-world applications

Return your response in the following JSON format:
{
  "technology": "${technology}",
  "phases": [
    {
      "phase": "Phase 1: Fundamentals",
      "duration": "2-4 weeks",
      "topics": [
        "Topic 1",
        "Topic 2",
        "Topic 3"
      ],
      "resources": [
        "Official documentation",
        "Recommended course or tutorial",
        "Practice project idea"
      ]
    }
  ]
}

Guidelines:
- Create 4-6 phases that build upon each other
- Each phase should have 4-8 specific topics
- Include 3-5 practical resources per phase
- Provide realistic duration estimates
- Focus on practical skills and real-world applications
- Consider current industry standards and best practices

Return ONLY the JSON object, no additional text.`;

  return callGroqWithRetry(async () => {
    const content = await makeGroqChatCompletion(prompt, systemMessage);
    return parseGroqJsonResponse<IRoadmapResponse>(
      content,
      "Technology Roadmap Generation",
    );
  }, "Technology Roadmap Generation");
};

export default {
  generateCVBasedMindMap,
  generateTechnologyRoadmap,
};
