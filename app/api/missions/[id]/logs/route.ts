import { NextRequest, NextResponse } from 'next/server';
import { registry } from '@/lib/registry';

export async function GET(
  req: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await props.params;
    const logs = await registry.auditService.getLogs(id);
    return NextResponse.json({ success: true, logs });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to list audit logs' },
      { status: 500 }
    );
  }
}
