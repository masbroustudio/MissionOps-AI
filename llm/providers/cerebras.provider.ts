import { ILLMProvider, LLMInput, LLMResponse } from '../llm.types';

export class CerebrasProvider implements ILLMProvider {
  name = 'Cerebras';
  modelName = process.env.CEREBRAS_MODEL || 'llama3.1-70b';

  private getApiKey(): string {
    const key = process.env.CEREBRAS_API_KEY;
    if (!key || key === 'MY_CEREBRAS_API_KEY') {
      throw new Error('CEREBRAS_API_KEY is not configured.');
    }
    return key;
  }

  async healthCheck(): Promise<boolean> {
    try {
      this.getApiKey();
      return true;
    } catch {
      return false;
    }
  }

  async generateText(input: LLMInput): Promise<LLMResponse<string>> {
    const start = Date.now();
    try {
      const apiKey = this.getApiKey();
      const messages = [];
      if (input.systemInstruction) {
        messages.push({ role: 'system', content: input.systemInstruction });
      }
      messages.push({ role: 'user', content: input.prompt });

      const response = await fetch('https://api.cerebras.ai/v1/chat/completions', {
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
        throw new Error(`Cerebras API returned HTTP ${response.status}: ${errorText}`);
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
      const messages = [];
      
      const systemInstruction = (input.systemInstruction || '') + 
        `\n\nYou MUST respond ONLY with valid JSON. Do not include any formatting, markdown wrappers, or surrounding text.`;
      
      messages.push({ role: 'system', content: systemInstruction });
      messages.push({ 
        role: 'user', 
        content: `${input.prompt}\n\nPlease output valid JSON that strictly conforms to this description/schema:\n${schemaDescription}` 
      });

      const response = await fetch('https://api.cerebras.ai/v1/chat/completions', {
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
        throw new Error(`Cerebras API returned HTTP ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      let text = data?.choices?.[0]?.message?.content || '{}';
      
      let parsedJson: T;
      // Clean possible fences just in case
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
        throw new Error(`Failed to parse Cerebras JSON response: ${parseErr.message}. Output was: ${text}`);
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
