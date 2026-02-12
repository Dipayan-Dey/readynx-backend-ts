const GITHUB_BASE_URL = "https://api.github.com";

export const GITHUB_URLS = {
  userRepos: `${GITHUB_BASE_URL}/user/repos`,

  repoDetails: (repoFullName: string) =>
    `${GITHUB_BASE_URL}/repos/${repoFullName}`,

  repoLanguages: (repoFullName: string) =>
    `${GITHUB_BASE_URL}/repos/${repoFullName}/languages`,

  repoCommits: (repoFullName: string, page: number) =>
    `${GITHUB_BASE_URL}/repos/${repoFullName}/commits?per_page=100&page=${page}`,

  repoCommitActivity: (repoFullName: string) =>
    `${GITHUB_BASE_URL}/repos/${repoFullName}/stats/commit_activity`,

  repoCodeFrequency: (repoFullName: string) =>
    `${GITHUB_BASE_URL}/repos/${repoFullName}/stats/code_frequency`,

  repoContributors: (repoFullName: string) =>
    `${GITHUB_BASE_URL}/repos/${repoFullName}/contributors`,

  repoPulls: (repoFullName: string, page: number) =>
    `${GITHUB_BASE_URL}/repos/${repoFullName}/pulls?state=all&per_page=100&page=${page}`,

  repoIssues: (repoFullName: string, page: number) =>
    `${GITHUB_BASE_URL}/repos/${repoFullName}/issues?state=all&per_page=100&page=${page}`,

  repoBranches: (repoFullName: string) =>
    `${GITHUB_BASE_URL}/repos/${repoFullName}/branches`,

  repoReleases: (repoFullName: string) =>
    `${GITHUB_BASE_URL}/repos/${repoFullName}/releases`,

  repoReadme: (repoFullName: string) =>
  `${GITHUB_BASE_URL}/repos/${repoFullName}/readme`,

repoTree: (repoFullName: string, branch: string) =>
  `${GITHUB_BASE_URL}/repos/${repoFullName}/git/trees/${branch}?recursive=1`,

repoCIWorkflows: (repoFullName: string) =>
  `${GITHUB_BASE_URL}/repos/${repoFullName}/contents/.github/workflows`,

};
