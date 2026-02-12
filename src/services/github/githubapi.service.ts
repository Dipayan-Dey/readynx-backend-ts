import axios from "axios";
import { GITHUB_URLS } from "../../constants/github/githubUrl";
// import { GITHUB_URLS } from "../../constants/github/githubUrls";

const getHeaders = (token: string) => ({
  Authorization: `Bearer ${token}`,
});

const paginate = async (
  urlGenerator: (page: number) => string,
  token: string,
) => {
  let page = 1;
  let results: any[] = [];

  while (true) {
    const { data } = await axios.get(urlGenerator(page), {
      headers: getHeaders(token),
    });

    if (!data || data.length === 0) break;

    results = [...results, ...data];
    page++;
  }

  return results;
};

const fetchStatsWithRetry = async (url: string, token: string) => {
  const headers = getHeaders(token);

  for (let i = 0; i < 6; i++) {
    const res = await axios.get(url, { headers });

    if (res.status === 200 && res.data) {
      return res.data;
    }

    await new Promise((r) => setTimeout(r, 2000));
  }

  return [];
};

export const fetchFullRepoData = async (
  repoFullName: string,
  token: string,
) => {
  const headers = getHeaders(token);

  const repoDetailsRes = await axios.get(
    GITHUB_URLS.repoDetails(repoFullName),
    { headers },
  );

  const defaultBranch = repoDetailsRes.data.default_branch;

  const [languagesRes, branchesRes, releasesRes, contributorsRes] =
    await Promise.all([
      axios.get(GITHUB_URLS.repoLanguages(repoFullName), { headers }),
      axios.get(GITHUB_URLS.repoBranches(repoFullName), { headers }),
      axios.get(GITHUB_URLS.repoReleases(repoFullName), { headers }),
      axios.get(GITHUB_URLS.repoContributors(repoFullName), { headers }),
    ]);

  let hasReadme = false;

  try {
    await axios.get(GITHUB_URLS.repoReadme(repoFullName), { headers });
    hasReadme = true;
  } catch {
    hasReadme = false;
  }

  let hasCI = false;

  try {
    const ciRes = await axios.get(GITHUB_URLS.repoCIWorkflows(repoFullName), {
      headers,
    });

    hasCI = Array.isArray(ciRes.data) && ciRes.data.length > 0;
  } catch {
    hasCI = false;
  }
  let hasTests = false;

  try {
    const treeRes = await axios.get(
      GITHUB_URLS.repoTree(repoFullName, defaultBranch),
      { headers },
    );

    hasTests = treeRes.data.tree.some(
      (file: any) =>
        file.path.includes("test") ||
        file.path.endsWith(".spec.ts") ||
        file.path.endsWith(".test.ts") ||
        file.path.endsWith(".spec.js") ||
        file.path.endsWith(".test.js"),
    );
  } catch {
    hasTests = false;
  }

  // 🔥 Retry stats
  const commitActivity = await fetchStatsWithRetry(
    GITHUB_URLS.repoCommitActivity(repoFullName),
    token,
  );

  const codeFrequency = await fetchStatsWithRetry(
    GITHUB_URLS.repoCodeFrequency(repoFullName),
    token,
  );

  const commits = await paginate(
    (page) => GITHUB_URLS.repoCommits(repoFullName, page),
    token,
  );

  const pulls = await paginate(
    (page) => GITHUB_URLS.repoPulls(repoFullName, page),
    token,
  );

  const issues = await paginate(
    (page) => GITHUB_URLS.repoIssues(repoFullName, page),
    token,
  );

  return {
    repoDetails: repoDetailsRes.data,
    languages: languagesRes.data,
    branches: branchesRes.data,
    releases: releasesRes.data,
    contributors: contributorsRes.data,
    commitActivity,
    codeFrequency,
    commits,
    pulls,
    issues,
    hasReadme,
    hasCI,
    hasTests,
  };
};

// import axios from "axios";
// import { GITHUB_URLS } from "../../constants/github/githubUrls";

// const getHeaders = (token: string) => ({
//   Authorization: `Bearer ${token}`,
// });

export const fetchAllUserRepos = async (token: string) => {
  let page = 1;
  let allRepos: any[] = [];

  while (true) {
    const { data } = await axios.get(GITHUB_URLS.userRepos, {
      headers: getHeaders(token),
      params: {
        per_page: 100,
        page,
        visibility: "all",
      },
    });

    if (!data || data.length === 0) break;

    allRepos = [...allRepos, ...data];
    page++;
  }

  return allRepos;
};
