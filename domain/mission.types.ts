import { Agent } from './agent.types';
import { Milestone, ApprovalGate } from './workflow.types';
import { Risk } from './risk.types';

export interface KPI {
  name: string;
  target: string;
  measurementMethod: string;
}

export interface ExecutiveBriefing {
  headline: string;
  currentStatus: string;
  topRisks: string[];
  nextDecisions: string[];
  recommendedActions: string[];
}

export interface MissionPlan {
  missionId: string;
  title: string;
  objective: string;
  summary: string;
  businessRationale: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'draft' | 'planning' | 'pending_approval' | 'active' | 'blocked' | 'completed' | 'failed';
  kpis: KPI[];
  milestones: Milestone[];
  risks: Risk[];
  agents: Agent[];
  approvalGates: ApprovalGate[];
  executiveBriefing: ExecutiveBriefing;
  createdAt: string;
  updatedAt: string;
  sourceProvider?: string;
  isDemoFallback?: boolean;
  confidenceScore?: number;
  riskLevel?: 'low' | 'medium' | 'high' | 'critical';
}

export interface MissionContext {
  department?: string;
  deadline?: string;
  priority?: 'low' | 'medium' | 'high' | 'critical';
  teams?: string;
  constraints?: string;
  riskTolerance?: 'low' | 'medium' | 'high';
}
