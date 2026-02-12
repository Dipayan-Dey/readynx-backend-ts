export const evaluateSkill = (analytics: any) => {
  // Extract analytics data
  const languageStats = analytics.languageStats || {};
  const commitStats = analytics.commitStats || {};
  const collaborationStats = analytics.collaborationStats || {};
  const architectureStats = analytics.architectureStats || {};
  const activityStats = analytics.activityStats || {};

  // Core Skill Scores (0-100)
  const technicalDepthScore = 
    (languageStats.dominantLanguagePercent || 0) * 0.3 +
    (languageStats.multiLanguageScore || 0) * 0.2 +
    (commitStats.consistencyScore || 0) * 0.25 +
    ((commitStats.totalCommits || 0) / 10) * 0.25; // Scale commits

  const collaborationScore = 
    (collaborationStats.prMergeRate || 0) * 100 * 0.4 +
    (collaborationStats.issueResolutionRate || 0) * 100 * 0.3 +
    Math.min((collaborationStats.totalContributors || 1) * 10, 100) * 0.3;

  const consistencyScore = commitStats.consistencyScore || 0;

  const architectureScore = 
    (architectureStats.documentationScore || 0) * 0.4 +
    Math.min((architectureStats.releaseCount || 0) * 20, 100) * 0.3 +
    Math.min((architectureStats.branchCount || 0) * 10, 100) * 0.3;

  const maturityScore = activityStats.maintenanceScore || 0;

  // Language-Based Skill Levels
  const languageSkills: any[] = [];
  const languageBreakdown = languageStats.languageBreakdown || {};
  
  Object.entries(languageBreakdown).forEach(([lang, bytes]: [string, any]) => {
    const percentage = languageStats.dominantLanguagePercent || 0;
    const commits = commitStats.totalCommits || 0;
    
    // Determine level based on usage and commits
    let level: 1 | 2 | 3 | 4 | 5 = 1;
    if (commits > 500 && percentage > 70) level = 5;
    else if (commits > 200 && percentage > 50) level = 4;
    else if (commits > 100 && percentage > 30) level = 3;
    else if (commits > 50) level = 2;

    const confidence = Math.min((commits / 1000) + (percentage / 100), 1);
    const weightedScore = level * 20 * confidence;

    languageSkills.push({
      skillName: lang,
      level,
      confidence,
      weightedScore,
    });
  });

  // Engineering Skills
  const totalCommits = commitStats.totalCommits || 0;
  const branchCount = architectureStats.branchCount || 0;
  const releaseCount = architectureStats.releaseCount || 0;
  const prCount = collaborationStats.totalPRs || 0;
  const hasCI = architectureStats.hasCI || false;
  const hasTests = architectureStats.hasTests || false;

  // Git Workflow Level (1-5)
  let gitWorkflowLevel: 1 | 2 | 3 | 4 | 5 = 1;
  if (branchCount > 10 && prCount > 50 && releaseCount > 5) gitWorkflowLevel = 5;
  else if (branchCount > 5 && prCount > 20) gitWorkflowLevel = 4;
  else if (branchCount > 3 && prCount > 10) gitWorkflowLevel = 3;
  else if (branchCount > 1 || prCount > 5) gitWorkflowLevel = 2;

  // Testing Level (1-5)
  let testingLevel: 1 | 2 | 3 | 4 | 5 = 1;
  if (hasTests && totalCommits > 200) testingLevel = 5;
  else if (hasTests && totalCommits > 100) testingLevel = 4;
  else if (hasTests && totalCommits > 50) testingLevel = 3;
  else if (hasTests) testingLevel = 2;

  // CI/CD Level (1-5)
  let ciCdLevel: 1 | 2 | 3 | 4 | 5 = 1;
  if (hasCI && releaseCount > 10) ciCdLevel = 5;
  else if (hasCI && releaseCount > 5) ciCdLevel = 4;
  else if (hasCI && releaseCount > 2) ciCdLevel = 3;
  else if (hasCI) ciCdLevel = 2;

  // Code Quality Level (1-5)
  const avgCommitSize = commitStats.averageCommitSize || 0;
  const documentationScore = architectureStats.documentationScore || 0;
  let codeQualityLevel: 1 | 2 | 3 | 4 | 5 = 1;
  if (documentationScore > 80 && avgCommitSize < 500 && hasTests) codeQualityLevel = 5;
  else if (documentationScore > 60 && avgCommitSize < 1000) codeQualityLevel = 4;
  else if (documentationScore > 40) codeQualityLevel = 3;
  else if (documentationScore > 20) codeQualityLevel = 2;

  // Collaboration Level (1-5)
  const contributors = collaborationStats.totalContributors || 1;
  const prMergeRate = collaborationStats.prMergeRate || 0;
  let collaborationLevel: 1 | 2 | 3 | 4 | 5 = 1;
  if (contributors > 10 && prMergeRate > 0.8 && prCount > 50) collaborationLevel = 5;
  else if (contributors > 5 && prMergeRate > 0.6) collaborationLevel = 4;
  else if (contributors > 3 && prMergeRate > 0.4) collaborationLevel = 3;
  else if (contributors > 1 || prCount > 5) collaborationLevel = 2;

  // Gap Detection
  const gaps: string[] = [];
  const strengths: string[] = [];
  const improvementAreas: string[] = [];

  if (testingLevel < 3) gaps.push("Limited test coverage");
  else strengths.push("Good testing practices");

  if (ciCdLevel < 3) gaps.push("No CI/CD pipeline");
  else strengths.push("Automated deployment");

  if (collaborationLevel < 3) gaps.push("Limited team collaboration");
  else strengths.push("Strong collaboration skills");

  if (documentationScore < 50) gaps.push("Poor documentation");
  else strengths.push("Well documented code");

  if (consistencyScore < 50) improvementAreas.push("Improve commit consistency");
  if (branchCount < 3) improvementAreas.push("Use more branching strategies");
  if (releaseCount < 2) improvementAreas.push("Practice versioning and releases");

  // Overall Results
  const overallScore = (
    technicalDepthScore * 0.3 +
    collaborationScore * 0.2 +
    consistencyScore * 0.2 +
    architectureScore * 0.15 +
    maturityScore * 0.15
  );

  let overallLevel: 1 | 2 | 3 | 4 | 5 = 1;
  if (overallScore >= 80) overallLevel = 5;
  else if (overallScore >= 60) overallLevel = 4;
  else if (overallScore >= 40) overallLevel = 3;
  else if (overallScore >= 20) overallLevel = 2;

  // Career Readiness Index
  const careerReadinessIndex = (
    overallScore * 0.4 +
    (gitWorkflowLevel * 20) * 0.15 +
    (testingLevel * 20) * 0.15 +
    (ciCdLevel * 20) * 0.15 +
    (collaborationLevel * 20) * 0.15
  );

  const confidenceScore = Math.min(
    (totalCommits / 500) * 0.5 +
    (languageSkills.length / 5) * 0.25 +
    (contributors / 10) * 0.25,
    1
  );

  return {
    // Core Skill Scores
    technicalDepthScore,
    collaborationScore,
    consistencyScore,
    architectureScore,
    maturityScore,

    // Language Skills
    languageSkills,

    // Engineering Skills
    engineeringSkills: {
      gitWorkflowLevel,
      testingLevel,
      ciCdLevel,
      codeQualityLevel,
      collaborationLevel,
    },

    // Gap Detection
    gaps,
    strengths,
    improvementAreas,

    // Overall Results
    overallScore,
    overallLevel,
    careerReadinessIndex,
    confidenceScore,
  };
};