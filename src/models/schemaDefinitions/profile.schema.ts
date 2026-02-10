import { Schema } from "mongoose";
import { IProfile } from "../../@types/interfaces/profile.interfaces";
// import {IProfile} from '@types/interfaces/profile.interfaces';
import SCHEMA_DEFINATION_PROPERTIES from "../../constants/model/model.constant";
import { GENERAL_SCHEMA_OPTIONS } from "../../constants/model/schemaOption";

const ProfileSchema = new Schema<IProfile>(
  {
    userId: SCHEMA_DEFINATION_PROPERTIES.requiredObjectId,
    targetRole: SCHEMA_DEFINATION_PROPERTIES.optionalNullString,
    experienceLevel: {
      ...SCHEMA_DEFINATION_PROPERTIES.optionalNullString,
      enum: ["beginner", "intermediate", "advanced"],
    },
    resumeUrl: SCHEMA_DEFINATION_PROPERTIES.optionalNullString,
    resumeText: SCHEMA_DEFINATION_PROPERTIES.optionalNullString,
    githubUsername: SCHEMA_DEFINATION_PROPERTIES.optionalNullString,
    githubAccessToken: SCHEMA_DEFINATION_PROPERTIES.optionalNullString,
    githubConnected: {
      type: Boolean,
      default: false,
    },
    linkedinId: SCHEMA_DEFINATION_PROPERTIES.optionalNullString,
    linkedinAccessToken: SCHEMA_DEFINATION_PROPERTIES.optionalNullString,
    linkedinConnected: {
      type: Boolean,
      default: false,
    },
    profileCompleted: {
      type: Boolean,
      default: false,
    },
  },

  GENERAL_SCHEMA_OPTIONS,
);

export default ProfileSchema;