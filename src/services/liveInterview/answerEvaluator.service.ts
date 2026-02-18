import { cleanJson } from "../../utils/jsonUtils";
import { makeGroqChatCompletion } from "../integrations/groq.service";
export const evaluateAnswerWithContext = async (
  question: string,
  answer: string,
  analysis: any,
) => {
  const systemMessage = `
You are a senior technical interviewer conducting a live technical interview.
Be strict but fair. Return ONLY valid JSON.
`;

  const prompt = `
Candidate Skills: ${analysis.skills?.join(", ") || ""}
Strengths: ${analysis.strengths?.join(", ") || ""}
Weaknesses: ${analysis.weaknesses?.join(", ") || ""}

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

  const text = await makeGroqChatCompletion(prompt, systemMessage);

  return cleanJson(text);
};
