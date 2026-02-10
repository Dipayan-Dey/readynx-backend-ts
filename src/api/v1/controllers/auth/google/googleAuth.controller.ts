import { Request, Response } from "express";
import { googleLogin } from "../../../../../services/googleAuth.service";
import ProfileModel from "../../../../../models/profile.model";
// import { googleLogin } from "../services/googleAuth.service";

export const googleAuth = async (req: Request, res: Response) => {
  const { idToken } = req.body;

  if (!idToken) {
    return res.status(400).json({ message: "ID token required" });
  }
  

  const result = await googleLogin(idToken);

 const profile= await ProfileModel.create({
  userId: result.user._id,
  profileCompleted: false,
  githubConnected: false,
  linkedinConnected: false,
});
  res.status(200).json({
    success: true,
    message: `${result.user.name} login successful`,
    data: result,
    

  });
};
