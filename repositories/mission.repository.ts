import { MissionPlan } from '@/domain/mission.types';

export interface IMissionRepository {
  createMission(plan: MissionPlan): Promise<void>;
  getMission(id: string): Promise<MissionPlan | null>;
  listMissions(): Promise<MissionPlan[]>;
  updateMission(id: string, updates: Partial<MissionPlan>): Promise<void>;
  deleteMission(id: string): Promise<void>;
}
