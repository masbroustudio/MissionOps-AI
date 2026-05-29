import { IAuditRepository } from '@/repositories/audit.repository';
import { AuditLogEntry } from '@/domain/audit.types';
import { LocalAuditRepository } from '@/repositories/local.repository';

export class AuditService {
  private repository: IAuditRepository;

  constructor(repository?: IAuditRepository) {
    this.repository = repository || new LocalAuditRepository();
  }

  public logEvent(
    missionId: string,
    eventType: AuditLogEntry['eventType'],
    userId: string,
    message: string,
    details?: Record<string, any>,
    providerName?: string,
    modelName?: string
  ): void {
    const id = `aud-${Math.random().toString(36).substr(2, 9)}`;
    const event: AuditLogEntry = {
      id,
      missionId,
      timestamp: new Date().toISOString(),
      eventType,
      userId,
      message,
      details,
      providerName,
      modelName,
    };
    
    // Fire and forget
    this.repository.logEvent(event).catch(err => {
      console.error('Failed to log audit event:', err);
    });
  }

  public async getLogs(missionId?: string): Promise<AuditLogEntry[]> {
    return this.repository.listEvents(missionId);
  }
}
