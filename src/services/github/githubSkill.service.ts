export const evaluateSkill = (analytics: any) => {
  // Extract analytics data
  const languageStats = analytics.languageStats || {};
  const commitStats = analytics.commitStats || {};
  const collaborationStats = analytics.collaborationStats || {};
  const architectureStats = analytics.architectureStats || {};
  const activityStats = analytics.activityStats || {};

  // Core Skill Scores (0-100)
  // Core Skill Scores (0-100)
  
  // Calculate Volume Score (Lines of Code / Complexity)
  const totalAdditions = commitStats.totalAdditions || 0;
  const volumeScore = Math.min((totalAdditions / 5000) * 100, 100); 

  const technicalDepthScore = 
    (languageStats.dominantLanguagePercent || 0) * 0.2 +
    (languageStats.multiLanguageScore || 0) * 0.1 +
    (commitStats.consistencyScore || 0) * 0.1 +
    volumeScore * 0.4 + // High weight on actual code written
    Math.min(((commitStats.totalCommits || 0) / 50) * 100, 100) * 0.2; // Lower commit threshold

  // Context-aware Collaboration Score
  let collaborationScoreRaw = 
    (collaborationStats.prMergeRate || 0) * 100 * 0.4 +
    (collaborationStats.issueResolutionRate || 0) * 100 * 0.3 +
    Math.min((collaborationStats.totalContributors || 1) * 10, 100) * 0.3;

  // Boost for Solo Developers who ship code
  if ((collaborationStats.totalContributors || 1) === 1 && totalAdditions > 2000) {
      collaborationScoreRaw = Math.max(collaborationScoreRaw, 85); // "Self-sufficient" bonus
  }
  const collaborationScore = Math.min(collaborationScoreRaw, 100);

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
    
    // Determine level based on usage and commits AND volume
    let level: 1 | 2 | 3 | 4 | 5 = 1;
    // Lower thresholds + include bytes check
    if ((commits > 100 || bytes > 50000) && percentage > 50) level = 5;
    else if ((commits > 50 || bytes > 20000) && percentage > 40) level = 4;
    else if ((commits > 20 || bytes > 5000) && percentage > 20) level = 3;
    else if (commits > 5 || bytes > 1000) level = 2;

    const confidence = 0.8 + (Math.min(commits / 50, 0.2)); // Baseline high confidence if we have data
    const weightedScore = level * 20;

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
  if (branchCount > 5 && prCount > 20) gitWorkflowLevel = 5;
  else if (branchCount > 2 || prCount > 5) gitWorkflowLevel = 4;
  else if (totalCommits > 50) gitWorkflowLevel = 3; // Commit volume implies workflow
  else if (totalCommits > 10) gitWorkflowLevel = 2;

  // Testing Level (1-5)
  let testingLevel: 1 | 2 | 3 | 4 | 5 = 1;
  if (hasTests && totalCommits > 100) testingLevel = 5;
  else if (hasTests) testingLevel = 4; 
  else if (totalAdditions > 10000) testingLevel = 2; // Assume some manual testing for large projects
  else testingLevel = 1;

  // CI/CD Level (1-5)
  let ciCdLevel: 1 | 2 | 3 | 4 | 5 = 1;
  if (hasCI && releaseCount > 5) ciCdLevel = 5;
  else if (hasCI) ciCdLevel = 4;
  else if (releaseCount > 1) ciCdLevel = 2; // Manual releases count for something

  // Code Quality Level (1-5)
  const avgCommitSize = commitStats.averageCommitSize || 0;
  const documentationScore = architectureStats.documentationScore || 0;
  let codeQualityLevel: 1 | 2 | 3 | 4 | 5 = 1;
  if (documentationScore > 60 && hasTests) codeQualityLevel = 5;
  else if (documentationScore > 40 || avgCommitSize < 5000) codeQualityLevel = 4; // Reasonable commit sizes
  else if (documentationScore > 20) codeQualityLevel = 3;
  else if (totalAdditions > 1000) codeQualityLevel = 2; // At least they wrote code

  // Collaboration Level (1-5)
  const contributors = collaborationStats.totalContributors || 1;
  const prMergeRate = collaborationStats.prMergeRate || 0;
  let collaborationLevel: 1 | 2 | 3 | 4 | 5 = 1;
  
  if (contributors == 1) {
      // Solo dev scaling
      if (totalCommits > 50) collaborationLevel = 5; // Self-managed well
      else if (totalCommits > 20) collaborationLevel = 4;
      else collaborationLevel = 3;
  } else {
      // Team scaling
      if (contributors > 5 && prMergeRate > 0.6) collaborationLevel = 5;
      else if (contributors > 2) collaborationLevel = 4;
      else collaborationLevel = 3;
  }

  // Gap Detection
  const gaps: string[] = [];
  const strengths: string[] = [];
  const improvementAreas: string[] = [];

  if (testingLevel < 3) gaps.push("Add automated tests"); // Softer language
  else strengths.push("Tests implemented");

  if (ciCdLevel < 3 && contributors > 1) gaps.push("Consider CI/CD"); // Only suggest for teams mostly
  else if (ciCdLevel >= 3) strengths.push("Automated pipeline");

  // Only penalize collaboration gap if it's actually a team project intent?
  // No, just frame it positively
  if (contributors > 1 && collaborationLevel < 3) gaps.push("Improve team coordination");
  else if (contributors === 1) strengths.push("Strong individual contribution");

  if (documentationScore < 30) gaps.push("Add a README");
  else strengths.push("Project documented");

  if (consistencyScore < 50) improvementAreas.push("Improve commit consistency");
  if (branchCount < 3) improvementAreas.push("Use more branching strategies");
  if (releaseCount < 2) improvementAreas.push("Practice versioning and releases");

  // Overall Results
  const overallScore = Math.min(
    technicalDepthScore * 0.35 + // Boosted
    collaborationScore * 0.15 + // Reduced
    consistencyScore * 0.15 + // Reduced
    architectureScore * 0.15 +
    maturityScore * 0.2,
    100
  );

  let overallLevel: 1 | 2 | 3 | 4 | 5 = 1;
  if (overallScore >= 80) overallLevel = 5;
  else if (overallScore >= 60) overallLevel = 4;
  else if (overallScore >= 40) overallLevel = 3;
  else if (overallScore >= 20) overallLevel = 2;

  // Career Readiness Index
  const careerReadinessIndex = Math.min(
    overallScore * 0.5 +
    (gitWorkflowLevel * 20) * 0.1 +
    (testingLevel * 20) * 0.1 +
    (ciCdLevel * 20) * 0.1 +
    (collaborationLevel * 20) * 0.2, // Collaboration is still important for career
    100
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