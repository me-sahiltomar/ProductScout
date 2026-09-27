import { 
  ExtractedProblem, 
  MarketGap, 
  MvpBuildProfile, 
  ProblemCluster, 
  ProductOpportunity, 
  ResearchRunConfig, 
  ValidationExperiment 
} from '@/types';

export class OpportunityGenerator {
  public generateOpportunities(
    clusters: ProblemCluster[],
    problems: ExtractedProblem[],
    gaps: MarketGap[],
    config: ResearchRunConfig
  ): ProductOpportunity[] {
    const opportunities: ProductOpportunity[] = [];
    const probMap = new Map<string, ExtractedProblem>();
    problems.forEach(p => probMap.set(p.id, p));

    for (const cluster of clusters) {
      const clusterProbs = cluster.problemIds
        .map(id => probMap.get(id))
        .filter((p): p is ExtractedProblem => !!p);

      if (clusterProbs.length === 0) continue;

      const primaryProblem = clusterProbs[0];
      const relevantGap = gaps.find(g => g.id.includes(cluster.id)) || gaps[0];

      const opp = this.buildOpportunityForCluster(cluster, primaryProblem, relevantGap, config);
      opportunities.push(opp);
    }

    return opportunities.sort((a, b) => b.evidenceConfidence - a.evidenceConfidence);
  }

  private buildOpportunityForCluster(
    cluster: ProblemCluster,
    problem: ExtractedProblem,
    gap: MarketGap | undefined,
    _config: ResearchRunConfig
  ): ProductOpportunity {
    const clusterName = cluster.clusterName.toLowerCase();

    let name = 'Automated Workflow Engine';
    let oneLiner = 'An opinionated micro-tool that replaces manual friction with an instant automated pipeline.';
    let proposedSolution = 'A streamlined single-purpose utility that automates the core workflow end-to-end without bloated enterprise dashboards.';
    let coreWorkflow = problem.jobWorkflow;
    let mvpScope: string[] = [];
    let whatNotToBuild: string[] = [];
    let technicalComplexity: 'Low' | 'Medium' | 'High' = 'Medium';
    let estimatedMvpBuildTime = '1–2 weeks';
    let keyDependencies: string[] = ['Public Webhook API', 'Email/SMS Gateway', 'Database for state tracking'];
    let majorRisks: string[] = ['Platform API rate limits or schema changes', 'User inertia sticking with spreadsheets'];
    let monetizationPossibilities: string[] = ['Flat $29/month or $49/month unlimited', 'Pay-per-successful-execution tier'];
    let distributionDifficulty: 'Low' | 'Medium' | 'High' = 'Medium';
    let aiRequirements = 'Structured classification and entity extraction using lightweight prompt templates';
    let dataRequirements = 'Stateless or minimal operational state storage with customer webhook secrets';
    let mainTechnicalRisks = ['Handling edge case formats and webhook timeouts'];
    let mainBusinessRisks = ['Customer acquisition cost exceeding low monthly price point'];

    if (/lead|crm|sales/i.test(clusterName)) {
      name = 'LeadPulse: Instant Inbound Lead Responder & Qualifier';
      oneLiner = 'Instantly qualifies inbound website inquiries via SMS/Email within 60 seconds and updates CRM records.';
      proposedSolution = 'A zero-setup webhook receiver that captures incoming web form inquiries, executes an instant qualification rubric, sends a personalized conversational SMS or email, and syncs status directly into the operator’s existing spreadsheet or CRM.';
      coreWorkflow = 'Inquiry received → Automated qualification text dispatched → Customer responds → CRM updated & operator alerted';
      mvpScope = [
        'Single webhook endpoint to receive lead payloads (Zapier, Webflow, Typeform)',
        'Rules-based / AI prompt qualifier extracting budget, timeline, and need',
        'Twilio SMS or Resend email dispatch template',
        'Two-way status sync to Google Sheets or Airtable',
      ];
      whatNotToBuild = [
        'Custom CRM contact management dashboard',
        'Complex visual flow builder or drag-and-drop node graph',
        'Multi-seat team permission hierarchies',
        'Telephony calling or interactive voice response (IVR)',
      ];
      technicalComplexity = 'Low';
      estimatedMvpBuildTime = '5–7 business days';
      keyDependencies = ['Twilio / Resend API', 'Google Sheets API / Webhooks'];
      majorRisks = ['Twilio A2P 10DLC registration requirements for US SMS', 'Competitors offering bundled features'];
      monetizationPossibilities = ['$39/month for up to 250 qualified leads', '$79/month for high-volume agencies'];
      distributionDifficulty = 'Low';
      aiRequirements = 'Zero-shot prompt to categorize buyer urgency (High/Med/Low) and extract contact details';
      dataRequirements = 'Encrypted webhook payload log and API keys';
      mainTechnicalRisks = ['SMS delivery carrier filtering'];
      mainBusinessRisks = ['High churn if client does not have steady organic web traffic'];
    } else if (/invoice|billing|accounting/i.test(clusterName)) {
      name = 'RemindFlow: Automated Accounts Receivable Chaser';
      oneLiner = 'Eliminates awkward manual invoice chasing with automated, personalized payment reminders and direct payment links.';
      proposedSolution = 'Connects to Stripe or QuickBooks in one click, monitors unpaid invoices approaching or past due dates, and sends courteous, escalating multi-channel reminders (Email + SMS) with one-click payment links.';
      coreWorkflow = 'Sync unpaid invoices → Evaluate payment schedule → Dispatch smart reminder sequence → Reconcile paid status';
      mvpScope = [
        'Stripe / Xero read-only OAuth integration for unpaid invoices',
        'Configurable 3-step reminder sequence (-3 days, due date, +5 days overdue)',
        'Polite pre-written communication templates',
        'One-click "Paid outside system" status toggle',
      ];
      whatNotToBuild = [
        'Full accounting ledger or tax calculation engine',
        'In-house merchant payment processing',
        'Multi-currency balance sheet reports',
        'Contract signing or proposal generation',
      ];
      technicalComplexity = 'Low';
      estimatedMvpBuildTime = '10 business days';
      keyDependencies = ['Stripe Connect API / Xero API', 'SendGrid or Postmark API'];
      majorRisks = ['User fear of embarrassing important enterprise clients with automated emails'];
      monetizationPossibilities = ['$49/month flat fee', '1% recovery fee on overdue collections past 30 days'];
      distributionDifficulty = 'Medium';
      aiRequirements = 'Contextual tone adjustment for friendly vs formal client relationships';
      dataRequirements = 'Customer email, invoice ID, invoice balance, due date';
      mainTechnicalRisks = ['Sync delays between accounting ledger and payment gateway'];
      mainBusinessRisks = ['Clients perceiving automated reminders as impersonal'];
    } else if (/support|customer|inbox/i.test(clusterName)) {
      name = 'TicketCopilot: Micro-Business Support Draft Assistant';
      oneLiner = 'Auto-generates verified customer response drafts referencing order systems without requiring human search.';
      proposedSolution = 'A lightweight browser extension and webhook widget that connects to Shopify/WooCommerce and drafts 1-click customer replies inside Gmail or Zendesk.';
      coreWorkflow = 'Customer writes email → Copilot pulls order tracking & refund policy → Generates draft → Human clicks approve';
      mvpScope = [
        'Chrome extension or Gmail Add-on reading active email sender',
        'Shopify API integration fetching order status and tracking URL',
        'Draft response box with "Insert Draft into Reply" button',
        'Basic internal FAQ knowledge snippet configuration',
      ];
      whatNotToBuild = [
        'Autonomous auto-sending without human review',
        'Full ticketing helpdesk replacement',
        'Live chat pop-up widget',
        'Voice support transcription',
      ];
      technicalComplexity = 'Medium';
      estimatedMvpBuildTime = '2 weeks';
      keyDependencies = ['Chrome Extension Manifest V3', 'Shopify / WooCommerce REST API'];
      majorRisks = ['Chrome Web Store review delays', 'Shopify API permission scopes'];
      monetizationPossibilities = ['$29/month per support inbox', '$69/month for multiple storefronts'];
      distributionDifficulty = 'Low';
      aiRequirements = 'RAG over store return policy + order details prompt template';
      dataRequirements = 'Temporary token access to storefront order histories';
      mainTechnicalRisks = ['Maintaining Chrome extension DOM selectors across Gmail updates'];
      mainBusinessRisks = ['Support staff resisting new workflow habits'];
    } else if (/document|pdf|extraction/i.test(clusterName)) {
      name = 'DocuBridge: Unstructured Document Ingestion Pipeline';
      oneLiner = 'Turns inbound PDF invoices, work orders, and receipts into clean structured JSON and webhook records.';
      proposedSolution = 'A dedicated drop-box email and upload API that parses incoming PDF attachments, extracts structured key-value pairs (amounts, line items, dates, vendor names), and pushes them into the destination database.';
      coreWorkflow = 'Receive PDF via forwarding address → Extract key fields → Validate total math → Dispatch JSON webhook';
      mvpScope = [
        'Unique inbound email address per user (inbox@parse.cevon.app)',
        'High-accuracy Vision/LLM document parser with fixed JSON schema output',
        'Web dashboard showing original document side-by-side with parsed fields',
        'Webhook export trigger',
      ];
      whatNotToBuild = [
        'Native integrations with 50 niche ERPs',
        'Handwritten cursive historical document recognition',
        'Multi-lingual legal contract redlining',
        'Complex approval routing hierarchies',
      ];
      technicalComplexity = 'Medium';
      estimatedMvpBuildTime = '10 business days';
      keyDependencies = ['Inbound Mailgun/Postmark parser', 'Multimodal Vision API'];
      majorRisks = ['Unexpected invoice formatting variations causing field extraction misses'];
      monetizationPossibilities = ['$0.10 per parsed page or $49/mo for 500 pages'];
      distributionDifficulty = 'Medium';
      aiRequirements = 'Structured schema parsing with strict validation fallback';
      dataRequirements = 'S3-compatible bucket for encrypted PDF storage';
      mainTechnicalRisks = ['High resolution scanned image extraction latency'];
      mainBusinessRisks = ['Competing with established enterprise OCR giants'];
    } else {
      name = `${cluster.clusterName} Accelerator`;
      oneLiner = `A targeted operational automation tool resolving repetitive friction in ${problem.jobWorkflow}.`;
      proposedSolution = `A single-purpose SaaS application built specifically for ${problem.targetUser} to replace manual ${problem.currentWorkaround} with a reliable automated routine.`;
      coreWorkflow = problem.jobWorkflow;
      mvpScope = [
        'Single core workflow input screen',
        'Automated execution logic replacing manual spreadsheet steps',
        'Notification & status alert system',
        'CSV / Webhook export of processed records',
      ];
      whatNotToBuild = [
        'Enterprise RBAC and single sign-on (SSO)',
        'Complex analytics dashboards',
        'Custom template marketplace',
      ];
      technicalComplexity = 'Low';
      estimatedMvpBuildTime = '1–2 weeks';
      keyDependencies = ['Standard REST APIs', 'PostgreSQL / SQLite storage'];
      majorRisks = ['Market size too niche if not expanding adjacent workflows later'];
      monetizationPossibilities = ['$29–$49/month subscription'];
      distributionDifficulty = 'Medium';
      aiRequirements = 'Context classification and workflow validation';
      dataRequirements = 'User workspace preferences and activity logs';
      mainTechnicalRisks = ['Ensuring reliable third-party API connectivity'];
      mainBusinessRisks = ['Customer churn after initial problem is solved'];
    }

    const validationExperiment: ValidationExperiment = {
      hypothesis: `Target users (${problem.targetUser}) currently wasting hours on ${problem.currentWorkaround} will pay $30–$50/mo for a tool that automates ${problem.jobWorkflow}.`,
      test: `Reach out directly to 10–15 operators who posted complaints on Reddit/HN/communities; offer a free concierge manual trial where we run the workflow for them for 3 days to verify time saved and willingness to pay.`,
      targetUsers: problem.targetUser,
      successSignal: `At least 4 out of 10 interviewed operators express immediate relief and agree to a paid pilot or give credit card commitment for beta launch.`,
      invalidationSignal: `Operators state that while annoying, the current workaround takes less than 15 minutes a week and is not worth paying software subscriptions for.`,
    };

    const mvpProfile: MvpBuildProfile = {
      complexity: technicalComplexity,
      estimatedBuildTime: estimatedMvpBuildTime,
      coreComponents: mvpScope,
      requiredIntegrations: keyDependencies,
      aiRequirements,
      dataRequirements,
      mainTechnicalRisks,
      mainBusinessRisks,
      validationDifficulty: distributionDifficulty,
    };

    const gapDescription = gap ? gap.description : 'Incumbent software is bloated, overpriced, and fails to handle the end-to-end operational handoff.';

    return {
      id: `opp_${cluster.id}`,
      name,
      oneLineDescription: oneLiner,
      targetCustomer: problem.targetUser,
      userProblem: problem.problemStatement,
      evidenceSummary: `Backed by ${cluster.signalCount} independent user signals across ${cluster.sourceDiversity} public platform(s). Users currently cope via "${problem.currentWorkaround}".`,
      evidenceQuotes: problem.evidenceQuotes.map(q => ({
        quote: q.quote,
        url: q.sourceUrl,
        platform: q.platform,
        author: q.author,
      })),
      existingAlternatives: `Incumbent tools and manual methods: "${problem.currentWorkaround}". Incumbents charge high seat fees and create configuration friction.`,
      gap: gapDescription,
      proposedSolution,
      coreWorkflow,
      whyUseful: `Directly recovers 5–10 hours per week for ${problem.targetUser}, eliminates human transcription errors, and accelerates operational velocity.`,
      mvpScope,
      whatNotToBuildInitially: whatNotToBuild,
      technicalComplexity,
      estimatedMvpBuildTime,
      keyDependencies,
      majorRisks,
      monetizationPossibilities,
      distributionDifficulty,
      validationExperiment,
      evidenceConfidence: problem.confidence,
      clusterId: cluster.id,
      mvpProfile,
      isSaved: false,
    };
  }
}
