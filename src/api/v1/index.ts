import { Router } from "express";
import authrouter from "./routes/auth.route";
import userrouter from "./routes/user.route";
import integrationrouter from "./routes/integrations.routes";
import githubrouter from "./routes/github.routes";
import resumeRouter from "./routes/resume.routes";
import resumeAnalysisRouter from "./routes/resumeAnalysis.routes";
import interviewRouter from "./routes/interview.routes";
import quizRouter from "./routes/quiz.routes";
import profileRouter from "./routes/profile.routes";
import chatbotRouter from "./routes/chatbot.routes";
import liveInterviewRoute from "./routes/liveInterview.route";
import mindmapRouter from "./routes/mindmap.routes";

const v1Router = Router();

v1Router.use("/auth", authrouter);
v1Router.use("/user", userrouter);
v1Router.use("/integrations", integrationrouter);
v1Router.use("/integrations/github", githubrouter);
v1Router.use("/profile/resume", resumeRouter);
v1Router.use("/profile/resume", resumeAnalysisRouter);
v1Router.use("/interviews", interviewRouter);
v1Router.use("/quizzes", quizRouter);
v1Router.use("/profile", profileRouter);
v1Router.use("/chatbot", chatbotRouter);
v1Router.use("/live-interview", liveInterviewRoute);
v1Router.use("/carrermap", mindmapRouter);

export default v1Router;
