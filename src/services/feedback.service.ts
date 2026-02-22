import { Feedback } from "../models/feedback.model";
import { IFeedback } from "../@types/interfaces/feedback.interface";
import UserModel from "../models/user.model";
import ProfileModel from "../models/profile.model";
import UserSkillModel from "../models/userskill.model";
import ProjectModel from "../models/project.model";
// import { User } from "../models/user.model";
// import { Profile } from "../models/profile.model";
// import { UserSkill } from "../models/userskill.model";
// import { Project } from "../models/project.model";

export class FeedbackService {
  async createFeedback(
    userId: string,
    rating: 1 | 2 | 3 | 4 | 5,
    message: string,
    mood?: {
      label: "Frustrated" | "Neutral" | "Good" | "Loving it";
      emoji: string;
    },
  ): Promise<IFeedback> {
    const newFeedback = new Feedback({
      userId,
      rating,
      message,
      mood,
      status: "new",
    });
    return await newFeedback.save();
  }

  async getAllFeedback(): Promise<any[]> {
    const feedbacks = await Feedback.find().sort({ createdAt: -1 }).lean();

    const feedbacksWithUserData = await Promise.all(
      feedbacks.map(async (feedback) => {
        const user = await UserModel.findById(feedback.userId).lean();
        const profile = await ProfileModel.findOne({
          userId: feedback.userId,
        }).lean();
        const skills = await UserSkillModel.find({
          userId: feedback.userId,
        }).lean();
        const projects = await ProjectModel.find({
          userId: feedback.userId,
        }).lean();

        return {
          feedback: {
            _id: feedback._id,
            rating: feedback.rating,
            mood: feedback.mood,
            message: feedback.message,
            status: feedback.status,
            createdAt: feedback.createdAt,
            updatedAt: feedback.updatedAt,
          },
          user: user
            ? {
                _id: user._id,
                name: user.name,
                email: user.email,
                createdAt: user.createdAt,
              }
            : null,
          profile: profile || null,
          skills: skills || [],
          projects: projects || [],
        };
      }),
    );

    return feedbacksWithUserData;
  }

  async getAllUsers(): Promise<any[]> {
    const users = await UserModel.find().lean();

    const usersWithData = await Promise.all(
      users.map(async (user) => {
        const userId = user._id.toString();
        const profile = await ProfileModel.findOne({ userId }).lean();
        const skills = await UserSkillModel.find({ userId }).lean();
        const projects = await ProjectModel.find({ userId }).lean();
        const feedbacks = await Feedback.find({ userId }).lean();

        return {
          user: {
            _id: user._id,
            name: user.name,
            email: user.email,
            createdAt: user.createdAt,
          },
          profile: profile || null,
          skills: skills || [],
          projects: projects || [],
          feedbacks: feedbacks || [],
        };
      }),
    );

    return usersWithData;
  }

  async getUserById(userId: string): Promise<any> {
    const user = await UserModel.findById(userId).lean();

    if (!user) {
      return null;
    }

    const userIdStr = user._id.toString();
    const profile = await ProfileModel.findOne({ userId: userIdStr }).lean();
    const skills = await UserSkillModel.find({ userId: userIdStr }).lean();
    const projects = await ProjectModel.find({ userId: userIdStr }).lean();
    const feedbacks = await Feedback.find({ userId: userIdStr }).lean();

    return {
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
      },
      profile: profile || null,
      skills: skills || [],
      projects: projects || [],
      feedbacks: feedbacks || [],
    };
  }
}
