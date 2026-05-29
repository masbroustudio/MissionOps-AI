import { NextRequest, NextResponse } from 'next/server';
import { registry } from '@/lib/registry';

export async function GET(
  req: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await props.params;
    const mission = await registry.missionRepository.getMission(id);
    
    if (!mission) {
      return NextResponse.json(
        { success: false, error: `Mission ${id} not found.` },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, mission });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to retrieve mission info' },
      { status: 500 }
    );
  }
}
