import { GoogleGenAI } from "@google/genai";
import { ILLMProvider, LLMInput, LLMResponse } from '../llm.types';

export class GeminiProvider implements ILLMProvider {
  name = 'Gemini';
  modelName = process.env.GEMINI_MODEL || 'gemini-3.5-flash';
  private client: GoogleGenAI | null = null;

  private getClient(): GoogleGenAI {
    if (!this.client) {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
        throw new Error('GEMINI_API_KEY is not configured or has default placeholder value.');
      }
      this.client = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });
    }
    return this.client;
  }

  async healthCheck(): Promise<boolean> {
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
        return false;
      }
      const ai = this.getClient();
      // Simple lightweight prompt validation
      await ai.models.generateContent({
        model: this.modelName,
        contents: 'ping',
        config: {
          maxOutputTokens: 5,
        }
      });
      return true;
    } catch (e) {
      return false;
    }
  }

  async generateText(input: LLMInput): Promise<LLMResponse<string>> {
    const start = Date.now();
    try {
      const ai = this.getClient();
      const response = await ai.models.generateContent({
        model: this.modelName,
        contents: input.prompt,
        config: {
          systemInstruction: input.systemInstruction,
          temperature: input.temperature ?? 0.7,
        }
      });

      const text = response.text || '';
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
      const ai = this.getClient();
      
      const promptText = `${input.prompt}\n\nPlease output valid JSON that strictly conforms to this structure or explanation:\n${schemaDescription}`;
      
      const response = await ai.models.generateContent({
        model: this.modelName,
        contents: promptText,
        config: {
          systemInstruction: input.systemInstruction,
          temperature: input.temperature ?? 0.7,
          responseMimeType: 'application/json',
        }
      });

      const text = response.text || '{}';
      
      // Attempt validation / parsing
      let parsedJson: T;
      try {
        parsedJson = JSON.parse(this.cleanJsonString(text)) as T;
      } catch (parseErr: any) {
        throw new Error(`Failed to parse JSON output: ${parseErr.message}. Output was: ${text}`);
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

  private cleanJsonString(str: string): string {
    let cleaned = str.trim();
    if (cleaned.startsWith('```json')) {
      cleaned = cleaned.substring(7);
    }
    if (cleaned.startsWith('```')) {
      cleaned = cleaned.substring(3);
    }
    if (cleaned.endsWith('```')) {
      cleaned = cleaned.substring(0, cleaned.length - 3);
    }
    return cleaned.trim();
  }
}
