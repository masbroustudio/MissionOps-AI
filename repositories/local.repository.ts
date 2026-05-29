import { IMissionRepository } from './mission.repository';
import { IAuditRepository } from './audit.repository';
import { MissionPlan } from '@/domain/mission.types';
import { AuditLogEntry } from '@/domain/audit.types';

// Global server-side storage maps to persist data across Next.js API requests.
// In Node.js environment, global objects are shared across requests.
const globalMissions = global as unknown as { _missions?: Map<string, MissionPlan> };
const globalAudits = global as unknown as { _audits?: AuditLogEntry[] };

if (!globalMissions._missions) {
  globalMissions._missions = new Map<string, MissionPlan>();
}

if (!globalAudits._audits) {
  globalAudits._audits = [];
}

export class LocalMissionRepository implements IMissionRepository {
  private getDb() {
    return globalMissions._missions!;
  }

  async createMission(plan: MissionPlan): Promise<void> {
    this.getDb().set(plan.missionId, plan);
  }

  async getMission(id: string): Promise<MissionPlan | null> {
    const mission = this.getDb().get(id);
    return mission || null;
  }

  async listMissions(): Promise<MissionPlan[]> {
    return Array.from(this.getDb().values()).sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async updateMission(id: string, updates: Partial<MissionPlan>): Promise<void> {
    const mission = this.getDb().get(id);
    if (mission) {
      const merged = {
        ...mission,
        ...updates,
        updatedAt: new Date().toISOString(),
      };
      
      // Deep merge milestone arrays if updated
      if (updates.milestones) {
        merged.milestones = updates.milestones;
      }
      this.getDb().set(id, merged);
    }
  }

  async deleteMission(id: string): Promise<void> {
    this.getDb().delete(id);
  }
}

export class LocalAuditRepository implements IAuditRepository {
  private getDb(): AuditLogEntry[] {
    return globalAudits._audits!;
  }

  async logEvent(event: AuditLogEntry): Promise<void> {
    this.getDb().push(event);
  }

  async listEvents(missionId?: string): Promise<AuditLogEntry[]> {
    const logs = this.getDb();
    if (missionId) {
      return logs.filter(l => l.missionId === missionId).sort((a, b) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );
    }
    return [...logs].sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }
}
