import { NextRequest, NextResponse } from 'next/server';
import { registry } from '@/lib/registry';

export async function GET() {
  try {
    const list = await registry.missionRepository.listMissions();
    return NextResponse.json({ success: true, missions: list });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to list missions' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { objective, context } = body;

    if (!objective || typeof objective !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Target mission objective is required.' },
        { status: 400 }
      );
    }

    const plan = await registry.missionPlanner.planMission(objective, context);
    return NextResponse.json({ success: true, mission: plan });
  } catch (error: any) {
    console.error('Failed to create mission plan:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to generate mission' },
      { status: 500 }
    );
  }
}
