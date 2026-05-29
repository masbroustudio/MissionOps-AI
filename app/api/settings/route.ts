import { NextResponse } from 'next/server';
import { registry } from '@/lib/registry';

export async function GET() {
  try {
    const status = registry.llmRouter.getProviderStatus();
    const config = {
      order: process.env.LLM_PROVIDER_ORDER || 'gemini,groq,cerebras,sumopod,mock',
      timeoutMs: Number(process.env.LLM_TIMEOUT_MS) || 12000,
      maxRetries: Number(process.env.LLM_MAX_RETRIES) || 2,
    };
    return NextResponse.json({ success: true, providers: status, config });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to retrieve settings status' },
      { status: 500 }
    );
  }
}
