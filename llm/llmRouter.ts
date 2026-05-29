import { ILLMProvider, LLMInput, LLMResponse } from './llm.types';
import { GeminiProvider } from './providers/gemini.provider';
import { GroqProvider } from './providers/groq.provider';
import { CerebrasProvider } from './providers/cerebras.provider';
import { SumopodProvider } from './providers/sumopod.provider';
import { MockProvider } from './providers/mock.provider';
import { AuditService } from '@/services/audit.service';

export class LLMRouter {
  private providers: Record<string, ILLMProvider> = {};
  private providerOrder: string[] = [];
  private auditService: AuditService;

  constructor(auditService: AuditService) {
    this.auditService = auditService;
    
    // Instantiate providers
    this.providers['Gemini'] = new GeminiProvider();
    this.providers['Groq'] = new GroqProvider();
    this.providers['Cerebras'] = new CerebrasProvider();
    this.providers['Sumopod'] = new SumopodProvider();
    this.providers['MockProvider'] = new MockProvider();

    // Load order from environment or config
    const orderEnv = process.env.LLM_PROVIDER_ORDER || 'gemini,groq,cerebras,sumopod,mock';
    this.providerOrder = orderEnv
      .split(',')
      .map(p => this.mapProviderName(p.trim()))
      .filter(p => this.providers[p] !== undefined);
    
    // Always ensure MockProvider is at the end as ultimate safety net
    if (!this.providerOrder.includes('MockProvider')) {
      this.providerOrder.push('MockProvider');
    }
  }

  private mapProviderName(name: string): string {
    const l = name.toLowerCase();
    if (l === 'gemini') return 'Gemini';
    if (l === 'groq') return 'Groq';
    if (l === 'cerebras') return 'Cerebras';
    if (l === 'sumopod') return 'Sumopod';
    if (l === 'mock' || l === 'mockprovider') return 'MockProvider';
    return name;
  }

  public getProviderStatus(): Record<string, { enabled: boolean; priority: number; model: string }> {
    const status: Record<string, { enabled: boolean; priority: number; model: string }> = {};
    Object.keys(this.providers).forEach((key) => {
      const idx = this.providerOrder.indexOf(key);
      status[key] = {
        enabled: idx !== -1,
        priority: idx === -1 ? 99 : idx + 1,
        model: this.providers[key].modelName,
      };
    });
    return status;
  }

  public async generateText(missionId: string, input: LLMInput): Promise<LLMResponse<string>> {
    const timeoutMs = Number(process.env.LLM_TIMEOUT_MS) || 10000;
    const maxRetries = Number(process.env.LLM_MAX_RETRIES) || 2;
    
    let lastError = '';
    
    for (const providerName of this.providerOrder) {
      const provider = this.providers[providerName];
      if (!provider) continue;

      let attempt = 0;
      while (attempt < maxRetries) {
        attempt++;
        this.auditService.logEvent(
          missionId,
          'model_called',
          'system',
          `Calling LLM provider ${providerName} (Attempt ${attempt}/${maxRetries})`,
          { providerName, modelName: provider.modelName }
        );

        try {
          const res = await provider.generateText({ ...input, timeoutMs });
          if (res.success) {
            this.auditService.logEvent(
              missionId,
              'model_called',
              'system',
              `Provider ${providerName} completed successfully with latency ${res.latencyMs}ms`,
              { providerName, modelName: provider.modelName, latencyMs: res.latencyMs }
            );
            return {
              ...res,
              isFallback: providerName !== this.providerOrder[0],
            };
          } else {
            lastError = res.error || 'Unknown error';
            this.auditService.logEvent(
              missionId,
              'provider_error',
              'system',
              `Provider ${providerName} failed on attempt ${attempt}: ${lastError}`,
              { providerName, error: lastError }
            );
          }
        } catch (e: any) {
          lastError = e?.message || String(e);
          this.auditService.logEvent(
            missionId,
            'provider_error',
            'system',
            `Provider ${providerName} crashed on attempt ${attempt}: ${lastError}`,
            { providerName, error: lastError }
          );
        }
      }
      
      this.auditService.logEvent(
        missionId,
        'fallback_triggered',
        'system',
        `Provider ${providerName} pipeline exhausted. Triggering fallback.`,
        { failedProviderName: providerName, lastError }
      );
    }

    const mock = this.providers['MockProvider'];
    return mock.generateText(input);
  }

  public async generateJson<T = any>(missionId: string, input: LLMInput, schemaDescription: string): Promise<LLMResponse<T>> {
    const timeoutMs = Number(process.env.LLM_TIMEOUT_MS) || 12000;
    const maxRetries = Number(process.env.LLM_MAX_RETRIES) || 2;
    
    let lastError = '';
    
    for (const providerName of this.providerOrder) {
      const provider = this.providers[providerName];
      if (!provider) continue;

      let attempt = 0;
      while (attempt < maxRetries) {
        attempt++;
        this.auditService.logEvent(
          missionId,
          'model_called',
          'system',
          `Requesting JSON from ${providerName} (Attempt ${attempt}/${maxRetries})`,
          { providerName, modelName: provider.modelName }
        );

        try {
          const res = await provider.generateJson<T>({ ...input, timeoutMs }, schemaDescription);
          if (res.success && res.parsedJson) {
            this.auditService.logEvent(
              missionId,
              'model_called',
              'system',
              `Provider ${providerName} generated valid JSON in ${res.latencyMs}ms`,
              { providerName, modelName: provider.modelName, latencyMs: res.latencyMs }
            );
            return {
              ...res,
              isFallback: providerName !== this.providerOrder[0],
            };
          } else {
            lastError = res.error || 'Unknown error or invalid JSON structure';
            this.auditService.logEvent(
              missionId,
              'provider_error',
              'system',
              `Provider ${providerName} JSON generation failed: ${lastError}`,
              { providerName, error: lastError }
            );
          }
        } catch (e: any) {
          lastError = e?.message || String(e);
          this.auditService.logEvent(
            missionId,
            'provider_error',
            'system',
            `Provider ${providerName} JSON parsing failed on attempt ${attempt}: ${lastError}`,
            { providerName, error: lastError }
          );
        }
      }

      this.auditService.logEvent(
        missionId,
        'fallback_triggered',
        'system',
        `Provider ${providerName} JSON path exhausted. Triggering fallback.`,
        { failedProviderName: providerName, lastError }
      );
    }

    const mock = this.providers['MockProvider'];
    return mock.generateJson<T>(input, schemaDescription);
  }
}
