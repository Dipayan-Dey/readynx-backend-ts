import { Schema } from "mongoose";
import { IProject } from "../../@types/interfaces/project.schema";
import SCHEMA_DEFINATION_PROPERTIES from "../../constants/model/model.constant";
import { GENERAL_SCHEMA_OPTIONS } from "../../constants/model/schemaOption";
// import { IProject } from "../../@types/interfaces/project.interface";
// import SCHEMA_DEFINATION_PROPERTIES from "../../constants/model/model.constant";
// import { GENERAL_SCHEMA_OPTIONS } from "../../constants/model/schemaOption";

const projectSchema = new Schema<IProject>(
  {
    userId: SCHEMA_DEFINATION_PROPERTIES.requiredObjectId,
    repoName: SCHEMA_DEFINATION_PROPERTIES.requiredString,
    repoUrl: SCHEMA_DEFINATION_PROPERTIES.requiredString,
    primaryLanguage: SCHEMA_DEFINATION_PROPERTIES.requiredString,
    totalCommits: SCHEMA_DEFINATION_PROPERTIES.requiredNumber,
    lastCommitDate: {
      type: Date,
      default: null,
    },
    analyzedAt: {
      type: Date,
      default: Date.now,
    },
  },
  GENERAL_SCHEMA_OPTIONS
);

export default projectSchema;
