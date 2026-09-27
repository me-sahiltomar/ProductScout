import fs from 'fs';
import path from 'path';
import { ResearchRun, SystemSettings, ProductOpportunity } from '@/types';

interface DatabaseSchema {
  runs: ResearchRun[];
  savedOpportunities: ProductOpportunity[];
  settings: SystemSettings;
}

const DEFAULT_SETTINGS: SystemSettings = {
  aiProvider: 'heuristic',
  geminiModel: 'gemini-1.5-flash',
  openaiBaseUrl: 'https://api.openai.com/v1',
  openaiModel: 'gpt-4o-mini',
  defaultMaxSources: 30,
  defaultTimeframe: '30d',
};

// Global singleton cache for serverless environments (e.g. Vercel)
declare global {
  var __radar_db_instance: Database | undefined;
}

export class Database {
  private filePath: string;
  private data: DatabaseSchema;

  constructor() {
    // Local development fallback only. Supabase PostgreSQL is the primary authoritative datastore.
    const baseDir = path.resolve(process.cwd(), 'data');

    try {
      if (!fs.existsSync(baseDir)) {
        fs.mkdirSync(baseDir, { recursive: true });
      }
    } catch (e) {
      console.warn('Could not create directory for local database fallback:', e);
    }

    this.filePath = path.join(baseDir, 'radar_db.json');
    this.data = this.load();
    this.seedSampleIfEmpty();
  }

  public static getInstance(): Database {
    if (!global.__radar_db_instance) {
      global.__radar_db_instance = new Database();
    }
    return global.__radar_db_instance;
  }

  private load(): DatabaseSchema {
    try {
      if (fs.existsSync(this.filePath)) {
        const raw = fs.readFileSync(this.filePath, 'utf-8');
        return JSON.parse(raw);
      }
    } catch (err) {
      console.error('Error reading radar_db.json, starting fresh:', err);
    }
    return {
      runs: [],
      savedOpportunities: [],
      settings: DEFAULT_SETTINGS,
    };
  }

  private save(): void {
    try {
      const tempPath = `${this.filePath}.tmp`;
      fs.writeFileSync(tempPath, JSON.stringify(this.data, null, 2), 'utf-8');
      fs.renameSync(tempPath, this.filePath);
    } catch (err) {
      console.error('Failed to write radar_db.json:', err);
    }
  }

  public getRuns(): ResearchRun[] {
    return this.data.runs;
  }

  public getRunById(id: string): ResearchRun | undefined {
    return this.data.runs.find(r => r.id === id);
  }

  public saveRun(run: ResearchRun): void {
    const existingIndex = this.data.runs.findIndex(r => r.id === run.id);
    if (existingIndex >= 0) {
      this.data.runs[existingIndex] = run;
    } else {
      this.data.runs.unshift(run);
    }
    this.save();
  }

  public deleteRun(id: string): boolean {
    const initialLen = this.data.runs.length;
    this.data.runs = this.data.runs.filter(r => r.id !== id);
    if (this.data.runs.length !== initialLen) {
      this.save();
      return true;
    }
    return false;
  }

  public getSettings(): SystemSettings {
    return this.data.settings || DEFAULT_SETTINGS;
  }

  public updateSettings(settings: Partial<SystemSettings>): SystemSettings {
    this.data.settings = { ...this.data.settings, ...settings };
    this.save();
    return this.data.settings;
  }

  public toggleBookmark(opportunityId: string, _runId?: string): { isSaved: boolean } {
    let targetOpp: ProductOpportunity | undefined;

    for (const run of this.data.runs) {
      const found = run.opportunities.find(o => o.id === opportunityId);
      if (found) {
        found.isSaved = !found.isSaved;
        targetOpp = found;
        break;
      }
    }

    if (targetOpp) {
      if (targetOpp.isSaved) {
        if (!this.data.savedOpportunities.some(o => o.id === targetOpp!.id)) {
          this.data.savedOpportunities.push(targetOpp);
        }
      } else {
        this.data.savedOpportunities = this.data.savedOpportunities.filter(o => o.id !== targetOpp!.id);
      }
      this.save();
      return { isSaved: !!targetOpp.isSaved };
    }

    return { isSaved: false };
  }

  public getSavedOpportunities(): ProductOpportunity[] {
    return this.data.savedOpportunities;
  }

  public updateOpportunityNotes(opportunityId: string, notes: string): boolean {
    let updated = false;
    for (const run of this.data.runs) {
      const found = run.opportunities.find(o => o.id === opportunityId);
      if (found) {
        found.notes = notes;
        updated = true;
      }
    }
    const saved = this.data.savedOpportunities.find(o => o.id === opportunityId);
    if (saved) {
      saved.notes = notes;
      updated = true;
    }
    if (updated) this.save();
    return updated;
  }

  private seedSampleIfEmpty(): void {
    if (this.data.runs.length > 0) return;

    const sampleRun: ResearchRun = {
      id: 'run_sample_ai_automation_smb',
      createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
      config: {
        topic: 'AI automation for small businesses',
        timeframe: '30d',
        maxSources: 30,
        focus: 'Find repetitive operational problems that small business owners complain about and that could potentially become simple SaaS products or automation services.',
        targetUser: 'Small business owners & boutique operators',
        geography: 'North America / Global',
        industry: 'Services & Retail',
        enabledSources: ['reddit', 'hacker_news', 'github', 'devto', 'web'],
      },
      status: 'completed',
      currentStep: 'Completed',
      rawEvidenceCount: 28,
      coverage: {
        sourcesSearched: ['reddit', 'hacker_news', 'github', 'devto', 'web'],
        sourcesCollectedCount: 28,
        sourcesSucceeded: ['reddit', 'hacker_news', 'github', 'devto', 'web'],
        sourcesUnavailable: [],
        dateRange: 'Past 30 days',
        qualityDistribution: {
          high: 14,
          medium: 11,
          low: 3,
        },
      },
      classifiedEvidence: [
        {
          id: 'ev_sample_1',
          rawId: 'reddit_smb_01',
          title: 'I spend 8 hours every weekend matching paper invoices with Stripe payouts',
          url: 'https://reddit.com/r/smallbusiness/comments/invoicing_nightmare',
          platform: 'reddit',
          author: 'bakery_owner_dan',
          date: new Date(Date.now() - 86400000 * 3).toISOString(),
          snippet: 'My wife and I run a commercial bakery. We invoice 60 restaurants weekly. Half pay by ACH, half via Stripe, some cash. I spend my entire Sunday cross-referencing QuickBooks and bank feeds. There is no simple tool that just matches deposit amounts to invoice numbers automatically.',
          evidenceType: 'FIRST_HAND_USER_COMPLAINT',
          quality: 'HIGH',
          qualityScore: 92,
          firstHandMarkers: ['i spend', 'our company', 'we invoice', 'no simple tool'],
          painQuote: 'I spend my entire Sunday cross-referencing QuickBooks and bank feeds with no simple tool that just matches deposit amounts to invoice numbers automatically.',
        },
        {
          id: 'ev_sample_2',
          rawId: 'hn_c_lead_drag',
          title: 'Comment on: Why speed-to-lead is dying in service businesses',
          url: 'https://news.ycombinator.com/item?id=38491021',
          platform: 'hacker_news',
          author: 'contractor_ops',
          date: new Date(Date.now() - 86400000 * 5).toISOString(),
          snippet: 'We install HVAC. By the time my dispatchers see a web form submission, copy it into ServiceTitan, and dial the customer, 45 minutes have passed. Half the time the homeowner has already booked someone else. We lose $5k+ jobs every month simply because no software immediately texts the prospect back with automated qualification.',
          evidenceType: 'WORKFLOW_PROBLEM',
          quality: 'HIGH',
          qualityScore: 89,
          firstHandMarkers: ['we install', 'by the time my dispatchers', 'we lose $5k+', 'copy it into'],
          painQuote: 'We lose $5k+ jobs every month simply because no software immediately texts the prospect back with automated qualification.',
        },
        {
          id: 'ev_sample_3',
          rawId: 'gh_issue_webhook_fail',
          title: 'Zapier Webhook timeouts on batch CRM sync leads to silent customer drops',
          url: 'https://github.com/activecampaign/api/issues/492',
          platform: 'github',
          author: 'agency_dev_mark',
          date: new Date(Date.now() - 86400000 * 9).toISOString(),
          snippet: 'Our agency maintains 20+ client Zapier automations. Whenever a form payload exceeds 500ms, Zapier drops the webhook without alert. Small business clients do not discover the missing leads until weeks later. A resilient queue dedicated for lead triage is urgently needed.',
          evidenceType: 'GITHUB_ISSUE',
          quality: 'HIGH',
          qualityScore: 86,
          firstHandMarkers: ['our agency', 'small business clients do not discover', 'urgently needed'],
          painQuote: 'Small business clients do not discover the missing leads until weeks later due to dropped webhooks.',
        },
      ],
      problems: [
        {
          id: 'prob_1',
          problemStatement: 'Delayed inbound lead response causing trade and service operators to lose high-value customer inquiries to faster competitors',
          targetUser: 'Trade contractors, home services, and boutique local businesses',
          userContext: 'Managing inbound inquiries via website forms while out on job sites or during busy operational hours.',
          jobWorkflow: 'Inbound lead form → Manual copy into CRM → Phone call dispatch',
          painPoint: 'Speed-to-lead latency exceeding 30–60 minutes, leading to immediate customer drop-off.',
          whyPainful: 'Homeowners and buyers contact 2-3 vendors simultaneously; the first responsive contractor wins the contract.',
          currentWorkaround: 'Dispatchers manually monitor email inboxes or operators frantically check phones between client visits.',
          frequency: 'Daily (multiple times per day)',
          evidenceQuotes: [
            {
              quote: 'We lose $5k+ jobs every month simply because no software immediately texts the prospect back with automated qualification.',
              sourceUrl: 'https://news.ycombinator.com/item?id=38491021',
              sourceTitle: 'Comment on: Why speed-to-lead is dying in service businesses',
              author: 'contractor_ops',
              platform: 'hacker_news',
            },
          ],
          evidenceIds: ['ev_sample_2', 'ev_sample_3'],
          signalCount: 4,
          sourceLinks: ['https://news.ycombinator.com/item?id=38491021', 'https://github.com/activecampaign/api/issues/492'],
          evidenceQuality: 'HIGH',
          confidence: 88,
        },
        {
          id: 'prob_2',
          problemStatement: 'Manual invoice matching and multi-gateway payment reconciliation consuming operator weekends',
          targetUser: 'Small retail, wholesale suppliers, and boutique B2B agencies',
          userContext: 'Managing accounts receivable across disparate payment rails (Stripe, ACH, bank transfers, checks).',
          jobWorkflow: 'Invoice created → Bank payout received → Manual ledger line-item reconciliation',
          painPoint: 'Discrepancies in deposit batch amounts versus individual invoices requiring hours of manual cross-referencing.',
          whyPainful: 'Wastes 5–8 hours every weekend and delays knowing which clients are truly overdue.',
          currentWorkaround: 'Maintaining complex Google Sheets/Excel spreadsheets with manual copy-pasting',
          frequency: 'Weekly (recurring routine)',
          evidenceQuotes: [
            {
              quote: 'I spend my entire Sunday cross-referencing QuickBooks and bank feeds with no simple tool that just matches deposit amounts to invoice numbers automatically.',
              sourceUrl: 'https://reddit.com/r/smallbusiness/comments/invoicing_nightmare',
              sourceTitle: 'I spend 8 hours every weekend matching paper invoices with Stripe payouts',
              author: 'bakery_owner_dan',
              platform: 'reddit',
            },
          ],
          evidenceIds: ['ev_sample_1'],
          signalCount: 3,
          sourceLinks: ['https://reddit.com/r/smallbusiness/comments/invoicing_nightmare'],
          evidenceQuality: 'HIGH',
          confidence: 82,
        },
      ],
      clusters: [
        {
          id: 'clust_1',
          clusterName: 'Lead Acquisition & Rapid Response Pipeline',
          description: 'Operational bottlenecks centered on lead intake speed, automated qualification, and CRM synchronization.',
          problemIds: ['prob_1'],
          signalCount: 4,
          sourceDiversity: 3,
          commonAffectedUsers: 'Trade contractors and local service business owners',
          commonWorkflow: 'Inbound lead capture → instant qualification → calendar booking',
          overallEvidenceStrength: 'HIGH',
        },
        {
          id: 'clust_2',
          clusterName: 'Financial Ops, Invoicing & Reconciliation',
          description: 'Multi-rail payment tracking, overdue follow-ups, and accounting reconciliation friction.',
          problemIds: ['prob_2'],
          signalCount: 3,
          sourceDiversity: 2,
          commonAffectedUsers: 'Small wholesale, retail, and service firm operators',
          commonWorkflow: 'Invoice issuance → payment receipt → accounting ledger reconciliation',
          overallEvidenceStrength: 'HIGH',
        },
      ],
      existingSolutions: [
        {
          name: 'HubSpot / ServiceTitan / Jobber',
          type: 'software_product',
          whatUsersDo: 'Use large enterprise suites to manage jobs, invoices, and CRM records.',
          positiveAspects: ['Comprehensive all-in-one features', 'Industry recognition'],
          complaints: ['Extremely expensive ($250+/month)', 'Cluttered and slow mobile interfaces', 'Weak automated SMS qualification without high-tier add-ons'],
          missingFunctionality: ['Sub-60-second autonomous two-way SMS qualification without complex custom engineering'],
          pricingInfo: '$150 – $400/month',
          integrationLimitations: ['Requires heavy Zapier configurations for lightweight custom forms'],
          complexityFriction: 'Requires dedicated training and hours of menu navigation.',
          unservedSegments: 'Solo contractors and businesses with under 5 employees who want instant automation without software bloat.',
        },
      ],
      gaps: [
        {
          id: 'gap_1',
          gapType: 'excessive_complexity',
          title: 'Existing CRM & field software is too bloated and slow for instant mobile lead qualification',
          description: 'Incumbents prioritize deep accounting and dispatch features at the cost of lightweight, instant customer engagement within the critical first 5 minutes.',
          supportingEvidenceIds: ['ev_sample_2'],
          supportingQuotes: ['We lose $5k+ jobs every month simply because no software immediately texts the prospect back with automated qualification.'],
          isAiInference: false,
        },
      ],
      opportunities: [
        {
          id: 'opp_leadpulse',
          name: 'LeadPulse: 60-Second Inbound Lead Responder & Qualifier',
          oneLineDescription: 'Instantly qualifies website leads via conversational SMS within 60 seconds and syncs directly to spreadsheets.',
          targetCustomer: 'Trade contractors, home services, and boutique local businesses',
          userProblem: 'Delayed inbound lead response causing operators to lose high-value customer inquiries to faster competitors.',
          evidenceSummary: 'Backed by 4 independent user signals across Reddit, Hacker News, and GitHub. Operators report losing $5,000+ monthly due to manual lead delay.',
          evidenceQuotes: [
            {
              quote: 'We lose $5k+ jobs every month simply because no software immediately texts the prospect back with automated qualification.',
              url: 'https://news.ycombinator.com/item?id=38491021',
              platform: 'hacker_news',
              author: 'contractor_ops',
            },
          ],
          existingAlternatives: 'Manual email checks, bloated $300/mo CRMs, or fragile Zapier-to-Twilio hacks.',
          gap: 'No lightweight tool bridges the gap between web form submission and immediate 2-way conversational SMS qualification without enterprise bloat.',
          proposedSolution: 'A dead-simple webhook receiver that captures incoming form leads, immediately texts the customer with smart qualifying questions, and posts verified jobs directly into the owner’s phone & Google Sheet.',
          coreWorkflow: 'Web form submitted → Instant SMS sent within 30s → Lead replies with timing/budget → Owner gets notified via push & spreadsheet updated',
          whyUseful: 'Recovers thousands in lost revenue by capitalizing on customer buying intent during the first 5 minutes.',
          mvpScope: [
            'Webhook receiver for Typeform, Webflow, and WordPress forms',
            'Twilio SMS engine with 2-question qualification sequence',
            'Real-time Google Sheet sync',
            'SMS alert to business owner when lead is qualified',
          ],
          whatNotToBuildInitially: [
            'No visual drag-and-drop workflow canvas',
            'No mobile app (pure web/SMS/Google Sheets interface)',
            'No multi-seat call center management',
            'No custom billing engine',
          ],
          technicalComplexity: 'Low',
          estimatedMvpBuildTime: '5–7 business days',
          keyDependencies: ['Twilio SMS API', 'Google Sheets API', 'Node.js webhook receiver'],
          majorRisks: ['Twilio A2P 10DLC registration requirements for US SMS carriers'],
          monetizationPossibilities: ['$49/month flat fee for up to 200 leads', '$99/month for multi-location businesses'],
          distributionDifficulty: 'Low',
          validationExperiment: {
            hypothesis: 'Home service operators will pay $49/mo to automatically qualify leads within 60 seconds of form submission.',
            test: 'Reach out to 10 local contractors on Reddit and local forums. Offer a 3-day concierge trial where we hook their existing contact form to our SMS test number for free.',
            targetUsers: 'Local HVAC, plumbing, roofing, and remodeling contractors',
            successSignal: 'At least 3 of 10 operators report booking a client that would have otherwise gone cold, and agree to paid subscription.',
            invalidationSignal: 'Contractors report their customers prefer email or that leads complain about receiving an automated text.',
          },
          evidenceConfidence: 88,
          clusterId: 'clust_1',
          mvpProfile: {
            complexity: 'Low',
            estimatedBuildTime: '5–7 business days',
            coreComponents: [
              'Webhook ingestion endpoint',
              'Twilio conversational SMS worker',
              'Google Sheets append integration',
              'Owner SMS notification trigger',
            ],
            requiredIntegrations: ['Twilio', 'Google Sheets'],
            aiRequirements: 'Lightweight prompt classifying lead intent and urgent timing',
            dataRequirements: 'Encrypted storage for webhook secrets and recent conversation states',
            mainTechnicalRisks: ['Carrier SMS delivery filtering'],
            mainBusinessRisks: ['Low lead volume for micro businesses causing perceived lack of value'],
            validationDifficulty: 'Low',
          },
          isSaved: true,
          notes: 'High demand in local service subreddits; strong potential for $49/mo micro-SaaS.',
        },
      ],
      weakSignals: [
        {
          id: 'weak_1',
          title: 'AI phone call answering for noisy warehouse environments',
          userStatement: 'I wish someone made an AI phone bot that could decipher background noise in our scrap yard.',
          platform: 'reddit',
          sourceUrl: 'https://reddit.com/r/smallbusiness/comments/phone_noise',
          whyInsufficient: 'Single isolated request with high technical speech-to-noise complexity and insufficient willingness-to-pay signals.',
          potentialValue: 'Could be revisited if low-latency noise cancellation models improve.',
        },
      ],
      reportMarkdown: `# Cevon Opportunity Radar: Product Opportunity Report\n**Topic**: AI automation for small businesses\n\nExecutive Summary\nHigh potential identified in instant inbound lead response...`,
    };

    this.data.runs.push(sampleRun);
    this.data.savedOpportunities.push(sampleRun.opportunities[0]);
    this.save();
  }
}
