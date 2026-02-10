import {Types} from "mongoose"

export interface IUser {
     _id?: Types.ObjectId;
  name: string;
  email: string;
   password?: string;        
  googleId?: string | null;
   avatar?: string ;
  isEmailVerified?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
   
}