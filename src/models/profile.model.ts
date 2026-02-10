import {model} from "mongoose";

import { IProfile } from "../@types/interfaces/profile.interfaces";
// import ProfileSchema from "./schemaDefinitions/profile.schema";
import ProfileSchema from "./schemaDefinitions/profile.schema";
const ProfileModel = model<IProfile>('Profiles', ProfileSchema);

export default ProfileModel;