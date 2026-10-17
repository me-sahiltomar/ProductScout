import { describe, it, expect } from 'vitest';
import { OpportunityGenerator } from '../src/lib/engine/opportunityGenerator';
import { ClusteringEngine } from '../src/lib/engine/clusteringEngine';
import { ResearchState } from '../src/lib/engine/researchState';
import { ResearchController } from '../src/lib/engine/researchController';
import { ExtractedProblem, ResearchRunConfig, ProblemCluster, MarketGap, ExistingSolution, CommercialSignal, VerifiedClaim } from '../src/types';

describe('V1.5 Observation-Driven Tuning Suite', () => {
  describe('1. Deep Fetch Accounting & Telemetry Separation', () => {
    it('should separate discovery searches, candidate results, and deep fetches', () => {
      const config: ResearchRunConfig = {
        topic: 'Test Topic',
        timeframe: '30d',
        maxSources: 10,
        focus: 'problems',
        budget: {
          maxSearches: 5,
          maxDeepFetches: 10,
          maxLlmCalls: 5,
          maxTokens: 10000,
          maxCostUsd: 1.0,
          maxRuntimeMs: 30000
        }
      };

      const state = new ResearchState(config);
      
      // Simulate 3 discovery searches returning 8 candidate items each
      state.discoverySearchCount += 3;
      state.searchCount += 3;
      state.candidateResultCount += 24; // 24 raw items
      
      // Simulate 2 actual selective deep retrieval operations
      state.fetchCount += 2;

      expect(state.discoverySearchCount).toBe(3);
      expect(state.candidateResultCount).toBe(24);
      expect(state.fetchCount).toBe(2); // strictly selective deep fetches!

      // Verify that 24 raw items do NOT trip the maxDeepFetches limit of 10
      expect(state.isBudgetExhausted()).toBe(false);

      // Now simulate exceeding actual deep fetches
      state.fetchCount = 11;
      expect(state.isBudgetExhausted()).toBe(true);
    });
  });

  describe('2. Opportunity Compression & Near-Duplicate Consolidation', () => {
    it('should cluster overlapping problems sharing dominant entities into a single cluster', () => {
      const clustering = new ClusteringEngine();

      const problems: ExtractedProblem[] = [
        {
          id: 'p1',
          problemStatement: 'Hacktoberfest 2026 DEV Challenges: Five Challenges, One Prompt',
          targetUser: 'Developers',
          userContext: 'Open source participation',
          jobWorkflow: 'Open Source Contribution',
          painPoint: 'High coordination friction',
          whyPainful: 'Context switching',
          currentWorkaround: 'Manual issue hunting',
          frequency: 'Annual',
          evidenceQuotes: [],
          evidenceIds: ['e1'],
          signalCount: 3,
          sourceLinks: ['url1', 'url2', 'url3'],
          evidenceQuality: 'HIGH',
          confidence: 85
        },
        {
          id: 'p2',
          problemStatement: 'Hacktoberfest 2026 DEV Launch: Launching my open source repo for the weekend',
          targetUser: 'Developers',
          userContext: 'Open source participation',
          jobWorkflow: 'Open Source Contribution',
          painPoint: 'Maintainer burnout managing issues',
          whyPainful: 'Too many spam PRs',
          currentWorkaround: 'GitHub action bot',
          frequency: 'Annual',
          evidenceQuotes: [],
          evidenceIds: ['e2'],
          signalCount: 2,
          sourceLinks: ['url4', 'url5'],
          evidenceQuality: 'HIGH',
          confidence: 80
        },
        {
          id: 'p3',
          problemStatement: 'Docker image slimming and layer caching optimization',
          targetUser: 'DevOps Engineers',
          userContext: 'CI/CD pipeline builds',
          jobWorkflow: 'Container Image Building',
          painPoint: 'Huge multi-gigabyte Node images take 15 minutes to pull',
          whyPainful: 'Slow deploy velocity',
          currentWorkaround: 'Multi-stage Dockerfile hacks',
          frequency: 'Daily',
          evidenceQuotes: [],
          evidenceIds: ['e3', 'e4'],
          signalCount: 4,
          sourceLinks: ['url6', 'url7'],
          evidenceQuality: 'HIGH',
          confidence: 90
        }
      ];

      const clusters = clustering.clusterProblems(problems);

      // Both Hacktoberfest problems must merge into a single consolidated cluster
      expect(clusters.length).toBe(2);
      
      const hacktoberfestCluster = clusters.find(c => c.clusterName.toLowerCase().includes('hacktoberfest'));
      expect(hacktoberfestCluster).toBeDefined();
      expect(hacktoberfestCluster!.problemIds).toHaveLength(2);
      expect(hacktoberfestCluster!.problemIds).toContain('p1');
      expect(hacktoberfestCluster!.problemIds).toContain('p2');

      const dockerCluster = clusters.find(c => c.clusterName.toLowerCase().includes('docker'));
      expect(dockerCluster).toBeDefined();
      expect(dockerCluster!.problemIds).toHaveLength(1);
    });

    it('should consolidate overlapping workflow candidates and preserve rejected candidates with reasons', () => {
      const generator = new OpportunityGenerator();

      const clusters: ProblemCluster[] = [
        {
          id: 'c1',
          clusterName: 'Docker Container Optimization',
          description: 'Slimming images',
          problemIds: ['p1'],
          signalCount: 5,
          sourceDiversity: 3,
          commonAffectedUsers: 'DevOps Engineers',
          commonWorkflow: 'Container Building',
          overallEvidenceStrength: 'HIGH'
        },
        {
          id: 'c2',
          clusterName: 'Docker Image Slimming Workflow',
          description: 'Cache layer slimming',
          problemIds: ['p2'],
          signalCount: 3,
          sourceDiversity: 2,
          commonAffectedUsers: 'DevOps Engineers',
          commonWorkflow: 'Container Building',
          overallEvidenceStrength: 'MEDIUM'
        }
      ];

      const problems: ExtractedProblem[] = [
        {
          id: 'p1',
          problemStatement: 'Docker images are too bloated and slow to build',
          targetUser: 'DevOps Engineers',
          userContext: 'CI build pipelines',
          jobWorkflow: 'Container Building',
          painPoint: 'Slow pipeline',
          whyPainful: 'Wasted developer hours',
          currentWorkaround: 'Alpine base images',
          workaroundType: 'manual',
          frequency: 'Daily',
          evidenceQuotes: [{ quote: 'Takes forever', sourceUrl: 'https://github.com', sourceTitle: 'Docker slow', platform: 'github' }],
          evidenceIds: ['e1', 'e2'],
          signalCount: 5,
          sourceLinks: ['https://github.com'],
          evidenceQuality: 'HIGH',
          confidence: 88
        },
        {
          id: 'p2',
          problemStatement: 'Node.js Docker image layers take too long to cache and transfer',
          targetUser: 'DevOps Engineers',
          userContext: 'CI build pipelines',
          jobWorkflow: 'Container Building',
          painPoint: 'Bandwidth cost',
          whyPainful: 'Slow pipeline',
          currentWorkaround: 'Multi-stage Dockerfile hacks',
          workaroundType: 'manual',
          frequency: 'Daily',
          evidenceQuotes: [{ quote: 'Layer caching fails', sourceUrl: 'https://dev.to', sourceTitle: 'Docker layers', platform: 'devto' }],
          evidenceIds: ['e3'],
          signalCount: 3,
          sourceLinks: ['https://dev.to'],
          evidenceQuality: 'HIGH',
          confidence: 82
        }
      ];

      const gaps: MarketGap[] = [{
        id: 'gap_c1',
        gapType: 'lack_of_automation',
        title: 'No automated slimming',
        description: 'Missing zero-config slimming',
        supportingEvidenceIds: ['e1'],
        supportingQuotes: ['Need slim tool'],
        isAiInference: false
      }];

      const solutions: ExistingSolution[] = [{
        name: 'DockerSlim',
        type: 'open_source',
        whatUsersDo: 'Run CLI tool',
        positiveAspects: ['Works well'],
        complaints: ['Breaks dynamic imports'],
        missingFunctionality: ['GUI', 'CI integration'],
        integrationLimitations: [],
        complexityFriction: 'High',
        unservedSegments: 'Node.js monorepos'
      }];

      const commercialSignals: CommercialSignal[] = [{
        id: 'cs1',
        type: 'complaint_about_existing_pricing',
        description: 'Paying $200/mo for Docker registry storage',
        strength: 'STRONG',
        evidenceIds: ['e1', 'e2']
      }];

      const verifiedClaims: VerifiedClaim[] = [{
        id: 'vc1',
        claimText: 'Users struggle with bloated Docker containers',
        status: 'VERIFIED',
        supportingEvidenceIds: ['e1', 'e2', 'e3'],
        contradictingEvidenceIds: []
      }];

      const config: ResearchRunConfig = {
        topic: 'Docker optimization',
        timeframe: '30d',
        maxSources: 10,
        focus: 'problems'
      };

      const opps = generator.generateOpportunities(clusters, problems, gaps, solutions, commercialSignals, verifiedClaims, config);

      // Verify that the second overlapping Docker opportunity was merged into the first
      expect(opps.length).toBe(1);
      expect(opps[0].title).toBe('Automated Docker Container Optimization');
      // The merged opportunity should have aggregated supporting evidence from both
      expect(opps[0].supporting_evidence).toContain('e1');
      expect(opps[0].supporting_evidence).toContain('e3');

      // Verify rejected candidates were preserved with reasons
      expect(generator.lastRejectedCandidates.length).toBe(1);
      expect(generator.lastRejectedCandidates[0].rejectionReason).toContain('CONSOLIDATED_VARIANT');
      expect(generator.lastRejectedCandidates[0].rejectionReason).toContain('Automated Docker Container Optimization');
    });
  });

  describe('3. Evidence Gates & Hard Negative Handling', () => {
    it('should reject non-pain announcements and isolated weak signals', () => {
      const generator = new OpportunityGenerator();

      const clusters: ProblemCluster[] = [{
        id: 'c_neg',
        clusterName: 'Underwater Basket Weaving Telemetry',
        description: 'Reed moisture tracking',
        problemIds: ['p_neg'],
        signalCount: 1,
        sourceDiversity: 1,
        commonAffectedUsers: 'Weavers',
        commonWorkflow: 'Weaving',
        overallEvidenceStrength: 'LOW'
      }];

      const problems: ExtractedProblem[] = [{
        id: 'p_neg',
        problemStatement: 'Underwater basket weaving telemetry analytics',
        targetUser: 'Weavers',
        userContext: 'Hobby',
        jobWorkflow: 'Weaving',
        painPoint: 'None detected',
        whyPainful: 'Unknown',
        currentWorkaround: 'None',
        workaroundType: 'none',
        frequency: 'Rare',
        evidenceQuotes: [],
        evidenceIds: ['e_neg'],
        signalCount: 1,
        sourceLinks: ['https://example.com'],
        evidenceQuality: 'LOW',
        confidence: 30
      }];

      const config: ResearchRunConfig = {
        topic: 'Underwater basket weaving',
        timeframe: '30d',
        maxSources: 5,
        focus: 'problems'
      };

      const opps = generator.generateOpportunities(clusters, problems, [], [], [], [], config);

      // Must produce 0 opportunities
      expect(opps.length).toBe(0);
      expect(generator.lastRejectedCandidates.length).toBe(1);
      expect(generator.lastRejectedCandidates[0].rejectionReason).toContain('INSUFFICIENT_EVIDENCE');
    });
  });
});
