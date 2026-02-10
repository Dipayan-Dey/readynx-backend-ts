import { Request, Response } from "express";
import axios from "axios";
// import Profile from "../../models/profile.model";
import ProfileModel from "../../../../models/profile.model";
import ProjectModel from "../../../../models/project.model";

export const getGithubRepos = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;

    const profile = await ProfileModel.findOne({ userId });
    if (!profile || !profile.githubConnected) {
      return res.status(400).json({ message: "GitHub not connected" });
    }

    const reposResponse = await axios.get(
      "https://api.github.com/user/repos",
      {
        headers: {
          Authorization: `Bearer ${profile.githubAccessToken}`,
        },
        params: {
          sort: "updated",
          per_page: 100,
          visibility: "all", // Include both public and private repos
        },
      }
    );

    const repos = reposResponse.data.map((repo: any) => ({
      name: repo.name,
      fullName: repo.full_name,
      url: repo.html_url,
      language: repo.language || "Unknown",
      description: repo.description,
      stars: repo.stargazers_count,
      updatedAt: repo.updated_at,
      private: repo.private, // Include private flag
    }));

    return res.status(200).json({
      success: true,
      data: repos,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch repos",
      error: error.message,
    });
  }
};

export const analyzeGithubRepo = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const { repoFullName } = req.body;

    const profile = await ProfileModel.findOne({ userId });
    if (!profile || !profile.githubConnected) {
      return res.status(400).json({ message: "GitHub not connected" });
    }

    // 🔹 Fetch commits
    const commitsResponse = await axios.get(
      `https://api.github.com/repos/${repoFullName}/commits`,
      {
        headers: {
          Authorization: `Bearer ${profile.githubAccessToken}`,
        },
      }
    );

    const commits = commitsResponse.data;
    const totalCommits = commits.length;
    const lastCommitDate =
      commits.length > 0
        ? new Date(commits[0].commit.author.date)
        : null;

    // 🔹 Fetch repo details
    const repoResponse = await axios.get(
      `https://api.github.com/repos/${repoFullName}`,
      {
        headers: {
          Authorization: `Bearer ${profile.githubAccessToken}`,
        },
      }
    );

    const repo = repoResponse.data;

    // 🔹 Save project
    const project = await ProjectModel.create({
      userId,
      repoName: repo.name,
      repoUrl: repo.html_url,
      primaryLanguage: repo.language || "Unknown",
      totalCommits,
      lastCommitDate,
    });

    return res.status(200).json({
      success: true,
      message: "Repository analyzed successfully",
      data: project,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: "Repository analysis failed",
      error: error.message,
    });
  }
};
