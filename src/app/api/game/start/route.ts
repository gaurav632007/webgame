import { createAdminClient } from '@/lib/supabase/admin';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const startSchema = z.object({
  roomId: z.string().uuid(),
  hostPlayerId: z.string().uuid(),
});

export async function POST(request: NextRequest) {
  try {
    const supabase = createAdminClient();
    const body = await request.json();
    const { roomId, hostPlayerId } = startSchema.parse(body);

    const { data: result, error } = await supabase.rpc('start_game', {
      p_room_id: roomId,
      p_host_id: hostPlayerId,
    });

    if (error) {
      console.error('Start game error:', error);
      return NextResponse.json({ error: 'Failed to start game' }, { status: 500 });
    }

    const startResult = (result as Array<{ success: boolean; error: string | null }>)[0];
    if (!startResult?.success) {
      return NextResponse.json({ error: startResult?.error || 'Failed to start game' }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid request data', details: error.issues }, { status: 400 });
    }
    console.error('Start game error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
