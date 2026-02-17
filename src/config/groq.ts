import Groq from "groq-sdk";

// Initialize Groq client with API key from environment variables
const groqClient = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export default groqClient;
