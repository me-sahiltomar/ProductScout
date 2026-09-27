import { ClassifiedEvidence, ExtractedProblem, ResearchRunConfig } from '@/types';

export class ProblemExtractor {
  public extractProblems(
    evidenceList: ClassifiedEvidence[],
    config: ResearchRunConfig
  ): ExtractedProblem[] {
    const validEvidence = evidenceList.filter(e => e.quality === 'HIGH' || e.quality === 'MEDIUM');

    if (validEvidence.length === 0) {
      return [];
    }

    const problemBuckets: Map<string, ClassifiedEvidence[]> = new Map();

    for (const ev of validEvidence) {
      const themeKey = this.determineThemeKey(ev.title, ev.snippet);
      if (!problemBuckets.has(themeKey)) {
        problemBuckets.set(themeKey, []);
      }
      problemBuckets.get(themeKey)!.push(ev);
    }

    const problems: ExtractedProblem[] = [];
    let problemIndex = 1;

    for (const [theme, bucket] of problemBuckets.entries()) {
      if (bucket.length === 0) continue;

      const primary = bucket[0];
      const distinctSources = new Set(bucket.map(b => b.url));
      const platforms = new Set(bucket.map(b => b.platform));
      const quotes = bucket.slice(0, 4).map(b => ({
        quote: b.painQuote || b.snippet.slice(0, 180),
        sourceUrl: b.url,
        sourceTitle: b.title,
        author: b.author,
        platform: b.platform,
      }));

      const fullText = bucket.map(b => `${b.title} ${b.snippet}`).join(' ');
      const workaround = this.detectWorkaround(fullText);
      const targetUser = this.detectTargetUser(fullText, config.targetUser);
      const workflow = this.detectWorkflow(fullText, config.topic);

      const avgQualityScore = bucket.reduce((sum, b) => sum + b.qualityScore, 0) / bucket.length;
      const evidenceQuality = avgQualityScore >= 68 && bucket.length >= 2 ? 'HIGH' : 'MEDIUM';

      const confidence = Math.min(
        95,
        Math.round(40 + (distinctSources.size * 12) + (platforms.size * 10) + (avgQualityScore * 0.2))
      );

      const frequency = this.detectFrequency(fullText);

      problems.push({
        id: `prob_${problemIndex++}`,
        problemStatement: this.formulateProblemStatement(theme, primary.title, fullText),
        targetUser,
        userContext: `Operating in ${config.topic || 'daily operations'}, dealing with high friction in repetitive tasks.`,
        jobWorkflow: workflow,
        painPoint: `High operational drag, recurring manual errors, and loss of productive hours.`,
        whyPainful: `Forces operators to shift context, introduces human data entry mistakes, and creates customer response latency.`,
        currentWorkaround: workaround,
        frequency,
        evidenceQuotes: quotes,
        evidenceIds: bucket.map(b => b.id),
        signalCount: distinctSources.size,
        sourceLinks: Array.from(distinctSources),
        evidenceQuality,
        confidence,
      });
    }

    return problems.sort((a, b) => b.signalCount - a.signalCount || b.confidence - a.confidence);
  }

  private determineThemeKey(title: string, snippet: string): string {
    const text = `${title} ${snippet}`.toLowerCase();

    if (/\b(lead|crm|prospect|outreach|sales|follow-up|follow up)\b/i.test(text)) {
      return 'manual_lead_crm_sync';
    }
    if (/\b(invoice|billing|payment|stripe|bookkeeping|accounting|expense|receipt)\b/i.test(text)) {
      return 'invoicing_and_reconciliation';
    }
    if (/\b(customer service|support ticket|inquiry|inbox|email triage|zendesk|intercom)\b/i.test(text)) {
      return 'customer_inquiry_overload';
    }
    if (/\b(inventory|stock|supplier|order fulfillment|warehouse|shipping|tracking)\b/i.test(text)) {
      return 'inventory_and_order_dispatch';
    }
    if (/\b(calendar|scheduling|booking|appointment|rescheduling|no-show)\b/i.test(text)) {
      return 'appointment_scheduling_friction';
    }
    if (/\b(social media|content creation|posting|marketing copy|campaign)\b/i.test(text)) {
      return 'marketing_content_distribution';
    }
    if (/\b(document|pdf|contract|extraction|data entry|ocr|scanning)\b/i.test(text)) {
      return 'document_data_entry_and_parsing';
    }
    if (/\b(onboarding|client setup|client intake|forms|verification)\b/i.test(text)) {
      return 'client_intake_and_onboarding';
    }
    if (/\b(reporting|dashboard|analytics|aggregat|metrics|spreadsheet)\b/i.test(text)) {
      return 'fragmented_metrics_reporting';
    }
    if (/\b(automation|zapier|make|integromat|webhook|api broken|sync)\b/i.test(text)) {
      return 'brittle_workflow_integrations';
    }

    const words = title.toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/).filter(w => w.length > 4);
    return words.slice(0, 2).join('_') || 'general_operational_friction';
  }

  private formulateProblemStatement(theme: string, title: string, text: string): string {
    const themeTitles: Record<string, string> = {
      manual_lead_crm_sync: 'Manual data entry and delay synchronizing inbound leads into CRM and follow-up sequences',
      invoicing_and_reconciliation: 'Time-consuming manual invoice cross-referencing and late payment reconciliation',
      customer_inquiry_overload: 'Repetitive front-line customer questions overwhelming operational staff with slow turnaround times',
      inventory_and_order_dispatch: 'Disjointed stock synchronization causing stockouts and manual order dispatch delays',
      appointment_scheduling_friction: 'Back-and-forth communication friction causing appointment no-shows and lost client bookings',
      marketing_content_distribution: 'Multi-channel content repurposing and scheduling bottleneck consuming founder hours',
      document_data_entry_and_parsing: 'Manual transcription of unstructured invoices, PDFs, and intake documents into operational systems',
      client_intake_and_onboarding: 'Fragmented customer onboarding checklists requiring repeated manual nudges and delays',
      fragmented_metrics_reporting: 'Scattered operational and revenue metrics locked in siloed tools requiring manual weekly spreadsheets',
      brittle_workflow_integrations: 'Brittle custom automations and API connectors silently failing without user-friendly observability',
    };

    if (themeTitles[theme]) {
      return themeTitles[theme];
    }

    return title.replace(/^(how to|why is|anyone else|help with)\s+/i, '').slice(0, 110);
  }

  private detectWorkaround(text: string): string {
    if (/\b(google sheets|spreadsheet|excel|csv)\b/i.test(text)) {
      return 'Maintaining complex Google Sheets/Excel spreadsheets with manual copy-pasting';
    }
    if (/\b(zapier|make\.com|integromat)\b/i.test(text)) {
      return 'Cobbling together fragile multi-step Zapier/Make automations that frequently break';
    }
    if (/\b(virtual assistant|va|hire|contractor|intern)\b/i.test(text)) {
      return 'Hiring part-time virtual assistants or contractors to manually perform data entry';
    }
    if (/\b(email|inbox|manual|by hand)\b/i.test(text)) {
      return 'Performing manual step-by-step checks via email inbox and manual browser bookmarks';
    }
    return 'Manual human intervention and ad-hoc checklist routines';
  }

  private detectTargetUser(text: string, override?: string): string {
    if (override && override.trim().length > 0) return override.trim();
    if (/\b(founder|agency owner|freelancer)\b/i.test(text)) return 'Agency owners and solo entrepreneurs';
    if (/\b(small business|smb|local business|store owner)\b/i.test(text)) return 'Small business operators and boutique service firms';
    if (/\b(developer|engineer|devops)\b/i.test(text)) return 'Software developers and technical project leads';
    if (/\b(sales|account executive|bdr|sdr)\b/i.test(text)) return 'B2B sales representatives and revenue managers';
    return 'Small business owners and lean product teams';
  }

  private detectWorkflow(text: string, topic: string): string {
    if (/\b(lead|crm|prospect|sales)\b/i.test(text)) return 'Inbound lead capture → CRM assignment → outreach follow-up';
    if (/\b(invoice|payment|accounting)\b/i.test(text)) return 'Invoice generation → payment tracking → accounting ledger reconciliation';
    if (/\b(support|ticket|inquiry|customer)\b/i.test(text)) return 'Customer question triage → internal resolution → response dispatch';
    if (/\b(schedule|calendar|booking)\b/i.test(text)) return 'Availability check → appointment slot negotiation → reminder confirmation';
    if (/\b(document|pdf|form)\b/i.test(text)) return 'Document intake → field extraction → ERP/CRM data ingestion';
    return `${topic} operational workflow`;
  }

  private detectFrequency(text: string): string {
    if (/\b(daily|every day|multiple times a day|constantly)\b/i.test(text)) return 'Daily (multiple times per day)';
    if (/\b(weekly|every week|each week|regularly)\b/i.test(text)) return 'Weekly (recurring routine)';
    if (/\b(monthly|end of month|monthly closing)\b/i.test(text)) return 'Monthly (periodic batch)';
    return 'Insufficient evidence.';
  }
}
