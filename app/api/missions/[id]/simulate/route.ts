import { NextRequest, NextResponse } from 'next/server';
import { registry } from '@/lib/registry';

export async function POST(
  req: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await props.params;
    const body = await req.json().catch(() => ({}));
    const { userId = 'simulator-node' } = body;

    await registry.agentOrchestrator.runSimulationStep(id, userId);
    
    const updatedMission = await registry.missionRepository.getMission(id);
    return NextResponse.json({ success: true, mission: updatedMission });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to step simulation' },
      { status: 500 }
    );
  }
}
