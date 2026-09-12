import { createServerClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    const body = await request.json();
    const { roomId } = body;

    if (!roomId) {
      return NextResponse.json({ error: 'Room ID required' }, { status: 400 });
    }

    const playerId = user?.id || crypto.randomUUID();

    const { data: result, error } = await supabase.rpc('start_game', {
      p_room_id: roomId,
      p_host_id: playerId,
    });

    if (error) {
      console.error('Start game error:', error);
      return NextResponse.json({ error: 'Failed to start game' }, { status: 500 });
    }

    const startResult = result[0];
    
    if (!startResult.success) {
      return NextResponse.json({ error: startResult.error }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Start game error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}