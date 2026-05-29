import { logger } from '@/utils/logger';

export class CRMConnector {
  public async getAccountTelemetry(accountId: string): Promise<any> {
    logger.info(`CRMConnector: Fetching Salesforce CRM churn signals for account=[${accountId}]`);
    return {
      accountId,
      npsScore: 6.5,
      openTickets: 4,
      lastInteractionDays: 14,
      licenceRiskFactor: 0.85,
    };
  }
}
