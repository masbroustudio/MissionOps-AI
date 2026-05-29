import { IMissionRepository } from '@/repositories/mission.repository';
import { AuditService } from './audit.service';
import { ApprovalGate } from '@/domain/workflow.types';

export class ApprovalService {
  private repository: IMissionRepository;
  private auditService: AuditService;

  constructor(repository: IMissionRepository, auditService: AuditService) {
    this.repository = repository;
    this.auditService = auditService;
  }

  public async decideGate(
    missionId: string,
    gateId: string,
    action: 'approve' | 'reject',
    userId: string,
    comment?: string
  ): Promise<void> {
    const plan = await this.repository.getMission(missionId);
    if (!plan) throw new Error(`Mission with ID ${missionId} not found.`);

    let gateFound = false;
    const updatedGates = plan.approvalGates.map(gate => {
      if (gate.id === gateId) {
        gateFound = true;
        const status: ApprovalGate['status'] = action === 'approve' ? 'approved' : 'rejected';
        const eventType = action === 'approve' ? 'approval_granted' : 'approval_rejected';
        
        this.auditService.logEvent(
          missionId,
          eventType,
          userId,
          `Executive approval gate "${gate.title}" was [${status.toUpperCase()}] by ${userId}. Comment: "${comment || 'None'}"`,
          { gateId, action, comment }
        );

        return {
          ...gate,
          status,
          decidedBy: userId,
          decidedAt: new Date().toISOString(),
          comment: comment || '',
        };
      }
      return gate;
    });

    if (!gateFound) throw new Error(`Approval Gate with ID ${gateId} not found.`);

    // If we approved the gate, check if we can active the mission
    let finalStatus = plan.status;
    const approvedCount = updatedGates.filter(g => g.status === 'approved').length;
    
    if (action === 'approve' && plan.status === 'pending_approval' && approvedCount === updatedGates.length) {
      finalStatus = 'active';
      this.auditService.logEvent(
        missionId,
        'workflow_generated',
        'system',
        `All active approval gates cleared. Mission ${missionId} upgraded to [ACTIVE] operational state.`,
        {}
      );
    } else if (action === 'reject') {
      finalStatus = 'blocked';
    }

    await this.repository.updateMission(missionId, {
      approvalGates: updatedGates,
      status: finalStatus,
    });
  }
}
