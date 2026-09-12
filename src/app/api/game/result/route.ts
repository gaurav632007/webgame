import { createAdminClient } from '@/lib/supabase/admin';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const resultSchema = z.object({
  roomId: z.string().uuid(),
  playerId: z.string().uuid(),
});

/**
 * Full game result. Served server-side (admin client) because the secret
 * column is revoked for anon clients. Only room members may call it.
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = createAdminClient();
    const { roomId, playerId } = resultSchema.parse(await request.json());

    const { data: member } = await supabase.from('players').select('id').eq('id', playerId).eq('room_id', roomId).single();
    if (!member) return NextResponse.json({ error: 'Not a room member' }, { status: 403 });

    const { data: gs } = await supabase.from('game_state').select('*').eq('room_id', roomId).single();
    const state = gs as unknown as {
      phase: string; round: number; secret: string | null;
      winner: string | null; imposter_ids: string[];
    } | null;
    if (!state) return NextResponse.json({ error: 'Game has not started' }, { status: 400 });
    if (state.phase !== 'result' && state.phase !== 'game_over') {
      return NextResponse.json({ error: 'Game is not finished yet' }, { status: 400 });
    }

    const { data: room } = await supabase.from('rooms').select('*').eq('id', roomId).single();
    const roomRow = room as unknown as {
      code: string; mode: string; difficulty: string; rounds: number; created_at: string;
    } | null;

    const { data: roster } = await supabase
      .from('players')
      .select('id, nickname, avatar_id, role, is_host')
      .eq('room_id', roomId)
      .order('joined_at', { ascending: true });
    const allPlayers = (roster ?? []) as Array<{ id: string; nickname: string; avatar_id: number; role: string; is_host: boolean }>;
    const imposterSet = new Set(state.imposter_ids || []);
    const imposters = allPlayers.filter((p) => imposterSet.has(p.id));
    const civilians = allPlayers.filter((p) => !imposterSet.has(p.id));

    // Best-effort history row (dedupe: one row per room per 5 minutes).
    try {
      const since = new Date(Date.now() - 5 * 60 * 1000).toISOString();
      const { data: recent } = await supabase
        .from('game_results')
        .select('id')
        .eq('room_id', roomId)
        .gte('created_at', since)
        .limit(1);
      if (!recent || (recent as Array<unknown>).length === 0) {
        const durationMs = roomRow ? Math.max(0, Date.now() - new Date(roomRow.created_at).getTime()) : 0;
        await supabase.from('game_results').insert({
          room_id: roomId,
          winner: state.winner === 'civilians' ? 'civilians' : 'imposter',
          imposter_ids: state.imposter_ids || [],
          civilian_ids: civilians.map((p) => p.id),
          duration_ms: durationMs,
          rounds_played: state.round,
        });
      }
    } catch (historyError) {
      console.error('Game history insert error:', historyError);
    }

    return NextResponse.json({
      secret: state.secret,
      winner: state.winner,
      phase: state.phase,
      round: state.round,
      rounds: roomRow?.rounds ?? state.round,
      mode: roomRow?.mode ?? 'classic',
      difficulty: roomRow?.difficulty ?? 'medium',
      roomCode: roomRow?.code ?? '',
      imposters,
      civilians,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid request data', details: error.issues }, { status: 400 });
    }
    console.error('Get result error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
