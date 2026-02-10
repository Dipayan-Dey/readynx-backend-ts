import { Schema } from "mongoose";
import SCHEMA_DEFINATION_PROPERTIES from "../../constants/model/model.constant";
import { GENERAL_SCHEMA_OPTIONS } from "../../constants/model/schemaOption";
import { IUserSkill } from "../../@types/interfaces/userSkill.interface";

const userSkillSchema = new Schema<IUserSkill>(
  {
    userId: SCHEMA_DEFINATION_PROPERTIES.requiredObjectId,

    skillName: SCHEMA_DEFINATION_PROPERTIES.requiredString,

    level: {
      ...SCHEMA_DEFINATION_PROPERTIES.requiredNumber,
      min: 1,
      max: 5,
    },

    source: {
      ...SCHEMA_DEFINATION_PROPERTIES.requiredString,
      enum: ["github", "resume", "interview"],
    },

    confidence: {
      ...SCHEMA_DEFINATION_PROPERTIES.requiredNumber,
      min: 0,
      max: 1,
    },

    lastUpdated: SCHEMA_DEFINATION_PROPERTIES.requiredDate,
  },
  GENERAL_SCHEMA_OPTIONS
);

export default userSkillSchema;