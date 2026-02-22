import { Request, Response } from "express";
import { FeedbackService } from "../../../../services/feedback.service";

const feedbackService = new FeedbackService();
interface AuthRequest extends Request {
  user?: {
    userId: string;
  };
}
export const submitFeedback = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { rating, message, mood } = req.body;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!rating || !message) {
      return res
        .status(400)
        .json({ message: "Rating and message are required" });
    }

    if (![1, 2, 3, 4, 5].includes(rating)) {
      return res
        .status(400)
        .json({ message: "Rating must be between 1 and 5" });
    }

    const newFeedback = await feedbackService.createFeedback(
      userId,
      rating,
      message,
      mood,
    );

    res.status(201).json({
      message: "Feedback submitted successfully",
      data: newFeedback,
    });
  } catch (error) {
    console.error("Error submitting feedback:", error);
    res.status(500).json({ message: "Failed to submit feedback" });
  }
};

export const getAllFeedback = async (req: Request, res: Response) => {
  try {
    const feedbacks = await feedbackService.getAllFeedback();

    res.status(200).json({
      message: "Feedbacks retrieved successfully",
      count: feedbacks.length,
      data: feedbacks,
    });
  } catch (error) {
    console.error("Error retrieving feedbacks:", error);
    res.status(500).json({ message: "Failed to retrieve feedbacks" });
  }
};

export const getAllUsersWithData = async (req: Request, res: Response) => {
  try {
    const users = await feedbackService.getAllUsers();

    res.status(200).json({
      message: "Users data retrieved successfully",
      count: users.length,
      data: users,
    });
  } catch (error) {
    console.error("Error retrieving users data:", error);
    res.status(500).json({ message: "Failed to retrieve users data" });
  }
};

export const getUserDataById = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    if (!userId || Array.isArray(userId)) {
      return res.status(400).json({ message: "Valid User ID is required" });
    }

    const userData = await feedbackService.getUserById(userId);

    if (!userData) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      message: "User data retrieved successfully",
      data: userData,
    });
  } catch (error) {
    console.error("Error retrieving user data:", error);
    res.status(500).json({ message: "Failed to retrieve user data" });
  }
};
