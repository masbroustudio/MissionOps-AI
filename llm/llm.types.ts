export interface LLMInput {
  prompt: string;
  systemInstruction?: string;
  temperature?: number;
  timeoutMs?: number;
}

export interface LLMResponse<T = any> {
  text: string;
  parsedJson?: T;
  providerName: string;
  modelUsed: string;
  latencyMs: number;
  success: boolean;
  isFallback: boolean;
  error?: string;
}

export interface ILLMProvider {
  name: string;
  modelName: string;
  generateText(input: LLMInput): Promise<LLMResponse<string>>;
  generateJson<T = any>(input: LLMInput, schemaDescription: string): Promise<LLMResponse<T>>;
  healthCheck(): Promise<boolean>;
}
