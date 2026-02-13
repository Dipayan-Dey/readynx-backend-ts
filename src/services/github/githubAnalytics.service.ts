export const generateAnalytics = (raw: any) => {
  const languages = raw.languages || {};

  const totalBytes = Object.values(languages).reduce(
    (sum: number, value: any) => sum + (typeof value === "number" ? value : 0),
    0
  );

  let dominantLanguage = "Unknown";
  let dominantPercent = 0;
  
  const languagePercentage: Record<string, number> = {};

  if (Object.keys(languages).length > 0) {
     dominantLanguage = Object.keys(languages).reduce((a, b) =>
      languages[a] > languages[b] ? a : b
    );
    
    dominantPercent = totalBytes > 0 
      ? (languages[dominantLanguage] / totalBytes) * 100 
      : 0;

    // Calculate percentages for all languages
    Object.keys(languages).forEach(lang => {
      languagePercentage[lang] = totalBytes > 0 
        ? parseFloat(((languages[lang] / totalBytes) * 100).toFixed(1)) 
        : 0;
    });
  }

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
  // Use map to ensure we process safe values
  const activityWeeks = commitActivity.length;
  const consistencyScore = activityWeeks > 0 ? (activeWeeks / activityWeeks) * 100 : 0;

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

  // Use repo created date for age calculation if commit history is short (due to pagination)
  // Logic: "repoAgeWeeks" from commitActivity comes from stats endpoint, so it covers full history despite pagination
  const repoAgeWeeks = commitActivity.length > 0 ? commitActivity.length : 1;
  
  const commitFrequencyPerWeek = repoAgeWeeks > 0 ? totalCommits / repoAgeWeeks : 0; // Note: totalCommits is capped at 500 now, so this might be lower than actual entire history. But stats endpoint might give total commits? No, we use `commits.length`. 
  // BETTER: Use stats total if available? `commitActivity` has weekly totals.
  const totalCommitsFromStats = commitActivity.reduce((sum: number, w: any) => sum + (w?.total || 0), 0);
  const effectiveTotalCommits = totalCommitsFromStats > totalCommits ? totalCommitsFromStats : totalCommits;
  
  const effectiveCommitFrequency = repoAgeWeeks > 0 ? effectiveTotalCommits / repoAgeWeeks : 0;


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
  const hasCI = raw.hasCI || false;
  const hasTests = raw.hasTests || false;
  
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
  const averageCommitsPerWeek = effectiveTotalCommits / Math.max(repoAgeWeeks, 1);
  const peakWeekCommits = Math.max(...commitActivity.map((w: any) => w?.total || 0), 0);
  const developmentBurstScore = averageCommitsPerWeek > 0 
    ? Math.min((peakWeekCommits / averageCommitsPerWeek) * 20, 100) 
    : 0;

  // Maintenance Score - be more lenient for "finished" projects
  const maintenanceScore = lastActivityDaysAgo < 30 ? 100 : 
                          lastActivityDaysAgo < 90 ? 80 :
                          lastActivityDaysAgo < 180 ? 60 : 
                          lastActivityDaysAgo < 365 ? 40 : 20;

  // Calculate health index
  // Ensure we have numbers
  const safeConsistency = isNaN(consistencyScore) ? 0 : consistencyScore;
  const safeCollaboration = isNaN(collaborationScore) ? 0 : collaborationScore;
  const safeArch = isNaN(architectureScore) ? 0 : architectureScore;
  const safeMaint = isNaN(maintenanceScore) ? 0 : maintenanceScore;
  const safeIssueRate = isNaN(issueResolutionRate) ? 0 : issueResolutionRate;
  const safePrRate = isNaN(prMergeRate) ? 0 : prMergeRate;
  const safeDoc = isNaN(documentationScore) ? 0 : documentationScore;

  // SOLO DEVELOPER ADJUSTMENT
  let adjustedCollaboration = safeCollaboration;
  let adjustedConsistency = safeConsistency;
  
  const isSolo = contributors.length === 1;
  if (isSolo) {
     // If solo, we care less about PRs/Issues and more about "Did they finish it?"
     // Boost collaboration score if they have reasonable commits (self-managed)
     if (effectiveTotalCommits > 10) adjustedCollaboration = 80; 
     else adjustedCollaboration = 50;

     // Boost consistency if they have a lot of code relative to time (burst of productivity is fine for solo)
     if (totalAdditions > 1000) adjustedConsistency = Math.max(safeConsistency, 80);
  }

  // VOLUME BOOSTER
  // If the project has significant code volume, ensure minimum health
  let volumeBonus = 0;
  if (totalAdditions > 10000) volumeBonus = 20;
  else if (totalAdditions > 2000) volumeBonus = 10;

  const rawHealthIndex = (
    adjustedConsistency * 0.25 + // Increased weight
    adjustedCollaboration * 0.10 + // Reduced weight
    safeArch * 0.15 +
    safeMaint * 0.15 +
    safeDoc * 0.15 + 
    volumeBonus // Add raw volume bonus
  ) + 20; // Base baseline boost to avoid "18%"

  const healthIndex = Math.min(Math.round(rawHealthIndex), 100);

  // Determine maturity level
  let maturityLevel: 1 | 2 | 3 | 4 | 5 = 1;
  // Adjusted thresholds for solo/small projects
  if (effectiveTotalCommits > 200 || totalAdditions > 50000) maturityLevel = 5;
  else if (effectiveTotalCommits > 100 || totalAdditions > 20000) maturityLevel = 4;
  else if (effectiveTotalCommits > 50 || totalAdditions > 5000) maturityLevel = 3;
  else if (effectiveTotalCommits > 10 || totalAdditions > 1000) maturityLevel = 2;

  // const technicalDepthScore =
  //   0.25 * dominantPercent +
  //   0.2 * codeVolumeScore +
  //   0.2 * consistencyScore +
  //   0.15 * collaborationScore +
  //   0.1 * architectureScore +
  //   0.1 * maintenanceScore;

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
      languagePercentage, // ✅ Added percentage map
      dominantLanguagePercent: dominantPercent,
      totalLanguagesUsed,
      multiLanguageScore,
    },

    // Commit stats
    commitStats: {
      totalCommits: effectiveTotalCommits, // Use the stats-based total
      totalAdditions,
      totalDeletions,
      totalFilesChanged,
      averageCommitSize,
      firstCommitDate,
      lastCommitDate,
      commitFrequencyPerWeek: effectiveCommitFrequency,
      activeWeeks,
      longestInactiveGapDays: Math.round(longestGap),
      consistencyScore: safeConsistency,
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