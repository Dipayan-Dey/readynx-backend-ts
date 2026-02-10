import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import UserModel from "../../../../../models/user.model";
import { hashPassword } from "../../../../../utils/password";
import ProfileModel from "../../../../../models/profile.model";


export const signup = async (req: Request, res: Response) => {
  const { name, email, password } = req.body;

  const existingUser = await UserModel.findOne({ email });
  if (existingUser) {
    return res.status(409).json({ message: "User already exists" });
  }

  const hashedPassword = await hashPassword(password);

  const user = await UserModel.create({
   name,
    email,
    password: hashedPassword,
    isEmailVerified: false,
  });
  
  await ProfileModel.create({
  userId: user._id,
  profileCompleted: false,
  githubConnected: false,
  linkedinConnected: false,
});

  res.status(201).json({
    message: "User created",
    userId: user._id,
  });
};
