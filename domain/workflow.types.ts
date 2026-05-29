export interface Task {
  id: string;
  title: string;
  description: string;
  ownerRole: string;
  estimatedHours: number;
  dependencies: string[];
  requiresApproval: boolean;
  status: 'todo' | 'in_progress' | 'pending_approval' | 'blocked' | 'done';
  completedAt?: string;
  approvedBy?: string;
  feedback?: string;
}

export interface Milestone {
  id: string;
  title: string;
  description: string;
  ownerRole: string;
  dueInDays: number;
  tasks: Task[];
}

export interface ApprovalGate {
  id: string;
  title: string;
  approverRole: string;
  requiredBefore: string; // E.g. milestone id or task id
  riskIfSkipped: string;
  status?: 'pending' | 'approved' | 'rejected';
  decidedBy?: string;
  decidedAt?: string;
  comment?: string;
}
