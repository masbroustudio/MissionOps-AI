export interface AuditLogEntry {
  id: string;
  missionId: string;
  timestamp: string;
  eventType: 
    | 'mission_created' 
    | 'objective_parsed' 
    | 'model_called' 
    | 'fallback_triggered' 
    | 'workflow_generated' 
    | 'task_updated' 
    | 'approval_requested' 
    | 'approval_granted' 
    | 'approval_rejected' 
    | 'briefing_generated' 
    | 'simulation_step' 
    | 'provider_error';
  userId: string;
  message: string;
  details?: Record<string, any>;
  providerName?: string;
  modelName?: string;
}
