import { IMissionRepository } from '@/repositories/mission.repository';
import { LLMRouter } from '@/llm/llmRouter';
import { MissionPlan, MissionContext } from '@/domain/mission.types';
import { MISSION_PLAN_SCHEMA_DESCRIPTION } from '@/llm/schemas/missionPlan.schema';
import { AuditService } from './audit.service';

export class MissionPlannerService {
  private repository: IMissionRepository;
  private router: LLMRouter;
  private auditService: AuditService;

  constructor(repository: IMissionRepository, router: LLMRouter, auditService: AuditService) {
    this.repository = repository;
    this.router = router;
    this.auditService = auditService;
  }

  public async planMission(objective: string, context?: MissionContext): Promise<MissionPlan> {
    const tempId = `msn-temp-${Math.random().toString(36).substr(2, 9)}`;
    
    this.auditService.logEvent(
      tempId,
      'mission_created',
      'user',
      `Parsed mission intent: "${objective}"`,
      { context }
    );

    const prompt = `
      You are MissionOps AI, the state-of-the-art enterprise operational mission control system.
      A high-level business objective has been defined:
      "${objective}"

      Optional Context Provided:
      - Target Department: ${context?.department || 'Not Specified'}
      - Deadline Target: ${context?.deadline || 'Not Specified'}
      - Business priority: ${context?.priority || 'medium'}
      - Available teams: ${context?.teams || 'Not Specified'}
      - Execution Constraints: ${context?.constraints || 'None'}
      - Risk Tolerance level: ${context?.riskTolerance || 'medium'}

      Please compile a detailed execution mission plan strictly following the JSON blueprint format.
      Make the response fully specific, detailing:
      - 3 core milestones with realistic technical tasks
      - Clear cross-functional task dependencies (referencing exact task ids)
      - Roles for agents: strategist, architect, compliance, analyst, coordinator, briefer
      - Explicit approval gates limiting critical action items
      - Active KPIs and operational safety mitigation briefs
    `;

    const systemInstruction = `
      You are the Principal Systems Strategist for MissionOps AI.
      You compile professional, precise, enterprise-grade workflow maps.
      Never output conversational prefixes or copy/explain tags.
      Output ONLY valid JSON matching the specified blueprint.
    `;

    const response = await this.router.generateJson<any>(
      tempId,
      {
        prompt,
        systemInstruction,
        temperature: 0.2,
      },
      MISSION_PLAN_SCHEMA_DESCRIPTION
    );

    let plan: MissionPlan;
    if (response.success && response.parsedJson) {
      plan = response.parsedJson;
      // Ensure objective is logged
      plan.objective = objective;
      
      // Assure IDs are clean
      const finalId = `msn-${Math.random().toString(36).substr(2, 9)}`;
      plan.missionId = finalId;
      plan.status = 'pending_approval';
      plan.createdAt = new Date().toISOString();
      plan.updatedAt = new Date().toISOString();
      plan.sourceProvider = response.providerName;
      
      // Backfill metadata
      plan.confidenceScore = plan.confidenceScore || 0.94;
      plan.riskLevel = plan.riskLevel || (context?.riskTolerance === 'low' ? 'low' : 'medium');
      plan.isDemoFallback = response.providerName === 'MockProvider';

      // Fix task statuses if missing or nested
      if (plan.milestones) {
        plan.milestones.forEach(m => {
          if (m.tasks) {
            m.tasks.forEach(t => {
              t.status = t.status || 'todo';
            });
          }
        });
      }

      // Fix gate statuses if missing or nested
      if (plan.approvalGates) {
        plan.approvalGates.forEach(g => {
          g.status = g.status || 'pending';
        });
      }

      this.auditService.logEvent(
        plan.missionId,
        'workflow_generated',
        'system',
        `Completed mission pipeline compilation via ${response.providerName} (${response.modelUsed}) in ${response.latencyMs}ms.`,
        { provider: response.providerName, model: response.modelUsed, latencyMs: response.latencyMs }
      );
    } else {
      throw new Error(`Orchestration Engine failed to compile mission blueprint: ${response.error}`);
    }

    // Save plan to repository
    await this.repository.createMission(plan);
    return plan;
  }
}
