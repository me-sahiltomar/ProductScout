import { ResearchRun } from '@/types';

export class ReportGenerator {
  public generateMarkdownReport(run: ResearchRun): string {
    const { config, coverage, problems, clusters, existingSolutions, gaps, opportunities, weakSignals, classifiedEvidence } = run;

    const lines: string[] = [];

    lines.push(`# ProductScout: Problem & Opportunity Report`);
    lines.push(`**Tagline**: *Discovers real problems and identifies software products worth building.*`);
    lines.push(`**Research Topic**: "${config.topic}"`);
    lines.push(`**Date Generated**: ${new Date(run.createdAt).toLocaleString()} | **Timeframe**: ${coverage.dateRange}`);
    if (config.focus) lines.push(`**Specific Focus**: *${config.focus}*`);
    if (config.targetUser) lines.push(`**Target Customer Filter**: ${config.targetUser}`);
    lines.push(``);
    lines.push(`---`);
    lines.push(``);

    // 1. Executive Summary
    lines.push(`## Executive Summary`);
    lines.push(`ProductScout investigated real-world user signals across public communities to identify evidence-backed operational friction in **"${config.topic}"**.`);
    lines.push(`- **Total Sources Evaluated**: ${coverage.sourcesCollectedCount} posts & discussions across ${coverage.sourcesSucceeded.length} active platforms.`);
    lines.push(`- **Verified Core Problems**: ${problems.length} distinct recurring pain points identified.`);
    lines.push(`- **Major Problem Clusters**: ${clusters.length} operational clusters detected.`);
    lines.push(`- **High-Confidence Opportunities**: ${opportunities.length} narrow product opportunities formulated with concrete validation tests.`);
    lines.push(`- **Weak Signals Segregated**: ${weakSignals.length} unverified or single-source signals routed to observation.`);
    lines.push(``);

    // 2. Research Coverage
    lines.push(`## Research Coverage`);
    lines.push(`- **Sources Searched**: ${coverage.sourcesSearched.join(', ') || 'Reddit, Hacker News, GitHub, Dev.to, Web'}`);
    lines.push(`- **Sources Successfully Collected**: ${coverage.sourcesCollectedCount} raw signals`);
    lines.push(`- **Active Platforms**: ${coverage.sourcesSucceeded.join(', ')}`);
    if (coverage.sourcesUnavailable.length > 0) {
      lines.push(`- **Sources Unavailable / Limited**:`);
      coverage.sourcesUnavailable.forEach(u => {
        lines.push(`  - *${u.platform}*: ${u.reason}`);
      });
    }
    lines.push(`- **Evidence Quality Distribution**:`);
    lines.push(`  - High Quality (First-hand operator complaints): ${coverage.qualityDistribution.high}`);
    lines.push(`  - Medium Quality (Community discussions & requests): ${coverage.qualityDistribution.medium}`);
    lines.push(`  - Low / Demoted (Generic or promotional): ${coverage.qualityDistribution.low}`);
    lines.push(``);

    // 3. Evidence Landscape
    lines.push(`## Evidence Landscape`);
    lines.push(`Here are representative first-hand user signals discovered from operators and practitioners:`);
    lines.push(``);
    classifiedEvidence.slice(0, 5).forEach((ev) => {
      lines.push(`> "${ev.painQuote || ev.snippet}"`);
      lines.push(`> — **${ev.author || 'User'}** on [${ev.platform.toUpperCase()}: ${ev.title}](${ev.url}) *(Quality: ${ev.quality}, Score: ${ev.qualityScore}/100)*`);
      lines.push(``);
    });

    // 4. Top Recurring Problems
    lines.push(`## Top Recurring Problems`);
    problems.forEach((p, idx) => {
      lines.push(`### Problem ${idx + 1}: ${p.problemStatement}`);
      lines.push(`- **Target User**: ${p.targetUser}`);
      lines.push(`- **Job / Workflow Involved**: ${p.jobWorkflow}`);
      lines.push(`- **Why Painful**: ${p.whyPainful}`);
      lines.push(`- **Current Workaround**: ${p.currentWorkaround}`);
      lines.push(`- **Recurrence / Frequency**: ${p.frequency}`);
      lines.push(`- **Independent Signals**: ${p.signalCount} verified sources (Confidence: ${p.confidence}%)`);
      lines.push(`- **User Evidence**:`);
      p.evidenceQuotes.forEach(q => {
        lines.push(`  - *"${q.quote}"* — [${q.platform.toUpperCase()}](${q.sourceUrl})`);
      });
      lines.push(``);
    });

    // 5. Problem Clusters
    lines.push(`## Problem Clusters`);
    clusters.forEach(c => {
      lines.push(`### Cluster: ${c.clusterName}`);
      lines.push(`- **Problems Included**: ${c.problemIds.length} sub-problems`);
      lines.push(`- **Total Independent Signals**: ${c.signalCount} across ${c.sourceDiversity} platforms`);
      lines.push(`- **Common Affected Users**: ${c.commonAffectedUsers}`);
      lines.push(`- **Common Workflow**: ${c.commonWorkflow}`);
      lines.push(`- **Evidence Strength**: **${c.overallEvidenceStrength}**`);
      lines.push(``);
    });

    // 6. Existing Solutions
    lines.push(`## Existing Solutions & Current Workarounds`);
    existingSolutions.forEach(sol => {
      lines.push(`### ${sol.name} (${sol.type.replace('_', ' ').toUpperCase()})`);
      lines.push(`- **What Users Currently Do**: ${sol.whatUsersDo}`);
      lines.push(`- **Positive Aspects**: ${sol.positiveAspects.join(', ')}`);
      lines.push(`- **User Complaints**: ${sol.complaints.join('; ')}`);
      lines.push(`- **Missing Functionality**: ${sol.missingFunctionality.join('; ')}`);
      if (sol.pricingInfo) lines.push(`- **Pricing Context**: ${sol.pricingInfo}`);
      lines.push(`- **Friction Points**: ${sol.complexityFriction}`);
      lines.push(`- **Underserved Segments**: ${sol.unservedSegments}`);
      lines.push(``);
    });

    // 7. Gaps
    lines.push(`## Evidence-Backed Market Gaps`);
    gaps.forEach((gap, idx) => {
      lines.push(`### Gap ${idx + 1}: ${gap.title}`);
      lines.push(`- **Gap Type**: \`${gap.gapType}\``);
      lines.push(`- **Status**: ${gap.isAiInference ? '⚠️ **[AI Inference / Market Observation]**' : '✅ **[Evidence-Backed]**'}`);
      lines.push(`- **Description**: ${gap.description}`);
      if (gap.supportingQuotes.length > 0) {
        lines.push(`- **Supporting Quotes**:`);
        gap.supportingQuotes.forEach(q => lines.push(`  - *"${q}"*`));
      }
      lines.push(``);
    });

    // 8. Product Opportunities
    lines.push(`## Product Opportunities`);
    opportunities.forEach((opp, idx) => {
      lines.push(`### Opportunity ${idx + 1}: ${opp.name}`);
      lines.push(`*${opp.oneLineDescription}*`);
      lines.push(``);
      lines.push(`- **Target Customer**: ${opp.targetCustomer}`);
      lines.push(`- **User Problem**: ${opp.userProblem}`);
      lines.push(`- **Evidence Summary**: ${opp.evidenceSummary}`);
      lines.push(`- **Existing Alternatives**: ${opp.existingAlternatives}`);
      lines.push(`- **Identified Gap**: ${opp.gap}`);
      lines.push(`- **Proposed Solution**: ${opp.proposedSolution}`);
      lines.push(`- **Core Workflow**: ${opp.coreWorkflow}`);
      lines.push(`- **Why Useful**: ${opp.whyUseful}`);
      lines.push(`- **Technical Complexity**: ${opp.technicalComplexity}`);
      lines.push(`- **Estimated Build Time**: ${opp.estimatedMvpBuildTime}`);
      lines.push(`- **Monetization**: ${opp.monetizationPossibilities.join(', ')}`);
      lines.push(`- **Distribution Difficulty**: ${opp.distributionDifficulty}`);
      lines.push(`- **Evidence Confidence**: **${opp.evidenceConfidence}%**`);
      lines.push(``);
    });

    // 9. MVP Build Profiles
    lines.push(`## MVP Build Profiles`);
    opportunities.forEach(opp => {
      const mvp = opp.mvpProfile;
      lines.push(`### MVP Profile: ${opp.name}`);
      lines.push(`- **Complexity**: ${mvp.complexity} | **Estimated Build Time**: ${mvp.estimatedBuildTime}`);
      lines.push(`- **Must-Have Core Scope**:`);
      opp.mvpScope.forEach(item => lines.push(`  - [x] ${item}`));
      lines.push(`- **What NOT to Build Initially (Anti-Scope)**:`);
      opp.whatNotToBuildInitially.forEach(item => lines.push(`  - [ ] ⛔ ${item}`));
      lines.push(`- **Key Dependencies**: ${mvp.requiredIntegrations.join(', ')}`);
      lines.push(`- **AI Requirements**: ${mvp.aiRequirements}`);
      lines.push(`- **Main Technical Risks**: ${mvp.mainTechnicalRisks.join('; ')}`);
      lines.push(`- **Main Business Risks**: ${mvp.mainBusinessRisks.join('; ')}`);
      lines.push(``);
    });

    // 10. Validation Experiments
    lines.push(`## Validation Experiments`);
    opportunities.forEach(opp => {
      const exp = opp.validationExperiment;
      lines.push(`### Validation Plan: ${opp.name}`);
      lines.push(`- **Hypothesis**: ${exp.hypothesis}`);
      lines.push(`- **Concrete Test**: ${exp.test}`);
      lines.push(`- **Target Users to Interview**: ${exp.targetUsers}`);
      lines.push(`- **Success Signal (Validate)**: ${exp.successSignal}`);
      lines.push(`- **Kill Signal (Invalidate)**: ${exp.invalidationSignal}`);
      lines.push(``);
    });

    // 11. Weak Signals
    lines.push(`## Insufficient Evidence / Weak Signals`);
    if (weakSignals.length === 0) {
      lines.push(`No weak signals recorded; all identified problems met verification criteria.`);
    } else {
      weakSignals.forEach(ws => {
        lines.push(`- **${ws.title}** ([${ws.platform}](${ws.sourceUrl}))`);
        lines.push(`  - User Statement: *"${ws.userStatement}"*`);
        lines.push(`  - Why Insufficient: ${ws.whyInsufficient}`);
        lines.push(`  - Potential Value: ${ws.potentialValue}`);
      });
    }
    lines.push(``);

    // 12. Evidence & Sources
    lines.push(`## Evidence & Sources`);
    classifiedEvidence.forEach((ev, i) => {
      lines.push(`${i + 1}. [${ev.title}](${ev.url}) — *${ev.platform.toUpperCase()}* (${ev.date || 'Recent'}) - Quality: ${ev.quality}`);
    });
    lines.push(``);

    return lines.join('\n');
  }
}
