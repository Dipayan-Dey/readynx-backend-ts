// import { geminiModel } from "../config/gemini";

import { geminiModel } from "../../config/gemini";
import { cleanJson } from "../../utils/jsonUtils";

// import { cleanJson } from "../../utils/jsonUtils";

export const generateInterviewQuestionsFromAnalysis = async (analysis: any) => {
  const prompt = `
You are a senior technical interviewer.

Candidate Profile:
ATS Score: ${analysis.atsScore}
Skills: ${analysis.skills.join(", ")}
Strengths: ${analysis.strengths.join(", ")}
Weaknesses: ${analysis.weaknesses.join(", ")}
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

  const result = await geminiModel.generateContent(prompt);
  const response = await result.response;
  const text = response.text();

  return cleanJson(text);
};
