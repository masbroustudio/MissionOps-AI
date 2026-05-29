import { logger } from '@/utils/logger';

export class GoogleWorkspaceConnector {
  public async exportBriefingToDocs(title: string, headline: string, recommendations: string[]): Promise<string> {
    logger.info(`GoogleWorkspaceConnector: Constructing Google Doc for executive briefing: ${title}`);
    return `https://docs.google.com/document/d/mock-doc-id/edit`;
  }
}
