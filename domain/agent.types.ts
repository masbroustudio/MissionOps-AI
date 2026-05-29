export interface Agent {
  id: string;
  name: string;
  role: string;
  responsibilities: string[];
  status?: 'idle' | 'analyzing' | 'drafting' | 'reviewing' | 'active';
  lastAction?: string;
  avatarUrl?: string;
}

export type AgentRole = 
  | 'strategist'
  | 'architect'
  | 'compliance'
  | 'analyst'
  | 'coordinator'
  | 'briefer';
