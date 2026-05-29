import { NextRequest, NextResponse } from 'next/server';
import { registry } from '@/lib/registry';

export async function POST(
  req: NextRequest,
  props: { params: Promise<{ id: string; gateId: string }> }
) {
  try {
    const { id, gateId } = await props.params;
    const body = await req.json();
    const { action, comment, userId = 'executive-user' } = body;

    if (!action || (action !== 'approve' && action !== 'reject')) {
      return NextResponse.json(
        { success: false, error: 'Authorization action must be "approve" or "reject".' },
        { status: 400 }
      );
    }

    await registry.approvalService.decideGate(id, gateId, action, userId, comment);
    
    const updatedMission = await registry.missionRepository.getMission(id);
    return NextResponse.json({ success: true, mission: updatedMission });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to authorize gates' },
      { status: 500 }
    );
  }
}
