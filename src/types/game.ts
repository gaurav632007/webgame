export type GameMode = 'classic' | 'desi-life' | 'hardcore' | 'chaos' | 'image-clue' | 'friends-custom' | 'desi-expert' | 'ai-chaos';

export type Difficulty = 'easy' | 'medium' | 'hard' | 'expert';

export type GamePhase = 
  | 'lobby' 
  | 'role_reveal' 
  | 'clue' 
  | 'discussion' 
  | 'voting' 
  | 'result' 
  | 'game_over';

export type PlayerRole = 'civilian' | 'imposter' | 'spectator';

export type ReactionType = 'laugh' | 'think' | 'shock' | 'eyes' | 'fire';

export interface Player {
  id: string;
  room_id: string;
  nickname: string;
  avatar_id: number;
  is_host: boolean;
  role: PlayerRole;
  joined_at: string;
  is_connected: boolean;
}

export interface Room {
  id: string;
  code: string;
  host_id: string;
  max_players: number;
  mode: GameMode;
  difficulty: Difficulty;
  rounds: number;
  current_round: number;
  status: 'waiting' | 'playing' | 'finished';
  created_at: string;
  updated_at: string;
}

export interface GameState {
  id: string;
  room_id: string;
  phase: GamePhase;
  round: number;
  secret: string | null;
  imposter_ids: string[];
  current_turn: string | null;
  timer_ends_at: string | null;
  votes: Record<string, string>;
  clues: Record<string, string>;
  created_at: string;
  updated_at: string;
}

export interface Topic {
  id: string;
  word: string;
  category: string;
  difficulty: Difficulty;
  mode: GameMode;
  image_url?: string;
  related_words?: string[];
}

export interface Clue {
  player_id: string;
  player_nickname: string;
  player_avatar: number;
  text: string;
  round: number;
  created_at: string;
}

export interface Vote {
  voter_id: string;
  target_id: string;
  round: number;
}

export interface Message {
  id: string;
  room_id: string;
  player_id: string;
  player_nickname: string;
  player_avatar: number;
  text: string;
  created_at: string;
}

export interface Reaction {
  id: string;
  room_id: string;
  player_id: string;
  target_type: 'clue' | 'message';
  target_id: string;
  type: ReactionType;
  created_at: string;
}

export interface GameResult {
  room_id: string;
  winner: 'civilians' | 'imposter';
  imposter_ids: string[];
  civilian_ids: string[];
  duration_ms: number;
  rounds_played: number;
  created_at: string;
}

export interface RoomSettings {
  maxPlayers: number;
  mode: GameMode;
  difficulty: Difficulty;
  rounds: number;
}

export const DEFAULT_ROOM_SETTINGS: RoomSettings = {
  maxPlayers: 8,
  mode: 'classic',
  difficulty: 'medium',
  rounds: 3,
};

export const GAME_MODES: { value: GameMode; label: string; description: string; icon: string }[] = [
  { value: 'classic', label: 'Classic', description: 'Standard Imposter game', icon: '🔍' },
  { value: 'desi-life', label: 'Desi Life', description: 'Indian life topics', icon: '🇮🇳' },
  { value: 'hardcore', label: 'Hardcore', description: 'Difficult & similar topics', icon: '🧠' },
  { value: 'chaos', label: 'Chaos', description: 'Random rule twists', icon: '🤪' },
  { value: 'image-clue', label: 'Image Clue', description: 'Picture-based clues', icon: '🖼️' },
  { value: 'friends-custom', label: 'Friends Custom', description: 'Your own topic pack', icon: '👥' },
  { value: 'desi-expert', label: 'Desi Expert', description: 'Ultra-specific Indian topics', icon: '🎭' },
  { value: 'ai-chaos', label: 'AI Chaos', description: 'AI-generated scenarios', icon: '🤖' },
];

export const DIFFICULTIES: { value: Difficulty; label: string; description: string; color: string }[] = [
  { value: 'easy', label: 'Easy', description: 'Obvious topics for beginners', color: 'text-green-600' },
  { value: 'medium', label: 'Medium', description: 'Normal gameplay', color: 'text-yellow-600' },
  { value: 'hard', label: 'Hard', description: 'Similar concepts', color: 'text-orange-600' },
  { value: 'expert', label: 'Expert', description: 'Very subtle concepts', color: 'text-purple-600' },
];

export const PHASE_TIMERS: Record<GamePhase, number> = {
  lobby: 0,
  role_reveal: 5,
  clue: 30,
  discussion: 60,
  voting: 20,
  result: 5,
  game_over: 0,
};

export const AVATARS = [
  { id: 1, name: 'Arjun', personality: 'confident / funny' },
  { id: 2, name: 'Priya', personality: 'intelligent / suspicious' },
  { id: 3, name: 'Rahul', personality: 'confused funny guy' },
  { id: 4, name: 'Aisha', personality: 'bold and sarcastic' },
  { id: 5, name: 'Kabir', personality: 'cool character' },
  { id: 6, name: 'Meera', personality: 'calm but dangerous' },
  { id: 7, name: 'Rohan', personality: 'chaotic joker' },
  { id: 8, name: 'Simran', personality: 'competitive' },
];

export const REACTIONS: { type: ReactionType; emoji: string; label: string }[] = [
  { type: 'laugh', emoji: '😂', label: 'Funny' },
  { type: 'think', emoji: '🤔', label: 'Thinking' },
  { type: 'shock', emoji: '😱', label: 'Shocked' },
  { type: 'eyes', emoji: '👀', label: 'Suspicious' },
  { type: 'fire', emoji: '🔥', label: 'Fire' },
];