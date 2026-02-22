import { Router } from "express";
import authMiddleware from "../middleware/auth.middleware";
import { generalchatbot, sendMessage } from "../controllers/chatbot/chatbot.controller";

const chatbotRouter = Router();

// Send message to chatbot
chatbotRouter.post("/message", authMiddleware, sendMessage);
chatbotRouter.post("/general-chat",generalchatbot)

export default chatbotRouter;
