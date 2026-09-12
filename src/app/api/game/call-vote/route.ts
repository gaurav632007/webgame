import { createAdminClient } from '@/lib/supabase/admin';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const callVoteSchema = z.object({
  roomId: z.string().uuid(),
  playerId: z.string().uuid(),
});

/**
 * "VOTE KARO!" — any player can call for an early vote during discussion.
 * The host alone is enough; otherwise a majority of connected players.
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = createAdminClient();
    const { roomId, playerId } = callVoteSchema.parse(await request.json());

    const { data: gs } = await supabase.from('game_state').select('phase, vote_calls').eq('room_id', roomId).single();
    const state = gs as unknown as { phase: string; vote_calls: Record<string, boolean> } | null;
    if (!state) return NextResponse.json({ error: 'Game has not started' }, { status: 400 });
    if (state.phase !== 'discussion') return NextResponse.json({ error: 'Votes can only be called during discussion' }, { status: 400 });

    const { data: roster } = await supabase.from('players').select('id, is_host').eq('room_id', roomId).eq('is_connected', true);
    const members = (roster ?? []) as Array<{ id: string; is_host: boolean }>;
    const caller = members.find((m) => m.id === playerId);
    if (!caller) return NextResponse.json({ error: 'Not a room member' }, { status: 403 });

    const calls = { ...(state.vote_calls || {}), [playerId]: true };
    await supabase.from('game_state').update({ vote_calls: calls }).eq('room_id', roomId);

    const needed = Math.ceil(members.length / 2);
    const count = Object.keys(calls).length;
    if (caller.is_host || count >= needed) {
      const { error: advError } = await supabase.rpc('advance_phase', {
        p_room_id: roomId,
        p_player_id: playerId,
        p_force: true,
      });
      if (advError) {
        console.error('Call-vote advance error:', advError);
        return NextResponse.json({ success: true, calls: count, needed, advanced: false });
      }
      return NextResponse.json({ success: true, calls: count, needed, advanced: true });
    }

    return NextResponse.json({ success: true, calls: count, needed, advanced: false });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid request data', details: error.issues }, { status: 400 });
    }
    console.error('Call vote error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
