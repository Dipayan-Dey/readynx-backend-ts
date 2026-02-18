import { geminiModel } from "../../config/gemini";
import { cleanJson } from "../../utils/jsonUtils";

export const evaluateAnswerWithContext = async (
  question: string,
  answer: string,
  analysis: any,
) => {
  const prompt = `
You are conducting a live technical interview.

Candidate Skills: ${analysis.skills.join(", ")}
Strengths: ${analysis.strengths.join(", ")}
Weaknesses: ${analysis.weaknesses.join(", ")}

Question:
${question}

Candidate Answer:
${answer}

Evaluate strictly.

Return JSON:
{
  "technicalScore": number,
  "communicationScore": number,
  "confidenceScore": number,
  "missingConcepts": [],
  "improvementSuggestions": [],
  "followUpQuestion": ""
}
`;

  const result = await geminiModel.generateContent(prompt);
  const response = await result.response;
  const text = response.text();

  return cleanJson(text);
};
