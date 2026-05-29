import { AuditLogEntry } from '@/domain/audit.types';

export interface IAuditRepository {
  logEvent(event: AuditLogEntry): Promise<void>;
  listEvents(missionId?: string): Promise<AuditLogEntry[]>;
}
