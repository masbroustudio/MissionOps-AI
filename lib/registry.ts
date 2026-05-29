import { FirestoreMissionRepository, FirestoreAuditRepository } from '@/repositories/firestore.repository';
import { AuditService } from '@/services/audit.service';
import { LLMRouter } from '@/llm/llmRouter';
import { MissionPlannerService } from '@/services/missionPlanner.service';
import { WorkflowService } from '@/services/workflow.service';
import { ApprovalService } from '@/services/approval.service';
import { AgentOrchestratorService } from '@/services/agentOrchestrator.service';
import { BriefingService } from '@/services/briefing.service';
import { DEMO_MISSIONS } from '@/data/demoMissions';

class ServiceRegistry {
  public missionRepository: FirestoreMissionRepository;
  public auditRepository: FirestoreAuditRepository;
  public auditService: AuditService;
  public llmRouter: LLMRouter;
  public missionPlanner: MissionPlannerService;
  public workflowService: WorkflowService;
  public approvalService: ApprovalService;
  public agentOrchestrator: AgentOrchestratorService;
  public briefingService: BriefingService;

  constructor() {
    this.missionRepository = new FirestoreMissionRepository();
    this.auditRepository = new FirestoreAuditRepository();
    this.auditService = new AuditService(this.auditRepository);
    this.llmRouter = new LLMRouter(this.auditService);
    
    this.missionPlanner = new MissionPlannerService(
      this.missionRepository,
      this.llmRouter,
      this.auditService
    );
    this.workflowService = new WorkflowService(
      this.missionRepository,
      this.auditService
    );
    this.approvalService = new ApprovalService(
      this.missionRepository,
      this.auditService
    );
    this.agentOrchestrator = new AgentOrchestratorService(
      this.missionRepository,
      this.auditService
    );
    this.briefingService = new BriefingService(
      this.missionRepository,
      this.llmRouter,
      this.auditService
    );

    this.seedDemoMissions();
  }

  private async seedDemoMissions() {
    try {
      const existing = await this.missionRepository.listMissions();
      if (existing.length === 0) {
        for (const m of DEMO_MISSIONS) {
          await this.missionRepository.createMission(m);
          this.auditService.logEvent(
            m.missionId,
            'mission_created',
            'system',
            `Seeded pre-configured enterprise demo mission: "${m.title}".`,
            { seeded: true }
          );
        }
      }
    } catch (e) {
      console.error('Failed to seed demo missions:', e);
    }
  }
}

const globalRegistry = global as unknown as { _registry?: ServiceRegistry };
if (!globalRegistry._registry) {
  globalRegistry._registry = new ServiceRegistry();
}

export const registry = globalRegistry._registry!;
export type { ServiceRegistry };
