'use client';

import { cn } from '@/lib/utils';
import { Timer } from './Timer';

interface GameHeaderProps {
  roomCode?: string;
  phase?: string;
  round?: number;
  maxRounds?: number;
  timerEndsAt?: string | null;
  onCopyCode?: () => void;
  onLeave?: () => void;
}

const patternSvg = `data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fillRule='evenodd'%3E%3Cg fill='%23f97316' fillOpacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E`;

export function GameHeader({
  roomCode,
  phase,
  round,
  maxRounds,
  timerEndsAt,
  onCopyCode,
  onLeave,
}: GameHeaderProps) {
  return (
    <header className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-orange-50 via-pink-50 to-purple-50" />
      <div className="absolute inset-0 opacity-50" style={{ backgroundImage: `url(${patternSvg})` }} />
      
      <div className="relative px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-2xl" aria-hidden="true">🎭</span>
              <span className="font-bold text-xl bg-gradient-to-r from-orange-600 to-pink-600 bg-clip-text text-transparent">
                Guess The Imposter
              </span>
            </div>
            
            {roomCode && (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-white/80 backdrop-blur-sm rounded-xl border border-orange-100 shadow-sm">
                <span className="text-xs font-medium text-gray-500">ROOM</span>
                <span className="font-mono font-bold text-lg text-gray-900 tracking-widest">{roomCode}</span>
                {onCopyCode && (
                  <button
                    onClick={onCopyCode}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-orange-500 hover:bg-orange-50 transition-colors"
                    aria-label="Copy room code"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                    </svg>
                  </button>
                )}
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-3 sm:ml-auto">
            {phase && (
              <PhaseBadge phase={phase} />
            )}
            
            {round && maxRounds && (
              <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-white/80 backdrop-blur-sm rounded-xl border border-gray-100">
                <span className="text-xs font-medium text-gray-500">ROUND</span>
                <span className="font-mono font-bold text-lg text-gray-900">{round}/{maxRounds}</span>
              </div>
            )}
            
            {timerEndsAt && (
              <Timer endsAt={timerEndsAt} size="lg" variant="default" showLabel />
            )}
            
            {onLeave && (
              <button
                onClick={onLeave}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-600 bg-white/80 backdrop-blur-sm rounded-xl border border-gray-100 hover:bg-red-50 hover:border-red-200 hover:text-red-600 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Leave
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

function PhaseBadge({ phase }: { phase: string }) {
  const configs: Record<string, { label: string; icon: string; color: string }> = {
    lobby: { label: 'Lobby', icon: '🏠', color: 'bg-blue-100 text-blue-700' },
    role_reveal: { label: 'Revealing Roles', icon: '🎭', color: 'bg-purple-100 text-purple-700' },
    clue: { label: 'Clue Round', icon: '💬', color: 'bg-yellow-100 text-yellow-700' },
    discussion: { label: 'Discussion', icon: '🗣️', color: 'bg-pink-100 text-pink-700' },
    voting: { label: 'Voting', icon: '🗳️', color: 'bg-red-100 text-red-700' },
    result: { label: 'Results', icon: '🏆', color: 'bg-green-100 text-green-700' },
    game_over: { label: 'Game Over', icon: '🎮', color: 'bg-gray-100 text-gray-700' },
  };
  
  const config = configs[phase] || { label: phase, icon: '❓', color: 'bg-gray-100 text-gray-700' };
  
  return (
    <span className={cn('inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium', config.color)}>
      <span aria-hidden="true">{config.icon}</span>
      {config.label}
    </span>
  );
}