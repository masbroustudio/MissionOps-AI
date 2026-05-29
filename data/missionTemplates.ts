export interface MissionTemplate {
  name: string;
  objective: string;
  department: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  teams: string;
  constraints: string;
}

export const MISSION_TEMPLATES: MissionTemplate[] = [
  {
    name: 'Customer Churn Reduction',
    objective: 'Reduce enterprise customer churn by 10% in 90 days',
    department: 'Customer Success / Product Engineering',
    priority: 'critical',
    teams: 'CS Operations, SRE Platform Teams, Business Analytics',
    constraints: 'Must not introduce legacy client discounting exceeding 15% ARR'
  },
  {
    name: 'Regional Branch Launch',
    objective: 'Prepare a new branch launch in Surabaya',
    department: 'Global Operations & Expansion',
    priority: 'high',
    teams: 'Lease Procurement, Regional Legal Counsel, Local Recruitment Managers',
    constraints: 'Compliance with local municipal retail zoning regulations'
  },
  {
    name: 'SLA Incident Recovery',
    objective: 'Recover payment service after a production incident',
    department: 'Site Reliability Engineering / Payments Gateways',
    priority: 'critical',
    teams: 'Cloud Core Infrastructure Engineers, Ledger Reconciliation Specialists',
    constraints: 'Zero-downtime database routing transition; 100% token audits'
  },
  {
    name: 'B2B Product Launch',
    objective: 'Launch a B2B product in 6 weeks',
    department: 'Product Marketing & Corporate Sales',
    priority: 'high',
    teams: 'Product Marketing Sprints, Legal Compliance, CRM Integration Experts',
    constraints: 'SOC2 operational compliance framework validation matches'
  }
];
