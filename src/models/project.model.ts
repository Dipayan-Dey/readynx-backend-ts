import {model} from "mongoose";

// import { IProfile } from "../@types/interfaces/profile.interfaces";
// import ProfileSchema from "./schemaDefinitions/profile.schema";
// import ProfileSchema from "./schemaDefinitions/profile.schema";
import { IProject } from "../@types/interfaces/project.schema";
import projectSchema from "./schemaDefinitions/project.schema";
// const ProfileModel = model<IProject>('Profiles', projectSchema);

const ProjectModel = model<IProject>('Projects', projectSchema);

export default ProjectModel;