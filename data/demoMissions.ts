import { MissionPlan } from '@/domain/mission.types';

export const DEMO_MISSIONS: MissionPlan[] = [
  {
    missionId: 'msn-churn-reduct',
    title: 'Enterprise Customer Churn Reduction',
    objective: 'Reduce enterprise customer churn by 10% in 90 days',
    summary: 'Coordinate a targeted outreach drive and database patch SLA to secure high-risk key corporate partners.',
    businessRationale: 'Uncontrolled enterprise churn presents an annualized revenue threat of $4.2M. Protecting baseline accounts stabilizes operating margins.',
    priority: 'critical',
    status: 'pending_approval',
    createdAt: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString(),
    sourceProvider: 'Gemini',
    confidenceScore: 0.95,
    riskLevel: 'high',
    isDemoFallback: false,
    kpis: [
      { name: 'MRR Gross Churn Rate', target: '< 4.5%', measurementMethod: 'Calculated in Stripe Billing metrics dashboards.' },
      { name: 'Red-Account Outreach Success', target: '> 80% Retention', measurementMethod: 'Survey audits in CRM records.' }
    ],
    milestones: [
      {
        id: 'm1',
        title: 'Telemetry Modeling',
        description: 'Aggregate usage metrics to score churn risk.',
        ownerRole: 'Data Analyst Agent',
        dueInDays: 15,
        tasks: [
          {
            id: 't1_1',
            title: 'Aggregate Usage Logs',
            description: 'Extract API requests and user sessions to spot decay trends.',
            ownerRole: 'Data Analyst',
            estimatedHours: 20,
            dependencies: [],
            requiresApproval: false,
            status: 'done',
            completedAt: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString()
          },
          {
            id: 't1_2',
            title: 'Deploy Weighted Churn Risk Score',
            description: 'Deploy scoring logic combining tick rates, bill flags, and portal delays.',
            ownerRole: 'Mission Strategist',
            estimatedHours: 35,
            dependencies: ['t1_1'],
            requiresApproval: true,
            status: 'pending_approval'
          }
        ]
      },
      {
        id: 'm2',
        title: 'SLA Escalation Engine',
        description: 'Establish high-priority queues for at-risk SLA tickets.',
        ownerRole: 'Workflow Architect Agent',
        dueInDays: 45,
        tasks: [
          {
            id: 't2_1',
            title: 'Launch Red-Account Playbook',
            description: 'Customer success reps coordinate direct engineering workshops with flagged clients.',
            ownerRole: 'Execution Coordinator',
            estimatedHours: 40,
            dependencies: [],
            requiresApproval: false,
            status: 'todo'
          }
        ]
      }
    ],
    risks: [
      {
        id: 'r1',
        title: 'Aggressive Competitor Poaching',
        description: 'Direct competitor is emailing deep buy-out credits directly to our core corporate clients.',
        severity: 'high',
        likelihood: 'high',
        mitigation: 'Equip CS with ROI audits proving strong platform switching costs.'
      }
    ],
    agents: [
      { id: 'ag1', name: 'Alpha Strategist', role: 'Mission Strategist', responsibilities: ['Synthesize commercial retention parameters'], status: 'idle' },
      { id: 'ag3', name: 'Sentinel Risk Analyzer', role: 'Risk & Compliance', responsibilities: ['Audit SLA requirements compliance'], status: 'analyzing', lastAction: 'Reviewing key SLA contracts.' }
    ],
    approvalGates: [
      {
        id: 'g1',
        title: 'Authorize Strategic Discounting Limits',
        approverRole: 'VP of Finance',
        requiredBefore: 'm2',
        riskIfSkipped: 'Unregulated contracts restructuring will dilute general margins.',
        status: 'pending'
      }
    ],
    executiveBriefing: {
      headline: 'CHURN MITIGATION STAGED. Telemetry modeling awaiting scoring approval.',
      currentStatus: 'Usage log pipeline completed. Strategic discount limits and churn models routed for human review.',
      topRisks: ['SLA staffing capacity.', 'Competitor pricing drops.'],
      nextDecisions: ['Approve outstanding discount bounds.', 'Authorize regional engagement models.'],
      recommendedActions: ['Direct CS to begin red-alert review calls.', 'Review developer queue allocations.']
    }
  },
  {
    missionId: 'msn-sub-launch',
    title: 'Surabaya Regional Expansion',
    objective: 'Prepare a new branch launch in Surabaya',
    summary: 'Orchestrate municipal legal work, physical asset acquisition, and hiring logistics for the Surabaya retail center.',
    businessRationale: 'East Java consumer demand is up 32%. A Surabaya hub cuts shipping latency by 4 days, capturing premium sales lanes.',
    priority: 'high',
    status: 'active',
    createdAt: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString(),
    sourceProvider: 'MockProvider',
    confidenceScore: 0.91,
    riskLevel: 'medium',
    isDemoFallback: true,
    kpis: [
      { name: 'Site Lease Fitout', target: 'Signed Lease & Fitout complete', measurementMethod: 'Field inspection and photo reports.' }
    ],
    milestones: [
      {
        id: 'm1',
        title: 'Asset Acquisition',
        description: 'Verify leases and city planning documents.',
        ownerRole: 'Risk & Compliance Agent',
        dueInDays: 30,
        tasks: [
          {
            id: 't1_1',
            title: 'Verify Commercial Site Lease',
            description: 'Evaluate municipal zone rules and leasing rates.',
            ownerRole: 'Risk & Compliance Agent',
            estimatedHours: 15,
            dependencies: [],
            requiresApproval: true,
            status: 'done',
            completedAt: new Date(Date.now() - 4 * 24 * 3600 * 1000).toISOString(),
            approvedBy: 'adm-1'
          },
          {
            id: 't1_2',
            title: 'Procure Network and Server Slabs',
            description: 'Order routing switches, physical racks, and coordinate local IT dispatch.',
            ownerRole: 'Execution Coordinator',
            estimatedHours: 30,
            dependencies: ['t1_1'],
            requiresApproval: false,
            status: 'in_progress'
          }
        ]
      }
    ],
    risks: [
      {
        id: 'r1',
        title: 'Municipal Board Backlogs',
        description: 'Municipal reviews can take over 4 weeks due to summer staff leave calendars.',
        severity: 'medium',
        likelihood: 'medium',
        mitigation: 'Engage East Java proxy legal counsel to expedite forms submission.'
      }
    ],
    agents: [
      { id: 'ag5', name: 'Tactical Coordinator', role: 'Execution Coordinator', responsibilities: ['Manage hardware shipment lines', 'Schedule logistics'], status: 'active', lastAction: 'Procuring router switches.' }
    ],
    approvalGates: [
      {
        id: 'g2',
        title: 'Approve Lease Agreement Leaseholder',
        approverRole: 'Head of Retail Leases',
        requiredBefore: 'm1',
        riskIfSkipped: 'Taking leaseholds without evaluation risks severe budget exposures.',
        status: 'approved',
        decidedBy: 'Chief Fin Officer',
        decidedAt: new Date(Date.now() - 4 * 24 * 3600 * 1000).toISOString()
      }
    ],
    executiveBriefing: {
      headline: 'SURABAYA HUB SECURED. Lease agreement cleared.',
      currentStatus: 'Site contract is fully signed off. Slabs and router delivery dispatched in-progress. Local permits pending municipal filing receipt.',
      topRisks: ['Government agency delays.', 'Field tech shortage.'],
      nextDecisions: ['Approve staffing budget lines.'],
      recommendedActions: ['Instruct shipping partner to expedite delivery.', 'Finalize job ads.']
    }
  }
];
