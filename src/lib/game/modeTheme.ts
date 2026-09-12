import type { Difficulty, GameMode } from '@/types/game';
import { DIFFICULTY_TIMERS } from '@/types/game';

export interface ModeTheme {
  label: string;
  tagline: string;
  emoji: string;
  /** gradient classes for banners/cards */
  gradient: string;
  /** pill classes for badges */
  pill: string;
}

export const MODE_THEME: Record<GameMode, ModeTheme> = {
  classic: {
    label: 'Classic',
    tagline: 'The original bluff. Pehchano kaun jhootha hai!',
    emoji: '🔍',
    gradient: 'from-orange-500 to-pink-500',
    pill: 'bg-orange-100 text-orange-800',
  },
  'desi-life': {
    label: 'Desi Life',
    tagline: 'Full desi tadka — chai, cricket, shaadi!',
    emoji: '🇮🇳',
    gradient: 'from-amber-500 to-green-600',
    pill: 'bg-amber-100 text-amber-800',
  },
  hardcore: {
    label: 'Hardcore',
    tagline: 'Ulte-seedhe shabd. Tez dimaag only!',
    emoji: '🧠',
    gradient: 'from-red-600 to-stone-900',
    pill: 'bg-red-100 text-red-800',
  },
  'desi-expert': {
    label: 'Desi Expert',
    tagline: 'Asli desi detective test. Good luck!',
    emoji: '🎭',
    gradient: 'from-purple-500 to-indigo-700',
    pill: 'bg-purple-100 text-purple-800',
  },
  'blind-bluff': {
    label: 'Blind Bluff',
    tagline: 'Your own word may be a lie. Bharosa mat karo!',
    emoji: '🙈',
    gradient: 'from-slate-600 to-stone-900',
    pill: 'bg-slate-200 text-slate-800',
  },
  'quick-fire': {
    label: 'Quick Fire',
    tagline: 'Think fast. Bluff faster. Saans mat lo!',
    emoji: '⚡',
    gradient: 'from-yellow-500 to-red-600',
    pill: 'bg-yellow-100 text-yellow-800',
  },
  'double-imposter': {
    label: 'Double Imposter',
    tagline: 'Two liars. One secret. Total chaos.',
    emoji: '👥',
    gradient: 'from-rose-500 to-purple-700',
    pill: 'bg-rose-100 text-rose-800',
  },
  chaos: {
    label: 'Chaos',
    tagline: 'Normal rules? Bhool jao!',
    emoji: '🤪',
    gradient: 'from-fuchsia-500 to-purple-600',
    pill: 'bg-fuchsia-100 text-fuchsia-800',
  },
  'image-clue': {
    label: 'Image Clue',
    tagline: 'A picture says a thousand lies.',
    emoji: '🖼️',
    gradient: 'from-teal-500 to-cyan-600',
    pill: 'bg-teal-100 text-teal-800',
  },
  'friends-custom': {
    label: 'Friends Custom',
    tagline: 'Tumhare shabd, tumhare rules.',
    emoji: '👥',
    gradient: 'from-emerald-500 to-teal-600',
    pill: 'bg-emerald-100 text-emerald-800',
  },
  'ai-chaos': {
    label: 'AI Chaos',
    tagline: 'AI spices things up.',
    emoji: '🤖',
    gradient: 'from-blue-500 to-violet-600',
    pill: 'bg-blue-100 text-blue-800',
  },
};

export interface DifficultyTheme {
  label: string;
  sub: string;
  pill: string;
}

export const DIFFICULTY_THEME: Record<string, DifficultyTheme> = {
  easy: { label: 'Easy', sub: 'Aram se khelo', pill: 'bg-green-100 text-green-800' },
  medium: { label: 'Medium', sub: 'Thoda tez', pill: 'bg-yellow-100 text-yellow-800' },
  hard: { label: 'Hard', sub: 'Dimaag lagao', pill: 'bg-orange-100 text-orange-800' },
  expert: { label: 'Expert', sub: 'One word. No mercy.', pill: 'bg-purple-100 text-purple-800' },
};

export function modeTheme(mode: string): ModeTheme {
  return MODE_THEME[mode as GameMode] ?? MODE_THEME.classic;
}

export function difficultyTheme(difficulty: string): DifficultyTheme {
  return DIFFICULTY_THEME[difficulty] ?? DIFFICULTY_THEME.medium;
}

/** "Clue 45s · Charcha 60s · Vote 25s" — makes levels visibly different. */
export function timerSummary(difficulty: string): string {
  const t = DIFFICULTY_TIMERS[difficulty as Difficulty] ?? DIFFICULTY_TIMERS.medium;
  return `Clue ${t.clue}s · Charcha ${t.discussion}s · Vote ${t.voting}s`;
}
