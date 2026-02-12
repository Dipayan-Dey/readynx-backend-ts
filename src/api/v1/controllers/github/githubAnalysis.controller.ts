import { Request, Response } from "express";
import ProfileModel from "../../../../models/profile.model";
import ProjectModel from "../../../../models/project.model";
import UserSkillModel from "../../../../models/userskill.model";
// import { fetchFullRepoData } from "../../../../services/github/githubApi.service";
import { generateAnalytics } from "../../../../services/github/githubAnalytics.service";
import { evaluateSkill } from "../../../../services/github/githubSkill.service";
import { fetchAllUserRepos, fetchFullRepoData } from "../../../../services/github/githubapi.service";

export const analyzeGithubRepo = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const { repoFullName } = req.body;

    if (!repoFullName) {
      return res.status(400).json({
        success: false,
        message: "Repository full name is required",
      });
    }

    const profile = await ProfileModel.findOne({ userId });

    if (!profile?.githubConnected) {
      return res.status(400).json({
        success: false,
        message: "GitHub not connected",
      });
    }

    if (!profile?.githubAccessToken) {
      return res.status(400).json({
        success: false,
        message: "GitHub access token missing",
      });
    }

    // ✅ CHECK EXISTING
    const existingProject = await ProjectModel.findOne({
      userId,
      repoFullName,
    });

    if (existingProject) {
      return res.status(200).json({
        success: true,
        message: "Repository already analyzed",
        projectId: existingProject._id,
      });
    }

    // 🔥 Fetch heavy GitHub data
    const rawData = await fetchFullRepoData(
      repoFullName,
      profile.githubAccessToken
    );

    const analytics = generateAnalytics(rawData);

    const savedProject = await ProjectModel.create({
      userId,
      ...analytics,
      repoFullName, // ✅ ADDED
      repoName: rawData.repoDetails.name,
      repoUrl: rawData.repoDetails.html_url,
    });

    const skill = evaluateSkill(analytics);

    await UserSkillModel.create({
      userId,
      projectId: savedProject._id,
      projectName: savedProject.repoName, // ✅ STORED HERE
      ...skill,
      evaluatedAt: new Date(),
    });

    return res.status(201).json({
      success: true,
      message: "Repository analyzed successfully",
      projectId: savedProject._id,
      projectName: savedProject.repoName,
      repoUrl: savedProject.repoUrl,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};



export const getAllGithubRepos = async (
  req: Request,
  res: Response
) => {
  try {
    const userId = (req as any).user.userId;

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = (req.query.search as string) || "";

    const profile = await ProfileModel.findOne({ userId });

    if (!profile?.githubConnected) {
      return res.status(400).json({
        success: false,
        message: "GitHub not connected",
      });
    }

    if (!profile?.githubAccessToken) {
      return res.status(400).json({
        success: false,
        message: "GitHub access token missing",
      });
    }

    const repos = await fetchAllUserRepos(profile.githubAccessToken);

    let formattedRepos = repos.map((repo: any) => ({
      id: repo.id,
      name: repo.name,
      fullName: repo.full_name,
      url: repo.html_url,
      description: repo.description,
      language: repo.language,
      stars: repo.stargazers_count,
      forks: repo.forks_count,
      private: repo.private,
      updatedAt: repo.updated_at,
    }));

    // 🔍 SEARCH FILTER
    if (search) {
      formattedRepos = formattedRepos.filter((repo: any) =>
        repo.name.toLowerCase().includes(search.toLowerCase())
      );
    }

    const total = formattedRepos.length;

    const start = (page - 1) * limit;
    const end = start + limit;

    const paginatedRepos = formattedRepos.slice(start, end);

    return res.status(200).json({
      success: true,
      message: "Repositories fetched successfully",

      page,
      limit,
      totalRecords: total,
      totalPages: Math.ceil(total / limit),

      repos: paginatedRepos, // ✅ NOT inside data
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch repositories",
      error: error.message,
    });
  }
};

