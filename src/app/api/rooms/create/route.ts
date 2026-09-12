import { createServerClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const createRoomSchema = z.object({
  nickname: z.string().min(1).max(30),
  maxPlayers: z.number().min(4).max(12).default(8),
  mode: z.enum(['classic', 'desi-life', 'hardcore', 'chaos', 'image-clue', 'friends-custom', 'desi-expert', 'ai-chaos']).default('classic'),
  difficulty: z.enum(['easy', 'medium', 'hard', 'expert']).default('medium'),
  rounds: z.number().min(1).max(10).default(3),
  avatarId: z.number().min(1).max(8).default(1),
});

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerClient();
    const body = await request.json();
    const data = createRoomSchema.parse(body);

    // Create anonymous user session if needed
    const { data: { user } } = await supabase.auth.getUser();
    
    let playerId = user?.id;
    
    if (!playerId) {
      // Generate a temporary ID for anonymous players
      playerId = crypto.randomUUID();
    }

    // Call the database function to create room
    const { data: result, error } = await supabase.rpc('create_room_with_code', {
      p_host_id: playerId,
      p_max_players: data.maxPlayers,
      p_mode: data.mode,
      p_difficulty: data.difficulty,
      p_rounds: data.rounds,
    });

    if (error) {
      console.error('Create room error:', error);
      return NextResponse.json({ error: 'Failed to create room' }, { status: 500 });
    }

    const room = result[0];
    
    // Add host as first player
    const { error: playerError } = await supabase
      .from('players')
      .insert({
        room_id: room.room_id,
        nickname: data.nickname,
        avatar_id: data.avatarId,
        is_host: true,
        role: 'spectator',
      });

    if (playerError) {
      console.error('Add host player error:', playerError);
      // Clean up room if player creation fails
      await supabase.from('rooms').delete().eq('id', room.room_id);
      return NextResponse.json({ error: 'Failed to join room' }, { status: 500 });
    }

    return NextResponse.json({
      roomId: room.room_id,
      code: room.code,
      playerId,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid request data', details: error.issues }, { status: 400 });
    }
    console.error('Create room error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}