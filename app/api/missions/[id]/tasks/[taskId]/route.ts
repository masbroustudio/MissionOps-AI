import { NextRequest, NextResponse } from 'next/server';
import { registry } from '@/lib/registry';

export async function PUT(
  req: NextRequest,
  props: { params: Promise<{ id: string; taskId: string }> }
) {
  try {
    const { id, taskId } = await props.params;
    const body = await req.json();
    const { status, actionType = 'status', updates, feedback, userId = 'admin-user' } = body;

    if (actionType === 'status') {
      if (!status) {
        return NextResponse.json(
          { success: false, error: 'Status is required for status transitions.' },
          { status: 400 }
        );
      }
      await registry.workflowService.updateTaskStatus(id, taskId, status, userId, feedback);
    } else if (actionType === 'edit') {
      if (!updates) {
        return NextResponse.json(
          { success: false, error: 'Metadata updates object is required for edits.' },
          { status: 400 }
        );
      }
      await registry.workflowService.editTask(id, taskId, updates, userId);
    }

    const updatedMission = await registry.missionRepository.getMission(id);
    return NextResponse.json({ success: true, mission: updatedMission });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to update task' },
      { status: 500 }
    );
  }
}
