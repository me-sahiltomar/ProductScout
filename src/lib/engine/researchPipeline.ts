import { CollectorManager } from '../collectors/collectorManager';
import { EvidenceFilter } from './evidenceFilter';
import { ProblemExtractor } from './problemExtractor';
import { ClusteringEngine } from './clusteringEngine';
import { SolutionGapAnalyzer } from './solutionGapAnalyzer';
import { OpportunityGenerator, normalizeBrief } from './opportunityGenerator';
import { QualityController } from './qualityController';
import { ReportGenerator, resolveAdaptiveOutputType } from './reportGenerator';
import { AIProviderManager } from './aiProvider';
import { ProductScoutRepository, UserScope } from '../db/productScoutRepository';
import { ResearchRun, ResearchRunConfig } from '@/types';

export class ResearchPipeline {
  private collectorManager: CollectorManager;
  private evidenceFilter: EvidenceFilter;
  private problemExtractor: ProblemExtractor;
  private clusteringEngine: ClusteringEngine;
  private solutionGapAnalyzer: SolutionGapAnalyzer;
  private opportunityGenerator: OpportunityGenerator;
  private qualityController: QualityController;
  private reportGenerator: ReportGenerator;
  private aiProvider: AIProviderManager;
  private repo: ProductScoutRepository;

  constructor(repo?: ProductScoutRepository) {
    this.repo = repo || ProductScoutRepository.getInstance();
    this.collectorManager = new CollectorManager();
    this.evidenceFilter = new EvidenceFilter();
    this.problemExtractor = new ProblemExtractor();
    this.clusteringEngine = new ClusteringEngine();
    this.solutionGapAnalyzer = new SolutionGapAnalyzer();
    this.opportunityGenerator = new OpportunityGenerator();
    this.qualityController = new QualityController();
    this.reportGenerator = new ReportGenerator();
    // Default with heuristic settings
    this.aiProvider = new AIProviderManager({
      aiProvider: 'heuristic',
      defaultMaxSources: 30,
      defaultTimeframe: '30d',
    });
  }

  public async initSettings() {
    const settings = await this.repo.getSettings();
    this.aiProvider.updateSettings(settings);
  }

  public async execute(config: ResearchRunConfig, scope?: UserScope): Promise<ResearchRun> {
    await this.initSettings();

    const runId = `run_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const createdAt = new Date().toISOString();

    const brief = config.brief || normalizeBrief(config);
    config.brief = brief;
    const adaptiveOutputType = resolveAdaptiveOutputType(brief);

    const initialRun: ResearchRun = {
      id: runId,
      createdAt,
      config,
      brief,
      adaptiveOutputType,
      status: 'collecting',
      currentStep: 'Collecting user signals across public web sources...',
      coverage: {
        sourcesSearched: [],
        sourcesCollectedCount: 0,
        sourcesSucceeded: [],
        sourcesUnavailable: [],
        dateRange: brief.researchConfiguration.evidenceWindow === 'all' 
          ? 'All time' 
          : `Past ${brief.researchConfiguration.evidenceWindow}`,
        qualityDistribution: { high: 0, medium: 0, low: 0 },
      },
      rawEvidenceCount: 0,
      classifiedEvidence: [],
      problems: [],
      clusters: [],
      existingSolutions: [],
      gaps: [],
      opportunities: [],
      weakSignals: [],
      reportMarkdown: '',
    };

    await this.repo.saveRun(initialRun, scope);

    try {
      const { rawItems, coverage } = await this.collectorManager.collectAll(config);
      initialRun.rawEvidenceCount = rawItems.length;
      initialRun.coverage = coverage;
      initialRun.status = 'analyzing';
      initialRun.currentStep = 'Classifying evidence hierarchy and authenticity...';
      await this.repo.saveRun(initialRun, scope);

      const classifiedEvidence = this.evidenceFilter.classifyAll(rawItems);
      initialRun.classifiedEvidence = classifiedEvidence;
      
      initialRun.coverage.qualityDistribution = {
        high: classifiedEvidence.filter(e => e.quality === 'HIGH').length,
        medium: classifiedEvidence.filter(e => e.quality === 'MEDIUM').length,
        low: classifiedEvidence.filter(e => e.quality === 'LOW').length,
      };
      initialRun.currentStep = 'Extracting evidence-backed user problems...';
      await this.repo.saveRun(initialRun, scope);

      const problems = this.problemExtractor.extractProblems(classifiedEvidence, config);
      initialRun.problems = problems;
      initialRun.currentStep = 'Clustering problems into operational workflows...';
      await this.repo.saveRun(initialRun, scope);

      const clusters = this.clusteringEngine.clusterProblems(problems);
      initialRun.clusters = clusters;
      initialRun.currentStep = 'Analyzing existing solutions and detecting market gaps...';
      await this.repo.saveRun(initialRun, scope);

      const { solutions, gaps } = this.solutionGapAnalyzer.analyze(clusters, problems, classifiedEvidence);
      initialRun.existingSolutions = solutions;
      initialRun.gaps = gaps;
      initialRun.currentStep = 'Formulating opportunities and contextual evaluation...';
      await this.repo.saveRun(initialRun, scope);

      let opportunities = this.opportunityGenerator.generateOpportunities(clusters, problems, gaps, config);

      const enriched = await this.aiProvider.enrichIfAvailable(config, classifiedEvidence, problems, opportunities);
      opportunities = enriched.opportunities;

      const { verifiedOpportunities, weakSignals } = this.qualityController.audit(opportunities, problems, classifiedEvidence);
      initialRun.opportunities = verifiedOpportunities;
      initialRun.weakSignals = weakSignals;
      initialRun.currentStep = 'Synthesizing adaptive execution report...';
      await this.repo.saveRun(initialRun, scope);

      const reportMarkdown = this.reportGenerator.generateMarkdownReport(initialRun);
      initialRun.reportMarkdown = reportMarkdown;
      initialRun.status = 'completed';
      initialRun.currentStep = 'Completed';
      await this.repo.saveRun(initialRun, scope);

      return initialRun;
    } catch (err: any) {
      initialRun.status = 'failed';
      initialRun.error = err.message || 'Pipeline execution failed';
      await this.repo.saveRun(initialRun, scope);
      throw err;
    }
  }
}
