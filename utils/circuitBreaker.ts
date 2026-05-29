export class CircuitBreaker {
  private state: 'CLOSED' | 'OPEN' | 'HALF_OPEN' = 'CLOSED';
  private failureCount = 0;
  private lastFailureTime = 0;
  private threshold: number;
  private cooldownMs: number;

  constructor(threshold = 3, cooldownMs = 30000) {
    this.threshold = threshold;
    this.cooldownMs = cooldownMs;
  }

  public allowRequest(): boolean {
    const now = Date.now();
    if (this.state === 'OPEN') {
      if (now - this.lastFailureTime > this.cooldownMs) {
        this.state = 'HALF_OPEN';
        return true;
      }
      return false;
    }
    return true;
  }

  public recordSuccess(): void {
    this.state = 'CLOSED';
    this.failureCount = 0;
  }

  public recordFailure(): void {
    this.failureCount++;
    this.lastFailureTime = Date.now();
    if (this.failureCount >= this.threshold) {
      this.state = 'OPEN';
    }
  }

  public getState() {
    return this.state;
  }
}
