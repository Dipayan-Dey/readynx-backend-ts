import { Schema } from "mongoose";
import { IProfile } from "../../@types/interfaces/profile.interfaces";
// import {IProfile} from '@types/interfaces/profile.interfaces';
import SCHEMA_DEFINATION_PROPERTIES from "../../constants/model/model.constant";
import { GENERAL_SCHEMA_OPTIONS } from "../../constants/model/schemaOption";
type TestProfile = IProfile;

const ProfileSchema = new Schema<IProfile>(
  {
    userId: SCHEMA_DEFINATION_PROPERTIES.requiredObjectId,
    targetRole: SCHEMA_DEFINATION_PROPERTIES.optionalNullString,
    experienceLevel: {
      ...SCHEMA_DEFINATION_PROPERTIES.optionalNullString,
      enum: ["beginner", "intermediate", "advanced"],
    },

    bio: {
 ...SCHEMA_DEFINATION_PROPERTIES.optionalNullString,
  trim: true,
},

location: {
  type: String,
  required: false,
  trim: true,
},

website: {
  type: String,
  required: false,
  trim: true,
},

phone: {
  type: String,
  required: false,
  trim: true,
},

skills: {
  type: [String],
  required: false,
  default: [],
},

    resumeUrl: SCHEMA_DEFINATION_PROPERTIES.optionalNullString,
    resumeText: SCHEMA_DEFINATION_PROPERTIES.optionalNullString,
    resumeUploadedAt: SCHEMA_DEFINATION_PROPERTIES.optionalDate,
    resumeAnalysis: {
      type: {
        atsScore: {
          type: Number,
          required: false,
          min: 0,
          max: 100,
        },
        suggestions: {
          type: [String],
          required: false,
          default: [],
        },
        skills: {
          type: [String],
          required: false,
          default: [],
        },
        experienceSummary: {
          type: String,
          required: false,
          trim: true,
        },
        strengths: {
          type: [String],
          required: false,
          default: [],
        },
        weaknesses: {
          type: [String],
          required: false,
          default: [],
        },
        analyzedAt: {
          type: Date,
          required: false,
        },
      },
      required: false,
      default: undefined,
    },
    resumeAnalyzedAt: SCHEMA_DEFINATION_PROPERTIES.optionalDate,
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
privacySettings: {
  type: {
    profileVisibility: {
      type: String,
      enum: ["public", "private"],
      default: "public",
    },
    showEmail: {
      type: Boolean,
      default: true,
    },
    showPhone: {
      type: Boolean,
      default: false,
    },
  },
  required: false,
  default: undefined,
},



  notificationPreferences: {
  type: {
    emailNotifications: {
      type: Boolean,
      default: true,
    },
    pushNotifications: {
      type: Boolean,
      default: false,
    },
  },
  required: false,
  default: undefined,
},



    
  } as any ,

  GENERAL_SCHEMA_OPTIONS,
);

export default ProfileSchema;