'use client';

import { cn } from '@/lib/utils';
import { difficultyTheme, modeTheme, timerSummary } from '@/lib/game/modeTheme';

interface ModeBannerProps {
  mode: string;
  difficulty: string;
  round?: number;
  rounds?: number;
  className?: string;
}

/** Themed strip shown on every game screen so mode + level always feel different. */
export function ModeBanner({ mode, difficulty, round, rounds, className }: ModeBannerProps) {
  const m = modeTheme(mode);
  const d = difficultyTheme(difficulty);
  return (
    <div className={cn(`bg-gradient-to-r ${m.gradient} rounded-2xl px-4 py-3 text-white shadow-lg mb-5`, className)}>
      <div className="flex flex-wrap items-center gap-2">
        <span className="font-display font-black text-lg">
          {m.emoji} {m.label.toUpperCase()}
        </span>
        <span className={`text-xs font-bold rounded-full px-2.5 py-0.5 ${d.pill}`}>{d.label.toUpperCase()}</span>
        {round !== undefined && (
          <span className="text-xs font-bold rounded-full px-2.5 py-0.5 bg-black/30">
            ROUND {round}{rounds ? `/${rounds}` : ''}
          </span>
        )}
      </div>
      <p className="text-white/90 text-sm mt-0.5">{m.tagline}</p>
      <p className="text-white/70 text-xs mt-0.5 tabular-nums">{timerSummary(difficulty)} · {d.sub}</p>
    </div>
  );
}
