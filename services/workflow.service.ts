import { IMissionRepository } from '@/repositories/mission.repository';
import { AuditService } from './audit.service';
import { Task } from '@/domain/workflow.types';
import { MissionPlan } from '@/domain/mission.types';

export class WorkflowService {
  private repository: IMissionRepository;
  private auditService: AuditService;

  constructor(repository: IMissionRepository, auditService: AuditService) {
    this.repository = repository;
    this.auditService = auditService;
  }

  public async updateTaskStatus(
    missionId: string,
    taskId: string,
    status: Task['status'],
    userId: string,
    feedback?: string
  ): Promise<void> {
    const plan = await this.repository.getMission(missionId);
    if (!plan) throw new Error(`Mission with ID ${missionId} not found.`);

    let taskFound = false;

    // Mutate the matched task in the milestone list
    const updatedMilestones = plan.milestones.map(milestone => {
      const updatedTasks = milestone.tasks.map(task => {
        if (task.id === taskId) {
          taskFound = true;
          const oldStatus = task.status;
          
          let auditMsg = `Task "${task.title}" updated from [${oldStatus}] to [${status}] by ${userId}.`;
          let eventType: 'task_updated' | 'approval_requested' | 'approval_granted' | 'approval_rejected' = 'task_updated';
          
          if (status === 'pending_approval') {
            eventType = 'approval_requested';
            auditMsg = `Human authorization requested for task: "${task.title}".`;
          } else if (oldStatus === 'pending_approval' && status === 'in_progress') {
            eventType = 'approval_rejected';
            auditMsg = `Human authorization REJECTED for task "${task.title}" by ${userId}. Feedback: "${feedback || 'None'}".`;
          } else if (oldStatus === 'pending_approval' && status === 'done') {
            eventType = 'approval_granted';
            auditMsg = `Human authorization GRANTED for task "${task.title}" by ${userId}.`;
          }

          this.auditService.logEvent(
            missionId,
            eventType,
            userId,
            auditMsg,
            { taskId, oldStatus, newStatus: status, feedback }
          );

          return {
            ...task,
            status,
            feedback: feedback || task.feedback,
            approvedBy: status === 'done' && oldStatus === 'pending_approval' ? userId : task.approvedBy,
            completedAt: status === 'done' ? new Date().toISOString() : task.completedAt,
          };
        }
        return task;
      });
      return { ...milestone, tasks: updatedTasks };
    });

    if (!taskFound) {
      throw new Error(`Task with ID ${taskId} not found under mission ${missionId}.`);
    }

    // Recalculate status and save
    let finalStatus: MissionPlan['status'] = plan.status;
    const allTasks = updatedMilestones.flatMap(m => m.tasks);
    const completedTasks = allTasks.filter(t => t.status === 'done');
    const blockedTasks = allTasks.filter(t => t.status === 'blocked');

    if (completedTasks.length === allTasks.length && allTasks.length > 0) {
      finalStatus = 'completed';
    } else if (blockedTasks.length > 0) {
      finalStatus = 'blocked';
    } else if (plan.status === 'pending_approval' && completedTasks.length > 0) {
      finalStatus = 'active';
    }

    await this.repository.updateMission(missionId, {
      milestones: updatedMilestones,
      status: finalStatus,
    });
  }

  public async editTask(
    missionId: string,
    taskId: string,
    updates: Partial<Pick<Task, 'title' | 'description' | 'ownerRole' | 'estimatedHours' | 'dependencies' | 'requiresApproval'>>,
    userId: string
  ): Promise<void> {
    const plan = await this.repository.getMission(missionId);
    if (!plan) throw new Error(`Mission with ID ${missionId} not found.`);

    let taskFound = false;
    const updatedMilestones = plan.milestones.map(milestone => {
      const updatedTasks = milestone.tasks.map(task => {
        if (task.id === taskId) {
          taskFound = true;
          this.auditService.logEvent(
            missionId,
            'task_updated',
            userId,
            `User ${userId} edited metadata for task "${task.title}".`,
            { taskId, updates }
          );
          return { ...task, ...updates };
        }
        return task;
      });
      return { ...milestone, tasks: updatedTasks };
    });

    if (!taskFound) throw new Error(`Task with ID ${taskId} not found.`);

    await this.repository.updateMission(missionId, {
      milestones: updatedMilestones,
    });
  }
}
