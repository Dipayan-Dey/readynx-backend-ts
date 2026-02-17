import { Types } from "mongoose";
import ProfileModel from "../models/profile.model";
import { IProfile } from "../@types/interfaces/profile.interfaces";
import { IResumeUploadResult } from "../@types/interfaces/services.interface";
import {
  uploadResumeToCloudinary,
  deleteResumeFromCloudinary,
} from "./integrations/cloudinary.service";
import { extractTextFromPDF, extractTextFromDOCX } from "../utils/textExtraction";


export class ResumeService {

  async uploadResume(
    userId: Types.ObjectId,
    fileBuffer: Buffer,
    filename: string,
    mimetype: string
  ): Promise<IResumeUploadResult> {
    try {
 
      if (
        mimetype !== "application/pdf" &&
        mimetype !== "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      ) {
        throw new Error(`Unsupported file type: ${mimetype}`);
      }

    
      const uploadResult = await uploadResumeToCloudinary(fileBuffer, filename);
      const resumeUrl = uploadResult.url;


      let resumeText: string;
      
      if (mimetype === "application/pdf") {
        resumeText = await extractTextFromPDF(fileBuffer);
      } else {
        resumeText = await extractTextFromDOCX(fileBuffer);
      }

      await this.saveResumeToProfile(userId, resumeUrl, resumeText);

      return {
        resumeUrl,
        resumeText,
      };
    } catch (error) {
    
      if (error instanceof Error) {
        throw new Error(`Resume upload failed: ${error.message}`);
      }
      throw new Error("Resume upload failed: Unknown error");
    }
  }

  async getResumeDetails(
    userId: Types.ObjectId
  ): Promise<{ resumeUrl: string | null; resumeText: string | null } | null> {
    try {
      const profile = await ProfileModel.findOne({ userId }).select(
        "resumeUrl resumeText resumeUploadedAt"
      );

      if (!profile) {
        return null;
      }

      return {
        resumeUrl: profile.resumeUrl || null,
        resumeText: profile.resumeText || null,
      };
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to get resume details: ${error.message}`);
      }
      throw new Error("Failed to get resume details: Unknown error");
    }
  }

  
  async deleteResume(userId: Types.ObjectId): Promise<void> {
    try {
     
      const profile = await ProfileModel.findOne({ userId }).select("resumeUrl");

      if (!profile || !profile.resumeUrl) {
        throw new Error("No resume found for this user");
      }

      
      await deleteResumeFromCloudinary(profile.resumeUrl);

      // Remove resume data from profile
      await ProfileModel.updateOne(
        { userId },
        {
          $set: {
            resumeUrl: null,
            resumeText: null,
            resumeUploadedAt: null,
            resumeAnalysis: null,
            resumeAnalyzedAt: null,
          },
        }
      );
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to delete resume: ${error.message}`);
      }
      throw new Error("Failed to delete resume: Unknown error");
    }
  }

 
  async saveResumeToProfile(
    userId: Types.ObjectId,
    resumeUrl: string,
    resumeText: string
  ): Promise<IProfile> {
    try {
    
      const profile = await ProfileModel.findOneAndUpdate(
        { userId },
        {
          $set: {
            resumeUrl,
            resumeText,
            resumeUploadedAt: new Date(),
         
            resumeAnalysis: null,
            resumeAnalyzedAt: null,
          },
        },
        {
          new: true,
          upsert: true, 
          runValidators: true,
        }
      );

      if (!profile) {
        throw new Error("Failed to save resume to profile");
      }

      return profile;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to save resume to profile: ${error.message}`);
      }
      throw new Error("Failed to save resume to profile: Unknown error");
    }
  }
}


export default new ResumeService();
