import { createAdminClient } from '@/lib/supabase/admin';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const voteSchema = z.object({
  roomId: z.string().uuid(),
  voterId: z.string().uuid(),
  targetId: z.string().uuid(),
});

export async function POST(request: NextRequest) {
  try {
    const supabase = createAdminClient();
    const { roomId, voterId, targetId } = voteSchema.parse(await request.json());

    if (voterId === targetId) {
      return NextResponse.json({ error: 'You cannot vote for yourself' }, { status: 400 });
    }

    const { data: gs } = await supabase.from('game_state').select('phase, votes, revote_targets').eq('room_id', roomId).single();
    const state = gs as unknown as { phase: string; votes: Record<string, string>; revote_targets: string[] } | null;
    if (!state) return NextResponse.json({ error: 'Game has not started' }, { status: 400 });
    if (state.phase !== 'voting') return NextResponse.json({ error: 'Not the voting phase' }, { status: 400 });
    if (state.votes?.[voterId]) return NextResponse.json({ error: 'You already voted' }, { status: 400 });
    if ((state.revote_targets || []).length > 0 && !state.revote_targets.includes(targetId)) {
      return NextResponse.json({ error: 'DEADLOCK re-vote: only the tied players are eligible' }, { status: 400 });
    }

    const { data: roster } = await supabase.from('players').select('id').eq('room_id', roomId).eq('is_connected', true);
    const memberIds = new Set(((roster ?? []) as Array<{ id: string }>).map((p) => p.id));
    if (!memberIds.has(voterId) || !memberIds.has(targetId)) {
      return NextResponse.json({ error: 'Invalid voter or target' }, { status: 403 });
    }

    const votes = { ...(state.votes || {}), [voterId]: targetId };
    const { error: updateError } = await supabase.from('game_state').update({ votes }).eq('room_id', roomId);
    if (updateError) throw updateError;

    const votesIn = Object.keys(votes).length;
    // Everyone voted: tally immediately (server-verified completion).
    if (votesIn >= memberIds.size) {
      const { error: advError } = await supabase.rpc('advance_phase', {
        p_room_id: roomId,
        p_player_id: voterId,
        p_force: true,
      });
      if (advError) {
        console.error('Auto-advance after votes error:', advError);
        return NextResponse.json({ success: true, votesIn, advanced: false });
      }
      return NextResponse.json({ success: true, votesIn, advanced: true });
    }

    return NextResponse.json({ success: true, votesIn, advanced: false });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid vote', details: error.issues }, { status: 400 });
    }
    console.error('Submit vote error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
