import groqClient from "../../config/groq";
import {
  IGeminiAnalysisResponse,
  IGeminiInterviewQuestionsResponse,
  IGeminiAnswerEvaluationResponse,
  IGeminiQuizResponse,
} from "../../@types/interfaces/services.interface";

const RETRY_CONFIG = {
  maxRetries: 3,
  initialDelayMs: 1000,
  maxDelayMs: 10000,
  backoffMultiplier: 2,
};

const RETRYABLE_ERROR_CODES = [
  "rate_limit_exceeded",
  "server_error",
  "timeout",
  "network_error",
];

const sleep = (ms: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

const isRetryableError = (error: any): boolean => {
  if (error.code === "ECONNRESET" || error.code === "ETIMEDOUT") {
    return true;
  }

  if (error.status === 429 || error.status === 503 || error.status >= 500) {
    return true;
  }

  if (error.error?.code && RETRYABLE_ERROR_CODES.includes(error.error.code)) {
    return true;
  }

  return false;
};

export const callGroqWithRetry = async <T>(
  apiCall: () => Promise<T>,
  operationName: string,
): Promise<T> => {
  let lastError: Error | null = null;
  let delay = RETRY_CONFIG.initialDelayMs;

  for (let attempt = 0; attempt <= RETRY_CONFIG.maxRetries; attempt++) {
    try {
      const result = await apiCall();

      if (attempt > 0) {
        console.log(
          `[Groq API] ${operationName} succeeded on attempt ${attempt + 1}`,
        );
      }

      return result;
    } catch (error: any) {
      lastError = error instanceof Error ? error : new Error(String(error));

      const shouldRetry =
        attempt < RETRY_CONFIG.maxRetries && isRetryableError(error);

      if (!shouldRetry) {
        console.error(
          `[Groq API] ${operationName} failed (non-retryable or max retries reached):`,
          error,
        );
        throw new Error(
          `Groq API ${operationName} failed: ${lastError.message}`,
        );
      }

      console.warn(
        `[Groq API] ${operationName} failed on attempt ${attempt + 1}, retrying in ${delay}ms...`,
        error.message || error,
      );

      await sleep(delay);

      delay = Math.min(
        delay * RETRY_CONFIG.backoffMultiplier,
        RETRY_CONFIG.maxDelayMs,
      );
    }
  }

  throw new Error(
    `Groq API ${operationName} failed after ${RETRY_CONFIG.maxRetries + 1} attempts: ${lastError?.message}`,
  );
};

export const makeGroqChatCompletion = async (
  prompt: string,
  systemMessage?: string,
  model: string = "llama-3.3-70b-versatile",
): Promise<string> => {
  const messages: Array<{
    role: "system" | "user" | "assistant";
    content: string;
  }> = [];

  if (systemMessage) {
    messages.push({
      role: "system" as const,
      content: systemMessage,
    });
  }

  messages.push({
    role: "user" as const,
    content: prompt,
  });

  const completion = await groqClient.chat.completions.create({
    messages,
    model,
    temperature: 0.9, // Higher temperature for more creativity and randomness
    max_tokens: 2048,
  });

  const content = completion.choices[0]?.message?.content;

  if (!content) {
    throw new Error("No content received from Groq API");
  }

  return content;
};

export const parseGroqJsonResponse = <T>(
  content: string,
  operationName: string,
): T => {
  try {
    const jsonMatch = content.match(/```(?:json)?\s*(\{[\s\S]*\})\s*```/);
    const jsonString = jsonMatch ? jsonMatch[1] : content;

    return JSON.parse(jsonString.trim()) as T;
  } catch (error) {
    console.error(
      `[Groq API] Failed to parse JSON response for ${operationName}:`,
      content,
    );
    throw new Error(
      `Failed to parse Groq API response for ${operationName}: Invalid JSON format`,
    );
  }
};

export const analyzeResumeWithAI = async (
  resumeText: string,
): Promise<IGeminiAnalysisResponse> => {
  if (!resumeText || resumeText.trim().length === 0) {
    throw new Error("Resume text is required for analysis");
  }

  const systemMessage = `You are an expert resume analyzer and career advisor. Your task is to analyze resumes and provide detailed, actionable feedback to help candidates improve their job applications.`;

  const prompt = `Analyze the following resume and provide a comprehensive assessment in JSON format.

Resume Text:
${resumeText}

Please provide your analysis in the following JSON structure:
{
  "atsScore": <number between 0-100>,
  "suggestions": [<array of specific improvement suggestions>],
  "skills": [<array of technical and soft skills identified>],
  "experienceSummary": "<brief summary of work experience and career progression>",
  "strengths": [<array of key strengths and positive aspects>],
  "weaknesses": [<array of areas that need improvement>]
}

Guidelines:
- atsScore: Rate how well the resume would perform in Applicant Tracking Systems (0-100)
- suggestions: Provide 3-5 specific, actionable recommendations for improvement
- skills: Extract all technical skills, tools, technologies, and relevant soft skills
- experienceSummary: Write a 2-3 sentence summary of the candidate's experience
- strengths: Identify 3-5 strong points in the resume
- weaknesses: Identify 3-5 areas that could be improved

Return ONLY the JSON object, no additional text.`;

  return callGroqWithRetry(async () => {
    const content = await makeGroqChatCompletion(prompt, systemMessage);
    return parseGroqJsonResponse<IGeminiAnalysisResponse>(
      content,
      "Resume Analysis",
    );
  }, "Resume Analysis");
};

export const generateInterviewQuestions = async (
  resumeText?: string,
  githubProjects?: Array<{
    repoName: string;
    description?: string;
    primaryLanguage: string;
    topics: string[];
  }>,
  targetRole?: string,
  experienceLevel?: string,
): Promise<IGeminiInterviewQuestionsResponse> => {
  const contextParts: string[] = [];

  if (targetRole) {
    contextParts.push(`Target Role: ${targetRole}`);
  }

  if (experienceLevel) {
    contextParts.push(`Experience Level: ${experienceLevel}`);
  }

  if (resumeText && resumeText.trim().length > 0) {
    contextParts.push(`\nResume Content:\n${resumeText}`);
  }

  if (githubProjects && githubProjects.length > 0) {
    const projectsSummary = githubProjects
      .map((project) => {
        const parts = [
          `- ${project.repoName}`,
          project.description ? `: ${project.description}` : "",
          project.primaryLanguage ? ` (${project.primaryLanguage})` : "",
          project.topics.length > 0 ? ` [${project.topics.join(", ")}]` : "",
        ];
        return parts.join("");
      })
      .join("\n");

    contextParts.push(`\nGitHub Projects:\n${projectsSummary}`);
  }

  if (contextParts.length === 0) {
    throw new Error(
      "Insufficient data to generate interview questions. Please provide at least resume text, GitHub projects, or target role.",
    );
  }

  const systemMessage = `You are an expert technical interviewer with deep knowledge across various technology domains and experience levels. Your task is to generate relevant, insightful interview questions that assess both technical skills and problem-solving abilities.`;

  // Add timestamp to ensure different questions each time
  const timestamp = new Date().toISOString();
  const randomSeed = Math.floor(Math.random() * 10000);

  const prompt = `Based on the following candidate information, generate a UNIQUE and VARIED list of relevant interview questions that would be appropriate for their background and target role.

${contextParts.join("\n")}

IMPORTANT: Generate a FRESH set of questions that are different from previous sessions. Use creative variety in your question selection.
Session ID: ${timestamp}-${randomSeed}

Please generate 8-10 interview questions that:
1. Are tailored to the candidate's experience level (${experienceLevel || "not specified"})
2. Cover technical skills mentioned in their resume and projects
3. Include a mix of technical knowledge, problem-solving, and behavioral questions
4. Are relevant to the target role (${targetRole || "general software development"})
5. Progress from foundational to more advanced topics
6. Include questions about specific technologies or projects mentioned
7. Are DIFFERENT from typical interview questions - be creative and varied

Return your response in the following JSON format:
{
  "questions": [
    "Question 1 text here",
    "Question 2 text here",
    ...
  ]
}

Return ONLY the JSON object, no additional text.`;

  return callGroqWithRetry(async () => {
    const content = await makeGroqChatCompletion(prompt, systemMessage);
    return parseGroqJsonResponse<IGeminiInterviewQuestionsResponse>(
      content,
      "Interview Question Generation",
    );
  }, "Interview Question Generation");
};

export const evaluateInterviewAnswer = async (
  question: string,
  answer: string,
): Promise<IGeminiAnswerEvaluationResponse> => {
  if (!question || question.trim().length === 0) {
    throw new Error("Question is required for answer evaluation");
  }

  if (!answer || answer.trim().length === 0) {
    throw new Error("Answer is required for evaluation");
  }

  const systemMessage = `You are an expert technical interviewer and career coach. Your task is to evaluate interview answers and provide constructive, actionable feedback that helps candidates improve their interview performance.`;

  const prompt = `Evaluate the following interview answer and provide detailed feedback.

Interview Question:
${question}

Candidate's Answer:
${answer}

Please evaluate the answer and provide your assessment in the following JSON format:
{
  "feedback": "<detailed feedback on the answer quality, strengths, and areas for improvement>",
  "score": <number between 0-10>
}

Guidelines for evaluation:
- score: Rate the answer quality from 0-10 where:
  * 0-3: Poor answer (incomplete, incorrect, or off-topic)
  * 4-5: Below average (partially correct but missing key points)
  * 6-7: Good answer (correct and covers main points)
  * 8-9: Excellent answer (comprehensive, well-structured, demonstrates deep understanding)
  * 10: Outstanding answer (exceptional clarity, depth, and insight)

- feedback: Provide 3-5 sentences that:
  * Acknowledge what the candidate did well
  * Identify specific areas for improvement
  * Suggest how to strengthen the answer
  * Be constructive and encouraging

Return ONLY the JSON object, no additional text.`;

  return callGroqWithRetry(async () => {
    const content = await makeGroqChatCompletion(prompt, systemMessage);
    return parseGroqJsonResponse<IGeminiAnswerEvaluationResponse>(
      content,
      "Answer Evaluation",
    );
  }, "Answer Evaluation");
};

export const generateTechnicalQuiz = async (
  skills?: string[],
  technologies?: string[],
  targetRole?: string,
  questionCount: number = 10,
): Promise<IGeminiQuizResponse> => {
  const contextParts: string[] = [];

  if (targetRole) {
    contextParts.push(`Target Role: ${targetRole}`);
  }

  if (skills && skills.length > 0) {
    contextParts.push(`Skills: ${skills.join(", ")}`);
  }

  if (technologies && technologies.length > 0) {
    contextParts.push(`Technologies: ${technologies.join(", ")}`);
  }

  if (contextParts.length === 0) {
    throw new Error(
      "Insufficient data to generate quiz. Please provide at least skills, technologies, or target role.",
    );
  }

  const systemMessage = `You are an expert technical quiz creator with deep knowledge across various technology domains. Your task is to generate challenging yet fair multiple-choice questions that assess technical knowledge and problem-solving abilities.`;

  const prompt = `Based on the following candidate information, generate a technical quiz with ${questionCount} multiple-choice questions.

${contextParts.join("\n")}

Please generate ${questionCount} multiple-choice questions that:
1. Cover the skills and technologies mentioned
2. Are relevant to the target role (${targetRole || "general software development"})
3. Range from fundamental concepts to more advanced topics
4. Have 4 answer options each (A, B, C, D)
5. Have exactly one correct answer per question
6. Are clear, unambiguous, and technically accurate
7. Test practical knowledge and understanding, not just memorization

Return your response in the following JSON format:
{
  "questions": [
    {
      "question": "Question text here",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": "Option A"
    },
    ...
  ]
}

Important:
- Each question must have exactly 4 options
- The correctAnswer must be one of the options (exact match)
- Questions should be diverse and cover different aspects of the skills/technologies
- Return ONLY the JSON object, no additional text

Return ONLY the JSON object, no additional text.`;

  return callGroqWithRetry(async () => {
    const content = await makeGroqChatCompletion(prompt, systemMessage);
    const response = parseGroqJsonResponse<IGeminiQuizResponse>(
      content,
      "Quiz Generation",
    );

    if (!response.questions || !Array.isArray(response.questions)) {
      throw new Error("Invalid quiz response: questions array is missing");
    }

    response.questions.forEach((q, index) => {
      if (!q.question || typeof q.question !== "string") {
        throw new Error(
          `Invalid question at index ${index}: question text is missing`,
        );
      }
      if (!Array.isArray(q.options) || q.options.length !== 4) {
        throw new Error(
          `Invalid question at index ${index}: must have exactly 4 options`,
        );
      }
      if (!q.correctAnswer || typeof q.correctAnswer !== "string") {
        throw new Error(
          `Invalid question at index ${index}: correctAnswer is missing`,
        );
      }
      if (!q.options.includes(q.correctAnswer)) {
        throw new Error(
          `Invalid question at index ${index}: correctAnswer must be one of the options`,
        );
      }
    });

    return response;
  }, "Quiz Generation");
};
