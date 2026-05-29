import { logger } from '@/utils/logger';

export class PubSubAdapter {
  private topicName = 'mission-events-broadcast';

  public async publishEvent(eventType: string, missionId: string, payload: any): Promise<void> {
    logger.info(`PubSubAdapter: Dispatched [${eventType}] onto topic: [${this.topicName}]`, {
      missionId,
      payloadSize: JSON.stringify(payload).length,
    });
    // In production GCP environment:
    // const pubsub = new PubSub();
    // const dataBuffer = Buffer.from(JSON.stringify({ eventType, payload }));
    // await pubsub.topic(this.topicName).publishMessage({ data: dataBuffer });
  }
}
