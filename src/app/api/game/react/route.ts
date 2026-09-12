import { createAdminClient } from '@/lib/supabase/admin';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const reactSchema = z.object({
  roomId: z.string().uuid(),
  playerId: z.string().uuid(),
  targetType: z.enum(['clue', 'message']),
  targetId: z.string().uuid(),
  type: z.enum(['laugh', 'think', 'shock', 'eyes', 'fire']),
});

export async function POST(request: NextRequest) {
  try {
    const supabase = createAdminClient();
    const { roomId, playerId, targetType, targetId, type } = reactSchema.parse(await request.json());

    const { data: member } = await supabase.from('players').select('id').eq('id', playerId).eq('room_id', roomId).single();
    if (!member) return NextResponse.json({ error: 'Not a room member' }, { status: 403 });

    // One reaction per player per target+type: toggle off if it exists.
    const { data: existing } = await supabase
      .from('reactions')
      .select('id')
      .eq('room_id', roomId)
      .eq('player_id', playerId)
      .eq('target_type', targetType)
      .eq('target_id', targetId)
      .eq('type', type)
      .limit(1);
    const rows = (existing ?? []) as Array<{ id: string }>;
    if (rows.length > 0) {
      await supabase.from('reactions').delete().eq('id', rows[0].id);
      return NextResponse.json({ success: true, toggled: 'off' });
    }

    const { error: insertError } = await supabase.from('reactions').insert({
      room_id: roomId,
      player_id: playerId,
      target_type: targetType,
      target_id: targetId,
      type,
    });
    if (insertError) throw insertError;
    return NextResponse.json({ success: true, toggled: 'on' });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid reaction', details: error.issues }, { status: 400 });
    }
    console.error('React error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
