import { createAdminClient } from '@/lib/supabase/admin';
import { generateRoomCode } from '@/lib/utils';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const createRoomSchema = z.object({
  nickname: z.string().min(1).max(30),
  maxPlayers: z.number().min(4).max(12).default(8),
  // Only modes with seeded topics (see PLAYABLE_MODES in types/game.ts).
  mode: z.enum(['classic', 'desi-life', 'hardcore', 'desi-expert']).default('classic'),
  difficulty: z.enum(['easy', 'medium', 'hard', 'expert', 'nightmare']).default('medium'),
  rounds: z.number().min(1).max(10).default(3),
  avatarId: z.number().min(1).max(8).default(1),
});

export async function POST(request: NextRequest) {
  try {
    const supabase = createAdminClient();
    const body = await request.json();
    const data = createRoomSchema.parse(body);

    // Anonymous play: mint a stable host player id upfront so
    // rooms.host_id === host players.id (start_game relies on this).
    const hostPlayerId = crypto.randomUUID();

    // Insert the room directly (retry on rare code collision) instead of
    // the create_room_with_code RPC.
    let room: { id: string; code: string } | null = null;
    for (let attempt = 0; attempt < 5 && !room; attempt += 1) {
      const code = generateRoomCode();
      const { data: inserted, error: insertError } = await supabase
        .from('rooms')
        .insert({
          code,
          host_id: hostPlayerId,
          max_players: data.maxPlayers,
          mode: data.mode,
          difficulty: data.difficulty,
          rounds: data.rounds,
        })
        .select('id, code')
        .single();
      if (!insertError && inserted) {
        room = inserted as unknown as { id: string; code: string };
      } else if (insertError && (insertError as { code?: string }).code !== '23505') {
        console.error('Create room error:', insertError);
        return NextResponse.json({ error: 'Failed to create room' }, { status: 500 });
      }
    }
    if (!room) {
      console.error('Create room error: code collision retries exhausted');
      return NextResponse.json({ error: 'Failed to create room' }, { status: 500 });
    }
    const roomId = room.id;
    const roomCode = room.code;

    // Add host as first player and return its id so the host
    // goes straight to the lobby (no second join needed).
    const { error: playerError } = await supabase.from('players').insert({
      id: hostPlayerId,
      room_id: roomId,
      nickname: data.nickname,
      avatar_id: data.avatarId,
      is_host: true,
      role: 'spectator',
    });

    if (playerError) {
      console.error('Add host player error:', playerError);
      // Clean up room if player creation fails
      await supabase.from('rooms').delete().eq('id', roomId);
      return NextResponse.json({ error: 'Failed to join room' }, { status: 500 });
    }

    return NextResponse.json({
      roomId,
      code: roomCode,
      playerId: hostPlayerId,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid request data', details: error.issues }, { status: 400 });
    }
    console.error('Create room error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}