import { createAdminClient } from '@/lib/supabase/admin';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const leaveSchema = z.object({
  roomId: z.string().uuid(),
  playerId: z.string().uuid(),
});

export async function POST(request: NextRequest) {
  try {
    const supabase = createAdminClient();
    const body = await request.json();
    const { roomId, playerId } = leaveSchema.parse(body);

    const { data: player } = await supabase
      .from('players')
      .select('id, is_host, joined_at')
      .eq('id', playerId)
      .eq('room_id', roomId)
      .single();

    const leaving = player as unknown as { id: string; is_host: boolean; joined_at: string } | null;
    if (!leaving) {
      return NextResponse.json({ success: true });
    }

    // Host leaving: transfer host to the longest-waiting remaining player.
    if (leaving.is_host) {
      const { data: others } = await supabase
        .from('players')
        .select('id')
        .eq('room_id', roomId)
        .neq('id', playerId)
        .order('joined_at', { ascending: true })
        .limit(1);

      const next = (others ?? []) as Array<{ id: string }>;
      if (next.length > 0) {
        await supabase.from('players').update({ is_host: true }).eq('id', next[0].id);
        await supabase.from('rooms').update({ host_id: next[0].id }).eq('id', roomId);
      } else {
        // Last player out: close the room so it can't be joined.
        await supabase.from('rooms').update({ status: 'finished' }).eq('id', roomId);
      }
    }

    await supabase.from('players').delete().eq('id', playerId);

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid request data', details: error.issues }, { status: 400 });
    }
    console.error('Leave room error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
