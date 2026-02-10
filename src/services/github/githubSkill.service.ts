// import Project from "../models/project.model";
// import UserSkill from "../models/userSkill.model";

import ProjectModel from "../../models/project.model";
import UserSkillModel from "../../models/userskill.model";

const getSkillLevelFromCommits = (commits: number): number => {
  if (commits <= 5) return 1;
  if (commits <= 15) return 2;
  if (commits <= 30) return 3;
  if (commits <= 60) return 4;
  return 5;
};

export const convertGithubProjectToSkill = async (userId: string) => {
  const project = await ProjectModel.findOne({ userId }).sort({ analyzedAt: -1 });
  if (!project) {
    throw new Error("No analyzed GitHub project found");
  }

  const skillName = project.primaryLanguage;
  const level = getSkillLevelFromCommits(project.totalCommits);
  const confidence = Math.min(1, project.totalCommits / 50);

  // 🔹 Upsert skill (important)
  const skill = await UserSkillModel.findOneAndUpdate(
    { userId, skillName, source: "github" },
    {
      level,
      confidence,
      lastUpdated: new Date(),
    },
    { upsert: true, new: true }
  );

  return skill;
};
