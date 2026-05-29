export class MissionOpsError extends Error {
  public code: string;
  public details?: any;

  constructor(message: string, code = 'INTERNAL_ERROR', details?: any) {
    super(message);
    this.name = 'MissionOpsError';
    this.code = code;
    this.details = details;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class ProviderTimeoutError extends MissionOpsError {
  constructor(providerName: string, timeoutMs: number) {
    super(
      `Provider ${providerName} timed out after ${timeoutMs}ms.`,
      'PROVIDER_TIMEOUT',
      { providerName, timeoutMs }
    );
  }
}

export class ValidationError extends MissionOpsError {
  constructor(message: string, details?: any) {
    super(message, 'VALIDATION_FAILURE', details);
  }
}

export class CircuitBreakerError extends MissionOpsError {
  constructor(providerName: string) {
    super(
      `Circuit breaker for provider ${providerName} is OPEN. Blocking requests.`,
      'CIRCUIT_OPEN',
      { providerName }
    );
  }
}
