import { createAdminClient } from '@/lib/supabase/admin';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const messageSchema = z.object({
  roomId: z.string().uuid(),
  playerId: z.string().uuid(),
  text: z.string().trim().min(1).max(280),
});

export async function POST(request: NextRequest) {
  try {
    const supabase = createAdminClient();
    const { roomId, playerId, text } = messageSchema.parse(await request.json());

    const { data: gs } = await supabase.from('game_state').select('phase').eq('room_id', roomId).single();
    if ((gs as unknown as { phase: string } | null)?.phase !== 'discussion') {
      return NextResponse.json({ error: 'Chat is only open during discussion' }, { status: 400 });
    }

    const { data: member } = await supabase
      .from('players')
      .select('id, nickname, avatar_id')
      .eq('id', playerId)
      .eq('room_id', roomId)
      .single();
    const author = member as unknown as { id: string; nickname: string; avatar_id: number } | null;
    if (!author) return NextResponse.json({ error: 'Not a room member' }, { status: 403 });

    const { data: inserted, error: insertError } = await supabase
      .from('messages')
      .insert({
        room_id: roomId,
        player_id: playerId,
        player_nickname: author.nickname,
        player_avatar: author.avatar_id,
        text,
      })
      .select('id, player_nickname, player_avatar, text, created_at')
      .single();
    if (insertError) throw insertError;

    return NextResponse.json({ success: true, message: inserted });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid message', details: error.issues }, { status: 400 });
    }
    console.error('Send message error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
