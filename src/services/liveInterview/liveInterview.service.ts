interface InterviewSession {
  userId: string;
  analysis: any;
  questions: string[];
  currentQuestionIndex: number;
  transcript: { question: string; answer: string; evaluation: any }[];
}

const sessions = new Map<string, InterviewSession>();

export const createInterviewSession = (
  sessionId: string,
  userId: string,
  analysis: any,
  questions: string[],
) => {
  sessions.set(sessionId, {
    userId,
    analysis,
    questions,
    currentQuestionIndex: 0,
    transcript: [],
  });
};

export const getInterviewSession = (sessionId: string) => {
  return sessions.get(sessionId);
};

export const updateInterviewSession = (
  sessionId: string,
  question: string,
  answer: string,
  evaluation: any,
) => {
  const session = sessions.get(sessionId);
  if (!session) return;

  session.transcript.push({ question, answer, evaluation });
  session.currentQuestionIndex += 1;
};
