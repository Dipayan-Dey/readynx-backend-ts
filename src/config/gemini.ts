import { GoogleGenerativeAI } from "@google/generative-ai";

let genAI: GoogleGenerativeAI | null = null;
let geminiModelInstance: any = null;

const initializeGemini = () => {
  if (!genAI) {
    const apiKey = process.env.GEMINI_API_KEY;

    console.log("[Gemini Config] Initializing Gemini...");
    console.log("[Gemini Config] API Key exists:", !!apiKey);
    console.log("[Gemini Config] API Key length:", apiKey?.length || 0);

    if (!apiKey) {
      console.error("[Gemini Config] GEMINI_API_KEY not found in environment");
      console.error(
        "[Gemini Config] Available env keys:",
        Object.keys(process.env).filter((k) => k.includes("API")),
      );
      throw new Error("GEMINI_API_KEY is not defined in environment variables");
    }

    genAI = new GoogleGenerativeAI(apiKey);
    geminiModelInstance = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
    });
    console.log(
      "[Gemini Config] Gemini initialized successfully with gemini-2.5-flash",
    );
  }
  return geminiModelInstance;
};

export const geminiModel = {
  generateContent: (prompt: string) => {
    const model = initializeGemini();
    return model.generateContent(prompt);
  },
};

export default genAI;
