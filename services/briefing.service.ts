import { IMissionRepository } from '@/repositories/mission.repository';
import { LLMRouter } from '@/llm/llmRouter';
import { ExecutiveBriefing } from '@/domain/mission.types';
import { AuditService } from './audit.service';

export class BriefingService {
  private repository: IMissionRepository;
  private router: LLMRouter;
  private auditService: AuditService;

  constructor(repository: IMissionRepository, router: LLMRouter, auditService: AuditService) {
    this.repository = repository;
    this.router = router;
    this.auditService = auditService;
  }

  public async generateExecutiveBriefing(missionId: string): Promise<ExecutiveBriefing> {
    const plan = await this.repository.getMission(missionId);
    if (!plan) throw new Error('Mission not found.');

    this.auditService.logEvent(
      missionId,
      'briefing_generated',
      'user',
      `Triggered LLM synthesis for Executive briefing report.`,
      {}
    );

    const totalTasks = plan.milestones.flatMap(m => m.tasks).length;
    const completedTasks = plan.milestones.flatMap(m => m.tasks).filter(t => t.status === 'done').length;
    const progressPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    const activeBlockers = plan.milestones.flatMap(m => m.tasks).filter(t => t.status === 'blocked').length;

    const prompt = `
      You are the Lead Executive Briefing Agent for MissionOps AI.
      Work with the data elements of the operational plan:
      - Title: ${plan.title}
      - Main Objective: ${plan.objective}
      - Progress: ${completedTasks} / ${totalTasks} workflows completed (${progressPercent}%)
      - Active Developer Blockers: ${activeBlockers}
      - Identified Security Risks: ${plan.risks.map(r => r.title).join(', ') || 'None'}

      Please generate a polished, highly professional C-level status briefing report.
      Ensure the output strictly conforms to this JSON structure:
      {
        "headline": "A punchy summary title of current posture, e.g. SURABAYA BUILDOUT ON TRACK FOR MILESTONE 2",
        "currentStatus": "A detailed 2-sentence breakdown of active bottlenecks, team velocities, or approval delays",
        "topRisks": ["Risk bullet 1 description", "Risk bullet 2 description"],
        "nextDecisions": ["Immediate choice 1", "Immediate choice 2"],
        "recommendedActions": ["Immediate strategic recommendation 1", "Strategic recommendation 2"]
      }

      Do not surround the output with markdown fences or explanations. Output ONLY valid JSON.
    `;

    const response = await this.router.generateJson<ExecutiveBriefing>(
      missionId,
      {
        prompt,
        temperature: 0.3,
      },
      `ExecutiveBriefing JSON specifying properties: headline, currentStatus, topRisks, nextDecisions, recommendedActions.`
    );

    if (response.success && response.parsedJson) {
      const brief = response.parsedJson;
      await this.repository.updateMission(missionId, {
        executiveBriefing: brief,
      });
      return brief;
    } else {
      // Robust offline fallback
      const fallbackBrief: ExecutiveBriefing = {
        headline: `Operational Posture: ${plan.title} stands at ${progressPercent}% Completion.`,
        currentStatus: `System is executing in the "${plan.status.toUpperCase()}" state. Clear pathways mapped on Milestone 1. Pending human approval gates.`,
        topRisks: plan.risks.map(r => `${r.title} (Severity: ${r.severity.toUpperCase()})`),
        nextDecisions: [
          'Authorize operational lease contracts.',
          'Review SLA hotfix pool limitations.'
        ],
        recommendedActions: [
          'Deploy local legal advisors to audit regional municipal files.',
          'Execute automated database connection thread optimizations.'
        ]
      };
      
      await this.repository.updateMission(missionId, {
        executiveBriefing: fallbackBrief,
      });
      return fallbackBrief;
    }
  }
}
