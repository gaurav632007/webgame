import { createAdminClient } from '@/lib/supabase/admin';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const clueSchema = z.object({
  roomId: z.string().uuid(),
  playerId: z.string().uuid(),
  text: z.string().trim().min(1).max(200),
});

export async function POST(request: NextRequest) {
  try {
    const supabase = createAdminClient();
    const { roomId, playerId, text } = clueSchema.parse(await request.json());

    const { data: gs } = await supabase.from('game_state').select('*').eq('room_id', roomId).single();
    const state = gs as unknown as {
      phase: string; clues: Record<string, string>; current_turn: string | null;
    } | null;
    if (!state) return NextResponse.json({ error: 'Game has not started' }, { status: 400 });
    if (state.phase !== 'clue') return NextResponse.json({ error: 'Not the clue phase' }, { status: 400 });

    const { data: member } = await supabase.from('players').select('id').eq('id', playerId).eq('room_id', roomId).single();
    if (!member) return NextResponse.json({ error: 'Not a room member' }, { status: 403 });

    if (state.current_turn !== playerId) {
      return NextResponse.json({ error: "Not your turn" }, { status: 400 });
    }

    const clues = { ...(state.clues || {}), [playerId]: text };

    const { data: roster } = await supabase
      .from('players')
      .select('id')
      .eq('room_id', roomId)
      .eq('is_connected', true)
      .order('joined_at', { ascending: true });
    const order = ((roster ?? []) as Array<{ id: string }>).map((p) => p.id);
    const remaining = order.filter((id) => !clues[id]);

    if (remaining.length === 0) {
      // Everyone clued: jump straight to discussion (server-verified completion).
      await supabase.from('game_state').update({ clues }).eq('room_id', roomId);
      const { error: advError } = await supabase.rpc('advance_phase', {
        p_room_id: roomId,
        p_player_id: playerId,
        p_force: true,
      });
      if (advError) {
        console.error('Auto-advance after clues error:', advError);
        return NextResponse.json({ success: true, advanced: false });
      }
      return NextResponse.json({ success: true, advanced: true });
    }

    const { error: updateError } = await supabase
      .from('game_state')
      .update({ clues, current_turn: remaining[0] })
      .eq('room_id', roomId);
    if (updateError) throw updateError;

    return NextResponse.json({ success: true, advanced: false, nextTurn: remaining[0] });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid clue', details: error.issues }, { status: 400 });
    }
    console.error('Submit clue error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
