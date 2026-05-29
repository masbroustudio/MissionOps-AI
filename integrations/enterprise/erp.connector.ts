import { logger } from '@/utils/logger';

export class ERPConnector {
  public async getBudgetBalance(costCenterId: string): Promise<number> {
    logger.info(`ERPConnector: Auditing cost center balance on target costCenterId=[${costCenterId}]`);
    return 150000; // Mock balance limit
  }
}
