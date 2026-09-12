import { createServerClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const joinRoomSchema = z.object({
  code: z.string().length(6).toUpperCase(),
  nickname: z.string().min(1).max(30),
  avatarId: z.number().min(1).max(8).default(1),
});

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerClient();
    const body = await request.json();
    const data = joinRoomSchema.parse(body);

    // Create anonymous user session if needed
    const { data: { user } } = await supabase.auth.getUser();
    
    let playerId = user?.id;
    
    if (!playerId) {
      playerId = crypto.randomUUID();
    }

    // Call the database function to join room
    const { data: result, error } = await supabase.rpc('join_room', {
      p_room_code: data.code,
      p_player_id: playerId,
      p_nickname: data.nickname,
      p_avatar_id: data.avatarId,
    });

    if (error) {
      console.error('Join room error:', error);
      return NextResponse.json({ error: 'Failed to join room' }, { status: 500 });
    }

    const joinResult = result[0] as { success: boolean; error: string | null; player_id: string; room_id?: string };

    if (!joinResult.success) {
      return NextResponse.json({ error: joinResult.error }, { status: 400 });
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