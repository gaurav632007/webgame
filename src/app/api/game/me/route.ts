import { createAdminClient } from '@/lib/supabase/admin';
import { decryptSecret } from '@/lib/game/secret';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const meSchema = z.object({
  roomId: z.string().uuid(),
  playerId: z.string().uuid(),
});

/**
 * Returns the caller's role and — only for civilians — the secret.
 * The Imposter never receives the secret through any path.
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = createAdminClient();
    const body = await request.json();
    const { roomId, playerId } = meSchema.parse(body);

    const { data, error } = await supabase.rpc('get_my_view', {
      p_room_id: roomId,
      p_player_id: playerId,
    });

    if (error) {
      console.error('Get my view error:', error);
      return NextResponse.json({ error: 'Failed to load role' }, { status: 500 });
    }

    const view = data as { role: string | null; secret: string | null };
    return NextResponse.json({ role: view.role, secret: decryptSecret(view.secret) });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid request data', details: error.issues }, { status: 400 });
    }
    console.error('Get my view error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
