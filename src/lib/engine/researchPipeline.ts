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

    // Delegate execution to the V1.5 Adaptive ResearchController
    const { ResearchController } = require('./researchController');
    const controller = new ResearchController(
      this.repo,
      this.collectorManager,
      this.evidenceFilter,
      this.problemExtractor,
      this.clusteringEngine,
      this.solutionGapAnalyzer,
      this.opportunityGenerator,
      this.qualityController,
      this.reportGenerator,
      this.aiProvider
    );

    return controller.run(config, scope);
  }
}
