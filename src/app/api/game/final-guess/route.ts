import { createAdminClient } from '@/lib/supabase/admin';
import { decryptSecret } from '@/lib/game/secret';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const finalGuessSchema = z.object({
  roomId: z.string().uuid(),
  playerId: z.string().uuid(),
  guess: z.string().trim().min(1).max(100),
});

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9 ]/g, ' ').replace(/\s+/g, ' ').trim();

/**
 * ONE LAST CHANCE — a caught Imposter gets one attempt at the secret word.
 * Correct: the Imposter steals the round (+5). Wrong: the Crew keeps the win.
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = createAdminClient();
    const { roomId, playerId, guess } = finalGuessSchema.parse(await request.json());

    const { data: gs } = await supabase.from('game_state').select('*').eq('room_id', roomId).single();
    const state = gs as unknown as {
      phase: string; winner: string | null; imposter_ids: string[];
      secret: string | null; final_guess: Record<string, unknown>; scores: Record<string, number>;
    } | null;
    if (!state) return NextResponse.json({ error: 'Game has not started' }, { status: 400 });
    if (state.phase !== 'result') return NextResponse.json({ error: 'No final guess right now' }, { status: 400 });
    if (state.winner !== 'civilians') return NextResponse.json({ error: 'Only a caught Imposter gets a final guess' }, { status: 400 });
    if (!state.imposter_ids?.includes(playerId)) return NextResponse.json({ error: 'Only the Imposter can guess' }, { status: 403 });
    if (state.final_guess && Object.keys(state.final_guess).length > 0) {
      return NextResponse.json({ error: 'Final guess already used' }, { status: 400 });
    }

    const secretWord = decryptSecret(state.secret) ?? '';
    const correct = norm(guess) === norm(secretWord) && norm(secretWord).length > 0;

    const finalGuess = { by: playerId, guess: guess.trim(), correct };
    const scores = { ...(state.scores || {}) };
    if (correct) {
      scores[playerId] = (scores[playerId] ?? 0) + 5;
    }

    const { error: updateError } = await supabase
      .from('game_state')
      .update({
        final_guess: finalGuess,
        winner: correct ? 'imposter' : 'civilians',
        scores,
      })
      .eq('room_id', roomId);
    if (updateError) throw updateError;

    return NextResponse.json({
      success: true,
      correct,
      message: correct ? 'IMPOSSIBLE! THE IMPOSTER STOLE THE ROUND!' : 'BUSTED! CREW WINS!',
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid guess', details: error.issues }, { status: 400 });
    }
    console.error('Final guess error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
