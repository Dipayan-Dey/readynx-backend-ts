import { Request, Response } from "express";
import { Types } from "mongoose";
import chatbotService from "../../../../services/chatbot.service";

export const sendMessage = async (req: Request, res: Response) => {
  try {
    const userId = new Types.ObjectId((req as any).user.userId);
    const { message } = req.body;

    // Validate message
    if (
      !message ||
      typeof message !== "string" ||
      message.trim().length === 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Message is required and must be a non-empty string",
      });
    }

    if (message.length > 2000) {
      return res.status(400).json({
        success: false,
        message: "Message is too long. Maximum 2000 characters allowed.",
      });
    }

    // Generate response
    const response = await chatbotService.generateResponse(userId, message);

    return res.status(200).json({
      success: true,
      data: {
        message: response,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error: any) {
    console.error("Error generating chatbot response:", error);

    // Handle specific errors
    if (error.message.includes("API key")) {
      return res.status(500).json({
        success: false,
        message: "Chatbot service configuration error",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to generate response",
      error: error.message,
    });
  }
};
