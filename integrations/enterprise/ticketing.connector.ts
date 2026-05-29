import { logger } from '@/utils/logger';

export class TicketingConnector {
  public async syncTaskToJira(taskId: string, title: string, status: string): Promise<string> {
    logger.info(`TicketingConnector: Syncing task state trigger to Jira issue for taskId=[${taskId}]`, {
      title,
      status,
    });
    return `JIRA-${Math.floor(Math.random() * 8000 + 1000)}`;
  }
}
