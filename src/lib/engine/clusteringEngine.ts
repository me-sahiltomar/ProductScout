import { ExtractedProblem, ProblemCluster } from '@/types';

export class ClusteringEngine {
  public clusterProblems(problems: ExtractedProblem[]): ProblemCluster[] {
    if (problems.length === 0) return [];

    // Extract significant keywords/anchors for each problem
    const problemProfiles = problems.map(p => ({
      problem: p,
      anchors: this.extractAnchorKeywords(`${p.problemStatement} ${p.jobWorkflow}`),
      text: `${p.problemStatement} ${p.jobWorkflow}`.toLowerCase()
    }));

    // Group problems by shared primary anchors or high token overlap
    const clusterBuckets: Array<{
      key: string;
      primaryAnchor: string;
      problems: ExtractedProblem[];
      anchorSet: Set<string>;
    }> = [];

    for (const profile of problemProfiles) {
      let matchedBucket: typeof clusterBuckets[0] | null = null;

      for (const bucket of clusterBuckets) {
        // Check for shared significant anchors
        const sharedAnchors = profile.anchors.filter(a => bucket.anchorSet.has(a));
        
        // Jaccard similarity between anchor sets
        const unionSize = new Set([...Array.from(bucket.anchorSet), ...profile.anchors]).size;
        const similarity = unionSize > 0 ? sharedAnchors.length / unionSize : 0;

        // If sharing primary domain anchor or high similarity (> 0.25)
        if (sharedAnchors.length >= 2 || (sharedAnchors.length >= 1 && (bucket.primaryAnchor === profile.anchors[0] || similarity >= 0.2))) {
          matchedBucket = bucket;
          break;
        }
      }

      if (matchedBucket) {
        matchedBucket.problems.push(profile.problem);
        profile.anchors.forEach(a => matchedBucket!.anchorSet.add(a));
      } else {
        const primary = profile.anchors[0] || 'operations';
        clusterBuckets.push({
          key: primary,
          primaryAnchor: primary,
          problems: [profile.problem],
          anchorSet: new Set(profile.anchors)
        });
      }
    }

    // Merge any remaining near-identical clusters
    const mergedBuckets = this.mergeOverlappingBuckets(clusterBuckets);

    const clusters: ProblemCluster[] = [];
    let clusterIdx = 1;

    for (const bucket of mergedBuckets) {
      const clusterProblems = bucket.problems;
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

      // Pick representative problem (highest signal count or quality)
      const primaryProblem = clusterProblems.reduce((best, cur) => 
        (cur.signalCount > best.signalCount || cur.confidence > best.confidence) ? cur : best
      , clusterProblems[0]);

      const clusterName = this.formatClusterName(bucket.primaryAnchor, primaryProblem, clusterProblems.length);

      clusters.push({
        id: `clust_${clusterIdx++}`,
        clusterName,
        description: `Operational cluster encompassing ${clusterProblems.length} recurring friction point(s) in ${primaryProblem.jobWorkflow || clusterName}.`,
        problemIds: clusterProblems.map(p => p.id),
        signalCount,
        sourceDiversity,
        commonAffectedUsers: primaryProblem.targetUser,
        commonWorkflow: primaryProblem.jobWorkflow,
        overallEvidenceStrength,
      });
    }

    return clusters.sort((a, b) => b.signalCount - a.signalCount || b.problemIds.length - a.problemIds.length);
  }

  private extractAnchorKeywords(text: string): string[] {
    const stopwords = new Set([
      'the', 'is', 'at', 'which', 'on', 'and', 'a', 'an', 'to', 'in', 'of', 'for', 'with',
      'it', 'this', 'that', 'as', 'are', 'be', 'by', 'was', 'or', 'from', 'but', 'not',
      'have', 'has', 'had', 'we', 'they', 'you', 'i', 'my', 'our', 'their', 'can', 'will',
      'would', 'should', 'what', 'how', 'why', 'who', 'when', 'where', 'do', 'does', 'did',
      'if', 'then', 'than', 'so', 'about', 'more', 'some', 'any', 'all', 'one', 'out',
      'up', 'down', 'like', 'just', 'get', 'got', 'make', 'made', 'use', 'using', 'need',
      'needs', 'want', 'wants', 'know', 'think', 'see', 'look', 'good', 'bad', 'much',
      'many', 'very', 'really', 'too', 'also', 'only', 'even', 'still', 'now', 'well',
      'way', 'time', 'day', 'year', 'work', 'new', 'first', 'last', 'same', 'different',
      'other', 'another', 'own', 'such', 'these', 'those', 'there', 'here', 'being', 'been',
      'doing', 'done', 'having', 'could', 'might', 'must', 'challenges', 'challenge', 'weekend'
    ]);

    const words = text
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter(w => w.length >= 4 && !stopwords.has(w));

    // Deduplicate preserving order
    return Array.from(new Set(words));
  }

  private mergeOverlappingBuckets(
    buckets: Array<{
      key: string;
      primaryAnchor: string;
      problems: ExtractedProblem[];
      anchorSet: Set<string>;
    }>
  ) {
    const merged: typeof buckets = [];

    for (const bucket of buckets) {
      let combined = false;
      for (const target of merged) {
        // If anchor sets have >= 40% overlap or shared primary anchor
        const shared = Array.from(bucket.anchorSet).filter(a => target.anchorSet.has(a));
        if (shared.length >= 2 || (shared.length >= 1 && bucket.primaryAnchor === target.primaryAnchor)) {
          target.problems.push(...bucket.problems);
          bucket.anchorSet.forEach(a => target.anchorSet.add(a));
          combined = true;
          break;
        }
      }
      if (!combined) {
        merged.push(bucket);
      }
    }

    return merged;
  }

  private formatClusterName(primaryAnchor: string, exampleProblem: ExtractedProblem, problemCount: number): string {
    const capitalized = primaryAnchor.charAt(0).toUpperCase() + primaryAnchor.slice(1);
    if (exampleProblem.jobWorkflow && exampleProblem.jobWorkflow !== 'Core Operational Bottlenecks') {
      return `${capitalized} Workflow (${exampleProblem.jobWorkflow})`;
    }
    return `${capitalized} Operational System`;
  }
}
