import { createAdminClient } from '@/lib/supabase/admin';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const joinRoomSchema = z.object({
  code: z.string().length(6).toUpperCase(),
  nickname: z.string().min(1).max(30),
  avatarId: z.number().min(1).max(8).default(1),
});

export async function POST(request: NextRequest) {
  try {
    const supabase = createAdminClient();
    const body = await request.json();
    const data = joinRoomSchema.parse(body);

    // Create anonymous user session if needed
    const { data: { user } } = await supabase.auth.getUser();
    
    let playerId = user?.id;
    
    if (!playerId) {
      playerId = crypto.randomUUID();
    }

    // Join logic lives here (not in the join_room RPC): validate the room,
    // capacity, and nickname, then insert the player row directly.
    const { data: room, error: roomError } = await supabase
      .from('rooms')
      .select('id, status, max_players')
      .eq('code', data.code)
      .single();
    const roomRow = room as unknown as { id: string; status: string; max_players: number } | null;
    if (roomError || !roomRow) {
      return NextResponse.json({ error: 'Room not found' }, { status: 400 });
    }
    if (roomRow.status !== 'waiting') {
      return NextResponse.json({ error: 'Game already started' }, { status: 400 });
    }

    const { data: existing } = await supabase.from('players').select('id, nickname').eq('room_id', roomRow.id);
    const roster = (existing ?? []) as Array<{ id: string; nickname: string }>;
    if (roster.length >= roomRow.max_players) {
      return NextResponse.json({ error: 'Room is full' }, { status: 400 });
    }
    if (roster.some((p) => p.nickname.toLowerCase() === data.nickname.toLowerCase())) {
      return NextResponse.json({ error: 'Nickname already taken' }, { status: 400 });
    }

    const joinResult = { success: true as const, player_id: playerId, room_id: roomRow.id };
    const { error: insertError } = await supabase.from('players').insert({
      id: playerId,
      room_id: roomRow.id,
      nickname: data.nickname,
      avatar_id: data.avatarId,
      is_host: false,
      role: 'spectator',
    });
    if (insertError) {
      console.error('Join room error:', insertError);
      return NextResponse.json({ error: 'Failed to join room' }, { status: 500 });
    }

    // Prefer the room_id from join_room; fall back to a lookup for older deployments.
    let resolvedRoomId = joinResult.room_id;
    if (!resolvedRoomId) {
      const { data: roomRow, error: roomError } = await supabase
        .from('rooms')
        .select('id')
        .eq('code', data.code)
        .single();

      if (roomError || !roomRow) {
        console.error('Room lookup after join failed:', roomError);
        return NextResponse.json({ error: 'Joined but room could not be found' }, { status: 500 });
      }
      resolvedRoomId = (roomRow as { id: string }).id;
    }

    return NextResponse.json({
      roomId: resolvedRoomId,
      playerId: joinResult.player_id,
      code: data.code,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid request data', details: error.issues }, { status: 400 });
    }
    console.error('Join room error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}