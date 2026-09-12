'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { createClient } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';
import { REACTIONS, type ReactionType } from '@/types/game';

interface ReactionBarProps {
  roomId: string;
  playerId: string;
  targetType: 'clue' | 'message';
  targetId: string;
  compact?: boolean;
}

interface ReactionRow {
  type: ReactionType;
  player_id: string;
}

export function ReactionBar({ roomId, playerId, targetType, targetId, compact = false }: ReactionBarProps) {
  const [counts, setCounts] = useState<Record<ReactionType, number>>({ laugh: 0, think: 0, shock: 0, eyes: 0, fire: 0 });
  const [mine, setMine] = useState<Set<ReactionType>>(new Set());
  const supabase = createClient();

  useEffect(() => {
    let cancelled = false;
    const fetchReactions = async () => {
      const { data } = await supabase
        .from('reactions')
        .select('type, player_id')
        .eq('room_id', roomId)
        .eq('target_type', targetType)
        .eq('target_id', targetId);
      if (cancelled) return;
      const rows = (data ?? []) as unknown as ReactionRow[];
      const next: Record<ReactionType, number> = { laugh: 0, think: 0, shock: 0, eyes: 0, fire: 0 };
      const mineNext = new Set<ReactionType>();
      for (const r of rows) {
        next[r.type] = (next[r.type] || 0) + 1;
        if (r.player_id === playerId) mineNext.add(r.type);
      }
      setCounts(next);
      setMine(mineNext);
    };
    fetchReactions();
    const channel = supabase
      .channel(`reactions:${roomId}:${targetId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'reactions', filter: `room_id=eq.${roomId}` }, () => fetchReactions())
      .subscribe();
    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
    };
  }, [roomId, targetType, targetId, playerId, supabase]);

  const toggle = async (type: ReactionType) => {
    // Optimistic update.
    setMine((prev) => {
      const next = new Set(prev);
      if (next.has(type)) {
        next.delete(type);
        setCounts((c) => ({ ...c, [type]: Math.max(0, c[type] - 1) }));
      } else {
        next.add(type);
        setCounts((c) => ({ ...c, [type]: c[type] + 1 }));
      }
      return next;
    });
    try {
      await fetch('/api/game/react', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomId, playerId, targetType, targetId, type }),
      });
    } catch {
      /* realtime sync will correct the count */
    }
  };

  return (
    <div className={cn('flex items-center gap-1', compact && 'gap-0.5')} role="group" aria-label="Reactions">
      {REACTIONS.map((r) => (
        <motion.button
          key={r.type}
          whileTap={{ scale: 1.4 }}
          onClick={() => toggle(r.type)}
          title={r.label}
          aria-label={`React ${r.label}`}
          aria-pressed={mine.has(r.type)}
          className={cn(
            'rounded-lg transition-colors',
            compact ? 'px-1 py-0.5 text-sm' : 'px-1.5 py-1 text-base',
            mine.has(r.type) ? 'bg-orange-100' : 'hover:bg-gray-100',
          )}
        >
          <span aria-hidden="true">{r.emoji}</span>
          {counts[r.type] > 0 && <span className="ml-0.5 text-xs font-semibold text-gray-600">{counts[r.type]}</span>}
        </motion.button>
      ))}
    </div>
  );
}
