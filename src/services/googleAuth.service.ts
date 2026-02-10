import { OAuth2Client } from "google-auth-library";
// import UserModel from "../models/user.model";
import { generateToken } from "../utils/token.utils";
import UserModel from "../models/user.model";
// import { generateToken } from "../utils/jwt";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export const googleLogin = async (idToken: string) => {
 
  const ticket = await client.verifyIdToken({
    idToken,
    audience: process.env.GOOGLE_CLIENT_ID,
  });

  const payload = ticket.getPayload();
  if (!payload) {
    throw new Error("Invalid Google token");
  }

  const { sub, email, name,picture  } = payload;

  
  let user = await UserModel.findOne({ email });

  if (!user) {
    user = await UserModel.create({
      name,
      email,
      googleId: sub,
      avatar: picture,  
      isEmailVerified: true,
    });
  }

 
  const token = generateToken({ userId: user._id.toString() });

  return { user, token };
};
