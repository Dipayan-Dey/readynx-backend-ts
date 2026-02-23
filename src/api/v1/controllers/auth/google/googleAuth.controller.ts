import { Request, Response } from "express";
import { googleLogin } from "../../../../../services/googleAuth.service";
import ProfileModel from "../../../../../models/profile.model";
// import { googleLogin } from "../services/googleAuth.service";

export const googleAuth = async (req: Request, res: Response) => {
  try {
    const { idToken } = req.body;

    if (!idToken) {
      return res.status(400).json({ message: "ID token required" });
    }

    const result = await googleLogin(idToken);

    let profile = await ProfileModel.findOne({ userId: result.user._id });

    if (!profile) {
      profile = await ProfileModel.create({
        userId: result.user._id,
        profileCompleted: false,
        githubConnected: false,
        linkedinConnected: false,
      });
    }

    return res.status(200).json({
      success: true,
      message: `${result.user.name} login successful`,
      token: result.token,
      user: result.user,
    });

  } catch (error: any) {
    console.error("Google Auth Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Google login failed",
    });
  }
};
