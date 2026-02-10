import {model} from "mongoose";
import { IUserSkill } from "../@types/interfaces/userSkill.interface";
import userSkillSchema from "./schemaDefinitions/userskill.schema";
const UserSkillModel = model<IUserSkill>('UserSkills', userSkillSchema);

export default UserSkillModel;