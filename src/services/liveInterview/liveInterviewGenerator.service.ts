import { cleanJson } from "../../utils/jsonUtils";
import { makeGroqChatCompletion } from "../integrations/groq.service";

export const generateInterviewQuestionsFromAnalysis = async (analysis: any) => {
  const systemMessage = `
You are a senior technical interviewer.
Generate structured, practical, non-generic interview questions.
Return ONLY valid JSON.
`;

  const prompt = `
Candidate Profile:
ATS Score: ${analysis.atsScore}
Skills: ${analysis.skills?.join(", ") || ""}
Strengths: ${analysis.strengths?.join(", ") || ""}
Weaknesses: ${analysis.weaknesses?.join(", ") || ""}
Experience Summary: ${analysis.experienceSummary}

Generate 10 interview questions:
- 3 basic
- 4 intermediate
- 3 advanced

Rules:
- Focus on candidate skills
- Ask practical scenario-based questions
- Avoid generic textbook questions
- Increase difficulty gradually

Return ONLY JSON format:
{
  "questions": []
}
`;

  const text = await makeGroqChatCompletion(prompt, systemMessage);

  return cleanJson(text);
};
