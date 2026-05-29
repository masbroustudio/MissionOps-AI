import { ILLMProvider, LLMInput, LLMResponse } from '../llm.types';

export class GroqProvider implements ILLMProvider {
  name = 'Groq';
  modelName = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';

  private getApiKey(): string {
    const key = process.env.GROQ_API_KEY;
    if (!key || key === 'MY_GROQ_API_KEY') {
      throw new Error('GROQ_API_KEY is not configured.');
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

      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
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
        throw new Error(`Groq API returned HTTP ${response.status}: ${errorText}`);
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
        `\n\nYou MUST respond ONLY with valid JSON. Do not include any reasoning, markdown wrappers outside or inside, just the raw JSON object conforming to expectations.`;
      
      messages.push({ role: 'system', content: systemInstruction });
      messages.push({ 
        role: 'user', 
        content: `${input.prompt}\n\nPlease output valid JSON that strictly conforms to this description/schema:\n${schemaDescription}` 
      });

      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: this.modelName,
          messages,
          temperature: input.temperature ?? 0.7,
          response_format: { type: 'json_object' },
        }),
        signal: AbortSignal.timeout(input.timeoutMs || 15000),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Groq API returned HTTP ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      const text = data?.choices?.[0]?.message?.content || '{}';
      
      let parsedJson: T;
      try {
        parsedJson = JSON.parse(text.trim()) as T;
      } catch (parseErr: any) {
        throw new Error(`Failed to parse Groq JSON response: ${parseErr.message}. Output was: ${text}`);
      }

      return {
        text,
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
