import { ILLMProvider, LLMInput, LLMResponse } from '../llm.types';

export class SumopodProvider implements ILLMProvider {
  name = 'Sumopod';
  modelName = process.env.SUMOPOD_MODEL || 'sumopod-ultra-1';

  private getApiKey(): string {
    const key = process.env.SUMOPOD_API_KEY;
    if (!key || key === 'MY_SUMOPOD_API_KEY') {
      throw new Error('SUMOPOD_API_KEY is not configured.');
    }
    return key;
  }

  private getBaseUrl(): string {
    const url = process.env.SUMOPOD_BASE_URL;
    if (!url || url === 'MY_SUMOPOD_BASE_URL') {
      throw new Error('SUMOPOD_BASE_URL is not configured.');
    }
    return url;
  }

  async healthCheck(): Promise<boolean> {
    try {
      this.getApiKey();
      this.getBaseUrl();
      return true;
    } catch {
      return false;
    }
  }

  async generateText(input: LLMInput): Promise<LLMResponse<string>> {
    const start = Date.now();
    try {
      const apiKey = this.getApiKey();
      const baseUrl = this.getBaseUrl();
      const messages = [];
      if (input.systemInstruction) {
        messages.push({ role: 'system', content: input.systemInstruction });
      }
      messages.push({ role: 'user', content: input.prompt });

      // Build endpoint path dynamically
      const endpoint = baseUrl.endsWith('/') ? `${baseUrl}v1/chat/completions` : `${baseUrl}/v1/chat/completions`;

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: this.modelName,
          messages,
          temperature: input.temperature ?? 0.7,
        }),
        signal: AbortSignal.timeout(input.timeoutMs || 10000),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Sumopod API returned status ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      const text = data?.choices?.[0]?.message?.content || '';

      return {
        text,
        providerName: this.name,
        modelUsed: this.modelName,
        latencyMs: Date.now() - start,
        success: true,
        isFallback: false,
      };
    } catch (error: any) {
      return {
        text: '',
        providerName: this.name,
        modelUsed: this.modelName,
        latencyMs: Date.now() - start,
        success: false,
        isFallback: false,
        error: error?.message || String(error),
      };
    }
  }

  async generateJson<T = any>(input: LLMInput, schemaDescription: string): Promise<LLMResponse<T>> {
    const start = Date.now();
    try {
      const apiKey = this.getApiKey();
      const baseUrl = this.getBaseUrl();
      const messages = [];
      
      const systemInstruction = (input.systemInstruction || '') + 
        `\n\nYou MUST respond ONLY with valid JSON conforming to expectations. Do not include markdown code fences or text surroundings.`;
      
      messages.push({ role: 'system', content: systemInstruction });
      messages.push({ 
        role: 'user', 
        content: `${input.prompt}\n\nPlease output valid JSON that strictly conforms to this description/schema:\n${schemaDescription}` 
      });

      const endpoint = baseUrl.endsWith('/') ? `${baseUrl}v1/chat/completions` : `${baseUrl}/v1/chat/completions`;

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: this.modelName,
          messages,
          temperature: input.temperature ?? 0.2,
        }),
        signal: AbortSignal.timeout(input.timeoutMs || 15000),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Sumopod API returned status ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      let text = data?.choices?.[0]?.message?.content || '{}';
      
      let parsedJson: T;
      let cleanedText = text.trim();
      if (cleanedText.startsWith('```json')) {
        cleanedText = cleanedText.substring(7);
      }
      if (cleanedText.endsWith('```')) {
        cleanedText = cleanedText.substring(0, cleanedText.length - 3);
      }
      cleanedText = cleanedText.trim();

      try {
        parsedJson = JSON.parse(cleanedText) as T;
      } catch (parseErr: any) {
        throw new Error(`Failed to parse Sumopod JSON response: ${parseErr.message}. Output was: ${text}`);
      }

      return {
        text: cleanedText,
        parsedJson,
        providerName: this.name,
        modelUsed: this.modelName,
        latencyMs: Date.now() - start,
        success: true,
        isFallback: false,
      };
    } catch (error: any) {
      return {
        text: '',
        providerName: this.name,
        modelUsed: this.modelName,
        latencyMs: Date.now() - start,
        success: false,
        isFallback: false,
        error: error?.message || String(error),
      };
    }
  }
}
