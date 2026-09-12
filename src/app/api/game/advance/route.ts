import { createAdminClient } from '@/lib/supabase/admin';
import { sealRoundSecret } from '@/lib/game/secret';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const advanceSchema = z.object({
  roomId: z.string().uuid(),
  playerId: z.string().uuid(),
});

export async function POST(request: NextRequest) {
  try {
    const supabase = createAdminClient();
    const body = await request.json();
    const { roomId, playerId } = advanceSchema.parse(body);

    const { data: result, error } = await supabase.rpc('advance_phase', {
      p_room_id: roomId,
      p_player_id: playerId,
    });

    if (error) {
      console.error('Advance phase error:', error);
      return NextResponse.json({ error: 'Failed to advance phase' }, { status: 500 });
    }

    const adv = (result as Array<{ success: boolean; error: string | null; phase: string }>)[0];
    if (!adv?.success) {
      return NextResponse.json({ error: adv?.error || 'Cannot advance yet', phase: adv?.phase }, { status: 400 });
    }

    // A fresh round writes a fresh plaintext secret — seal it immediately.
    if (adv.phase === 'role_reveal') {
      await sealRoundSecret(supabase, roomId);
    }
    return NextResponse.json({ success: true, phase: adv.phase });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid request data', details: error.issues }, { status: 400 });
    }
    console.error('Advance phase error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
