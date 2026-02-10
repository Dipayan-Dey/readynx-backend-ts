import ProjectModel from "../../../models/project.model";
import UserSkillModel from "../../../models/userskill.model";

/**
 * Maps commit count to skill level (1-5)
 * Rule-based mapping:
 * 0-5 commits → Level 1
 * 6-15 commits → Level 2
 * 16-30 commits → Level 3
 * 31-60 commits → Level 4
 * 60+ commits → Level 5
 */
const getSkillLevelFromCommits = (commits: number): number => {
  if (commits <= 5) return 1;
  if (commits <= 15) return 2;
  if (commits <= 30) return 3;
  if (commits <= 60) return 4;
  return 5;
};

/**
 * Converts the latest analyzed GitHub project into a normalized skill
 * @param userId - User's MongoDB ObjectId
 * @returns Created/updated UserSkill document
 */
export const convertGithubProjectToSkill = async (userId: string) => {
  // Get the most recently analyzed project
  const project = await ProjectModel.findOne({ userId }).sort({ analyzedAt: -1 });
  
  if (!project) {
    throw new Error("No analyzed GitHub project found");
  }

  const skillName = project.primaryLanguage;
  const level = getSkillLevelFromCommits(project.totalCommits);
  const confidence = Math.min(1, project.totalCommits / 50);

  // Upsert skill (update if exists, create if not)
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
