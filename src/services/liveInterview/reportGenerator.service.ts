// import { geminiModel } from "../config/gemini";

import { geminiModel } from "../../config/gemini";
import { cleanJson } from "../../utils/jsonUtils";

export async function generateFinalReport(transcript: any[]) {
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

  const result = await geminiModel.generateContent(prompt);
  const response = await result.response;
  const text = response.text();

  return cleanJson(text);
}
