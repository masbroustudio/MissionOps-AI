import { NextRequest, NextResponse } from 'next/server';
import { registry } from '@/lib/registry';

export async function POST(
  req: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await props.params;
    
    const brief = await registry.briefingService.generateExecutiveBriefing(id);
    const updatedMission = await registry.missionRepository.getMission(id);
    
    return NextResponse.json({ success: true, briefing: brief, mission: updatedMission });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to update executive briefing' },
      { status: 500 }
    );
  }
}
