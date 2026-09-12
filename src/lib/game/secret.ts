import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';

const PREFIX = 'gti1:';

/**
 * The game_state.secret column is readable by anon clients (the 002 column
 * REVOKE may not be applied on every deployment), so the word itself is
 * stored AES-256-GCM encrypted. Only server code holding GAME_SECRET_KEY
 * can recover it — civilians via /api/game/me, everyone via /api/game/result.
 */
function getKey(): Buffer | null {
  const hex = process.env.GAME_SECRET_KEY;
  if (!hex || !/^[0-9a-fA-F]{64}$/.test(hex)) {
    console.warn('GAME_SECRET_KEY missing/invalid — storing secrets in plaintext (set it in .env.local and Vercel).');
    return null;
  }
  return Buffer.from(hex, 'hex');
}

export function encryptSecret(plain: string): string {
  const key = getKey();
  if (!key) return plain;
  const iv = randomBytes(12);
  const cipher = createCipheriv('aes-256-gcm', key, iv);
  const ct = Buffer.concat([cipher.update(plain, 'utf8'), cipher.final()]);
  return `${PREFIX}${iv.toString('hex')}:${ct.toString('hex')}:${cipher.getAuthTag().toString('hex')}`;
}

export function decryptSecret(stored: string | null): string | null {
  if (!stored) return null;
  if (!stored.startsWith(PREFIX)) return stored; // legacy plaintext row
  const key = getKey();
  if (!key) return null;
  try {
    const [, ivHex, ctHex, tagHex] = stored.split(':');
    const decipher = createDecipheriv('aes-256-gcm', key, Buffer.from(ivHex, 'hex'));
    decipher.setAuthTag(Buffer.from(tagHex, 'hex'));
    return Buffer.concat([decipher.update(Buffer.from(ctHex, 'hex')), decipher.final()]).toString('utf8');
  } catch {
    return null;
  }
}

import type { SupabaseClient } from '@supabase/supabase-js';

/** Re-encrypts a round's secret (+ blind alternate word) in place. No-op if sealed. */
export async function sealRoundSecret(supabase: SupabaseClient, roomId: string): Promise<void> {
  try {
    const { data } = await supabase.from('game_state').select('secret, imposter_word').eq('room_id', roomId).single();
    const row = data as unknown as { secret: string | null; imposter_word: string | null } | null;
    if (!row) return;
    const patch: Record<string, string> = {};
    if (row.secret && !row.secret.startsWith(PREFIX)) patch.secret = encryptSecret(row.secret);
    if (row.imposter_word && !row.imposter_word.startsWith(PREFIX)) patch.imposter_word = encryptSecret(row.imposter_word);
    if (Object.keys(patch).length > 0) {
      await supabase.from('game_state').update(patch).eq('room_id', roomId);
    }
  } catch (err) {
    console.error('Seal round secret error:', err);
  }
}
