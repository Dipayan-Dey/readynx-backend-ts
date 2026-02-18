
export const cleanJson = (text: string): any => {
  try {
    // Remove markdown code blocks if present
    const cleanText = text.replace(/```json\n?|\n?```/g, "").trim();
    return JSON.parse(cleanText);
  } catch (error) {
    console.error("JSON Parse Error:", error);
    console.error("Original Text:", text); // Log text for debugging
    throw new Error("Failed to parse AI response as JSON");
  }
};
