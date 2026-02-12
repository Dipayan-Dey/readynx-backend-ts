export const generateAnalytics = (raw: any) => {
  const languages = raw.languages as Record<string, number>;

  const totalBytes = Object.values(languages).reduce(
    (sum: number, value: number) => sum + value,
    0
  );

  const dominantLanguage = Object.keys(raw.languages).reduce((a, b) =>
    raw.languages[a] > raw.languages[b] ? a : b
  );

  const dominantPercent = totalBytes > 0 
    ? (raw.languages[dominantLanguage] / totalBytes) * 100 
    : 0;

  // Safe array handling
  const commits = Array.isArray(raw.commits) ? raw.commits : [];
  const commitActivity = Array.isArray(raw.commitActivity) ? raw.commitActivity : [];
  const codeFrequency = Array.isArray(raw.codeFrequency) ? raw.codeFrequency : [];
  const pulls = Array.isArray(raw.pulls) ? raw.pulls : [];
  const issues = Array.isArray(raw.issues) ? raw.issues : [];
  const releases = Array.isArray(raw.releases) ? raw.releases : [];
  const branches = Array.isArray(raw.branches) ? raw.branches : [];
  const contributors = Array.isArray(raw.contributors) ? raw.contributors : [];

  const totalCommits = commits.length;

  const activeWeeks = commitActivity.filter((w: any) => w?.total > 0).length;
  const repoAgeWeeks = commitActivity.length;
  const consistencyScore = repoAgeWeeks > 0 ? (activeWeeks / repoAgeWeeks) * 100 : 0;

  const totalAdditions = codeFrequency.reduce(
    (sum: number, w: any) => sum + (w?.[1] || 0),
    0
  );

  const totalDeletions = codeFrequency.reduce(
    (sum: number, w: any) => sum + Math.abs(w?.[2] || 0),
    0
  );

  const totalFilesChanged = commits.reduce(
    (sum: number, c: any) => sum + (c?.files?.length || 0),
    0
  );

  const averageCommitSize = totalCommits > 0 
    ? (totalAdditions + totalDeletions) / totalCommits 
    : 0;

  const commitDates = commits
    .map((c: any) => c?.commit?.author?.date)
    .filter(Boolean)
    .map((d: string) => new Date(d).getTime())
    .sort((a: number, b: number) => a - b);

  const firstCommitDate = commitDates.length > 0 ? new Date(commitDates[0]) : undefined;
  const lastCommitDate = commitDates.length > 0 ? new Date(commitDates[commitDates.length - 1]) : undefined;

  // Calculate longest inactive gap
  let longestGap = 0;
  for (let i = 1; i < commitDates.length; i++) {
    const gap = (commitDates[i] - commitDates[i - 1]) / (1000 * 60 * 60 * 24);
    if (gap > longestGap) longestGap = gap;
  }

  const commitFrequencyPerWeek = repoAgeWeeks > 0 ? totalCommits / repoAgeWeeks : 0;

  const codeVolumeScore = Math.min((totalAdditions / 10000) * 100, 100);

  const mergedPRs = pulls.filter((p: any) => p?.merged_at).length;
  const prMergeRate = pulls.length > 0 ? mergedPRs / pulls.length : 0;

  const issuesClosed = issues.filter((i: any) => i?.state === "closed").length;
  const issuesOpened = issues.length;
  const issueResolutionRate = issues.length > 0 ? issuesClosed / issues.length : 0;

  const collaborationScore =
    0.5 * prMergeRate * 100 + 0.5 * issueResolutionRate * 100;

  // Calculate user contribution percentage
  const totalContributions = contributors.reduce(
    (sum: number, c: any) => sum + (c?.contributions || 0),
    0
  );
  const userContributions = contributors[0]?.contributions || 0;
  const userContributionPercent = totalContributions > 0 
    ? (userContributions / totalContributions) * 100 
    : 100;

  // Architecture & Documentation
  const hasReadme = raw.repoDetails?.has_readme || false;
  const readmeLength = 0; // Can be calculated if you fetch README content
  const hasLicense = !!raw.repoDetails?.license;
  const hasCI = false; // Would need to check for .github/workflows or .gitlab-ci.yml
  const hasTests = false; // Would need to analyze file structure
  
  const documentationScore = 
    (hasReadme ? 40 : 0) +
    (hasLicense ? 30 : 0) +
    (raw.repoDetails?.description ? 30 : 0);

  const architectureScore =
    (releases.length > 0 ? 20 : 0) +
    (branches.length > 1 ? 20 : 0) +
    (hasCI ? 20 : 0) +
    (hasTests ? 20 : 0) +
    20;

  // Activity Stats
  const now = new Date();
  const lastActivity = lastCommitDate || now;
  const lastActivityDaysAgo = Math.floor(
    (now.getTime() - lastActivity.getTime()) / (1000 * 60 * 60 * 24)
  );

  const repoCreated = raw.repoDetails?.created_at 
    ? new Date(raw.repoDetails.created_at) 
    : new Date();
  const repoAgeMonths = Math.floor(
    (now.getTime() - repoCreated.getTime()) / (1000 * 60 * 60 * 24 * 30)
  );

  const activeRatio = repoAgeWeeks > 0 ? activeWeeks / repoAgeWeeks : 0;

  // Detect development bursts (simplified)
  const averageCommitsPerWeek = totalCommits / Math.max(repoAgeWeeks, 1);
  const peakWeekCommits = Math.max(...commitActivity.map((w: any) => w?.total || 0), 0);
  const developmentBurstScore = averageCommitsPerWeek > 0 
    ? Math.min((peakWeekCommits / averageCommitsPerWeek) * 20, 100) 
    : 0;

  const maintenanceScore = lastActivityDaysAgo < 30 ? 100 : 
                          lastActivityDaysAgo < 90 ? 70 :
                          lastActivityDaysAgo < 180 ? 40 : 20;

  // Calculate health index
  const healthIndex = (
    consistencyScore * 0.2 +
    collaborationScore * 0.15 +
    architectureScore * 0.15 +
    maintenanceScore * 0.15 +
    (issueResolutionRate * 100) * 0.15 +
    (prMergeRate * 100) * 0.1 +
    documentationScore * 0.1
  );

  // Determine maturity level
  let maturityLevel: 1 | 2 | 3 | 4 | 5 = 1;
  if (totalCommits > 500 && releases.length > 5 && hasCI && hasTests) maturityLevel = 5;
  else if (totalCommits > 200 && releases.length > 3) maturityLevel = 4;
  else if (totalCommits > 100 && releases.length > 1) maturityLevel = 3;
  else if (totalCommits > 50) maturityLevel = 2;

  const technicalDepthScore =
    0.25 * dominantPercent +
    0.2 * codeVolumeScore +
    0.2 * consistencyScore +
    0.15 * collaborationScore +
    0.1 * architectureScore +
    0.1 * maintenanceScore;

  // Language stats
  const totalLanguagesUsed = Object.keys(languages).length;
  const multiLanguageScore = Math.min(totalLanguagesUsed * 20, 100);

  return {
    // Basic repo info
    repoFullName: raw.repoDetails?.full_name || "",
    description: raw.repoDetails?.description || "",
    visibility: raw.repoDetails?.private ? "private" : "public",
    topics: raw.repoDetails?.topics || [],
    license: raw.repoDetails?.license?.name,
    isFork: raw.repoDetails?.fork || false,

    // Popularity metrics
    popularity: {
      stars: raw.repoDetails?.stargazers_count || 0,
      forks: raw.repoDetails?.forks_count || 0,
      watchers: raw.repoDetails?.watchers_count || 0,
      openIssues: raw.repoDetails?.open_issues_count || 0,
      sizeKB: raw.repoDetails?.size || 0,
    },

    // Language stats
    languageStats: {
      primaryLanguage: dominantLanguage,
      languageBreakdown: languages,
      dominantLanguagePercent: dominantPercent,
      totalLanguagesUsed,
      multiLanguageScore,
    },

    // Commit stats
    commitStats: {
      totalCommits,
      totalAdditions,
      totalDeletions,
      totalFilesChanged,
      averageCommitSize,
      firstCommitDate,
      lastCommitDate,
      commitFrequencyPerWeek,
      activeWeeks,
      longestInactiveGapDays: Math.round(longestGap),
      consistencyScore,
    },

    // Collaboration stats
    collaborationStats: {
      totalContributors: contributors.length,
      userContributionPercent,
      totalPRs: pulls.length,
      mergedPRs,
      prMergeRate,
      issuesOpened,
      issuesClosed,
      issueResolutionRate,
    },

    // Architecture stats
    architectureStats: {
      branchCount: branches.length,
      releaseCount: releases.length,
      hasReadme,
      readmeLength,
      hasLicense,
      hasCI,
      hasTests,
      documentationScore,
    },

    // Activity stats
    activityStats: {
      repoAgeMonths,
      lastActivityDaysAgo,
      activeRatio,
      maintenanceScore,
      developmentBurstScore,
    },

    // Final metrics
    healthIndex,
    maturityLevel,
  };
};