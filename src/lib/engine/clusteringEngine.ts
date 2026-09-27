import { ExtractedProblem, ProblemCluster } from '@/types';

export class ClusteringEngine {
  public clusterProblems(problems: ExtractedProblem[]): ProblemCluster[] {
    if (problems.length === 0) return [];

    const clustersMap: Map<string, ExtractedProblem[]> = new Map();

    for (const prob of problems) {
      const clusterKey = this.categorizeCluster(prob);
      if (!clustersMap.has(clusterKey)) {
        clustersMap.set(clusterKey, []);
      }
      clustersMap.get(clusterKey)!.push(prob);
    }

    const clusters: ProblemCluster[] = [];
    let clusterIdx = 1;

    for (const [key, clusterProblems] of clustersMap.entries()) {
      const allSourceLinks = new Set<string>();
      const allPlatforms = new Set<string>();

      for (const p of clusterProblems) {
        p.sourceLinks.forEach(link => allSourceLinks.add(link));
        p.evidenceQuotes.forEach(q => allPlatforms.add(q.platform));
      }

      const signalCount = allSourceLinks.size;
      const sourceDiversity = allPlatforms.size;

      let overallEvidenceStrength: 'HIGH' | 'MEDIUM' | 'LOW' = 'LOW';
      const hasHighQualityProb = clusterProblems.some(p => p.evidenceQuality === 'HIGH');
      if (signalCount >= 3 && sourceDiversity >= 2 && hasHighQualityProb) {
        overallEvidenceStrength = 'HIGH';
      } else if (signalCount >= 2 || hasHighQualityProb) {
        overallEvidenceStrength = 'MEDIUM';
      }

      const clusterName = this.formatClusterName(key, clusterProblems[0]);
      const commonUsers = clusterProblems[0].targetUser;
      const commonWorkflow = clusterProblems[0].jobWorkflow;

      clusters.push({
        id: `clust_${clusterIdx++}`,
        clusterName,
        description: `Operational cluster encompassing ${clusterProblems.length} recurring friction point(s) in ${commonWorkflow}.`,
        problemIds: clusterProblems.map(p => p.id),
        signalCount,
        sourceDiversity,
        commonAffectedUsers: commonUsers,
        commonWorkflow,
        overallEvidenceStrength,
      });
    }

    return clusters.sort((a, b) => b.signalCount - a.signalCount);
  }

  private categorizeCluster(prob: ExtractedProblem): string {
    const text = `${prob.problemStatement} ${prob.jobWorkflow}`.toLowerCase();

    if (/\b(lead|crm|sales|prospect|outreach)\b/i.test(text)) return 'Lead Acquisition & CRM Pipeline';
    if (/\b(invoice|billing|payment|accounting|bookkeeping)\b/i.test(text)) return 'Financial Ops, Invoicing & Billing';
    if (/\b(customer|support|inquiry|ticket|inbox)\b/i.test(text)) return 'Customer Communication & Support Triage';
    if (/\b(inventory|order|shipping|supplier|fulfillment)\b/i.test(text)) return 'Fulfillment, Inventory & Supply Tracking';
    if (/\b(calendar|schedule|appointment|booking)\b/i.test(text)) return 'Client Scheduling & Appointment Management';
    if (/\b(document|pdf|contract|extraction|ocr)\b/i.test(text)) return 'Document Processing & Data Extraction';
    if (/\b(onboarding|client intake|forms)\b/i.test(text)) return 'Client Intake & Onboarding Friction';
    if (/\b(marketing|social|content)\b/i.test(text)) return 'Content Creation & Marketing Repurposing';
    if (/\b(reporting|metrics|analytics|dashboard)\b/i.test(text)) return 'Operational Analytics & Cross-Tool Reporting';
    if (/\b(integration|zapier|api|automation)\b/i.test(text)) return 'Inter-System Connectivity & Automation Failures';

    return 'Specialized Operational Workflows';
  }

  private formatClusterName(key: string, exampleProblem: ExtractedProblem): string {
    if (key !== 'Specialized Operational Workflows') return key;
    return exampleProblem.jobWorkflow || 'Core Operational Bottlenecks';
  }
}
