import { IMissionRepository } from '@/repositories/mission.repository';
import { AuditService } from './audit.service';
import { Agent } from '@/domain/agent.types';
import { Task } from '@/domain/workflow.types';
import { MissionPlan } from '@/domain/mission.types';

export class AgentOrchestratorService {
  private repository: IMissionRepository;
  private auditService: AuditService;

  constructor(repository: IMissionRepository, auditService: AuditService) {
    this.repository = repository;
    this.auditService = auditService;
  }

  public async getAgents(missionId: string): Promise<Agent[]> {
    const plan = await this.repository.getMission(missionId);
    if (!plan) return [];
    return plan.agents || [];
  }

  /**
   * Performs an asynchronous step-by-step transaction simulation.
   * Modifies task queues and logs synthetic reasoning inside the audit database.
   */
  public async runSimulationStep(missionId: string, userId: string): Promise<void> {
    const plan = await this.repository.getMission(missionId);
    if (!plan) throw new Error(`Mission with ID ${missionId} not found.`);

    if (plan.status === 'completed' || plan.status === 'failed') {
      return; // Already finalized
    }

    const updatedAgents = [...(plan.agents || [])];
    const updatedMilestones = [...plan.milestones];
    
    // Find the first task that is "todo" or "in_progress"
    let taskToUpdate: Task | null = null;
    let milestoneIndex = -1;
    let taskIndex = -1;

    for (let mIdx = 0; mIdx < updatedMilestones.length; mIdx++) {
      const milestone = updatedMilestones[mIdx];
      for (let tIdx = 0; tIdx < milestone.tasks.length; tIdx++) {
        const t = milestone.tasks[tIdx];
        if (t.status === 'todo' || t.status === 'in_progress') {
          // Verify dependencies are cleared
          const depsCleared = t.dependencies.every(depId => {
            const depTask = milestone.tasks.find(x => x.id === depId);
            return !depTask || depTask.status === 'done';
          });
          
          if (depsCleared) {
            taskToUpdate = t;
            milestoneIndex = mIdx;
            taskIndex = tIdx;
            break;
          }
        }
      }
      if (taskToUpdate) break;
    }

    if (!taskToUpdate) {
      // If there are no open tasks to clear, but we have pending_approval items, log an alert
      const pendingCount = updatedMilestones.flatMap(m => m.tasks).filter(t => t.status === 'pending_approval').length;
      if (pendingCount > 0) {
        this.auditService.logEvent(
          missionId,
          'simulation_step',
          'system',
          `Simulation paused. Swarm is blocked waiting for human approval on ${pendingCount} active gate-locks.`,
          {}
        );
        return;
      }
      
      // Otherwise, the mission is already complete!
      this.auditService.logEvent(
        missionId,
        'simulation_step',
        'system',
        'All designated mission milestones are completed. Swarm entering standby idle.',
        {}
      );
      return;
    }

    // Determine matched agent to execute
    const matchedAgent = updatedAgents.find(a => a.role.toLowerCase() === taskToUpdate!.ownerRole.toLowerCase())
      || updatedAgents[0];

    if (matchedAgent) {
      matchedAgent.status = 'active';
      matchedAgent.lastAction = `Executing task: "${taskToUpdate.title}"`;
    }

    // State transition
    const oldStatus = taskToUpdate.status;
    let newStatus: Task['status'] = 'in_progress';
    let simulationMsg = '';

    if (oldStatus === 'todo') {
      newStatus = 'in_progress';
      simulationMsg = `Agent "${matchedAgent?.name || 'Coordinator'}" started execution of task "${taskToUpdate.title}".`;
      
      this.auditService.logEvent(
        missionId,
        'simulation_step',
        'system',
        simulationMsg,
        { taskId: taskToUpdate.id, agent: matchedAgent?.name, role: matchedAgent?.role }
      );
    } else if (oldStatus === 'in_progress') {
      if (taskToUpdate.requiresApproval) {
        newStatus = 'pending_approval';
        simulationMsg = `Agent "${matchedAgent?.name || 'Coordinator'}" finished coding. Blocked: Awaiting human approval lock.`;
      } else {
        newStatus = 'done';
        simulationMsg = `Agent "${matchedAgent?.name || 'Coordinator'}" completed task "${taskToUpdate.title}" successfully.`;
      }

      this.auditService.logEvent(
        missionId,
        'simulation_step',
        'system',
        simulationMsg,
        { taskId: taskToUpdate.id, agent: matchedAgent?.name, nextStatus: newStatus }
      );
    }

    // Mutate the array
    const modifiedTask = {
      ...taskToUpdate,
      status: newStatus,
      completedAt: newStatus === 'done' ? new Date().toISOString() : undefined,
    };

    updatedMilestones[milestoneIndex].tasks[taskIndex] = modifiedTask;

    // Put agent back to standby-analyzing after executing
    if (matchedAgent && newStatus === 'done') {
      matchedAgent.status = 'analyzing';
      matchedAgent.lastAction = 'Awaiting next queued workflow sequence.';
    }

    // Verify if mission completed
    let finalStatus: MissionPlan['status'] = plan.status;
    const allTasks = updatedMilestones.flatMap(m => m.tasks);
    const completedTasks = allTasks.filter(t => t.status === 'done');
    
    if (completedTasks.length === allTasks.length) {
      finalStatus = 'completed';
      this.auditService.logEvent(
        missionId,
        'simulation_step',
        'system',
        `CONGRATULATIONS: All milestones have been fully cleared! Mission Ops has completed successfully!`,
        {}
      );
    } else {
      finalStatus = 'active';
    }

    await this.repository.updateMission(missionId, {
      agents: updatedAgents,
      milestones: updatedMilestones,
      status: finalStatus,
    });
  }
}
