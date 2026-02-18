import { cleanJson } from "../../utils/jsonUtils";
import { makeGroqChatCompletion } from "../integrations/groq.service";
export async function generateFinalReport(transcript: any[]) {
  const systemMessage = `
You are an expert technical interviewer and career coach.
Return ONLY valid JSON.
`;

  const prompt = `
Based on this full interview transcript:

${JSON.stringify(transcript)}

Generate:

{
  "overallTechnicalScore": number,
  "communicationScore": number,
  "confidenceScore": number,
  "strengths": [],
  "improvementAreas": [],
  "roadmapSuggestion": []
}
`;

  const text = await makeGroqChatCompletion(prompt, systemMessage);

  return cleanJson(text);
}
