'use client';

import { useEffect, useState, Suspense } from 'react';
import { motion } from 'framer-motion';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { GameHeader, Timer, Card, CardContent, PhaseBadge, Button, Avatar } from '@/components/ui';

const patternSvg = `data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fillRule='evenodd'%3E%3Cg fill='%23f97316' fillOpacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E`;

type Role = 'civilian' | 'imposter' | 'spectator';

interface GameStateRow {
  phase: string;
  round: number;
  secret: string | null;
  imposter_ids: string[];
  current_turn: string | null;
  timer_ends_at: string | null;
  votes: Record<string, string>;
  clues: Record<string, string>;
  room_code?: string;
  winner?: string;
}

function PlayContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const roomId = searchParams.get('room');
  const playerId = searchParams.get('player');

  const [gameState, setGameState] = useState<GameStateRow | null>(null);
  const [myRole, setMyRole] = useState<Role>('spectator');
  const [secret, setSecret] = useState<string | null>(null);

  const supabase = createClient();

  useEffect(() => {
    if (!roomId || !playerId) {
      router.push('/');
      return;
    }
    const fetchGameState = async () => {
      try {
        const { data } = await supabase.from('game_state').select('*').eq('room_id', roomId).single();
        const gs = data as unknown as GameStateRow | null;
        if (gs) setGameState(gs);
        const { data: player } = await supabase.from('players').select('role').eq('id', playerId).single();
        const prow = player as unknown as { role: Role } | null;
        if (prow) {
          setMyRole(prow.role);
          if (prow.role === 'civilian' && gs?.secret) setSecret(gs.secret);
        }
      } catch (err) {
        console.error('Fetch game state error:', err);
      }
    };
    fetchGameState();
    const channel = supabase
      .channel(`game:${roomId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'game_state', filter: `room_id=eq.${roomId}` }, (payload) => {
        const next = payload.new as unknown as GameStateRow;
        if (next) {
          setGameState(next);
          setMyRole((prev) => {
            if (prev === 'civilian' && next.secret) setSecret(next.secret);
            return prev;
          });
          if (next.phase === 'result') {
            setTimeout(() => router.push(`/results?room=${roomId}&player=${playerId}`), 5000);
          }
        }
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'players', filter: `id=eq.${playerId}` }, (payload) => {
        const prow = payload.new as unknown as { role?: Role } | null;
        if (prow?.role) setMyRole(prow.role);
      })
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [roomId, playerId, router, supabase]);

  if (!gameState) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-pink-50 to-purple-50">
        <motion.div className="text-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="animate-spin w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-gray-600">Loading game...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="absolute inset-0" style={{ backgroundImage: `url(${patternSvg})` }} />
      <GameHeader roomCode={gameState.room_code ?? ''} phase={gameState.phase} round={gameState.round} maxRounds={3} timerEndsAt={gameState.timer_ends_at} onLeave={() => router.push('/')} />
      <main className="relative px-4 py-6 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="mb-6 flex items-center justify-between">
            <PhaseBadge phase={gameState.phase} />
            <Timer endsAt={gameState.timer_ends_at} size="lg" variant="default" showLabel />
          </div>
          {gameState.phase === 'role_reveal' && <RoleRevealScreen myRole={myRole} secret={secret} />}
          {gameState.phase === 'clue' && <ClueScreen myRole={myRole} secret={secret} currentTurn={gameState.current_turn} playerId={playerId ?? ''} clues={gameState.clues || {}} />}
          {gameState.phase === 'discussion' && <DiscussionScreen />}
          {gameState.phase === 'voting' && <VotingScreen playerId={playerId ?? ''} players={[]} votes={gameState.votes || {}} />}
          {gameState.phase === 'result' && <ResultScreen winner={gameState.winner ?? ''} />}
        </div>
      </main>
    </div>
  );
}

export default function PlayPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><p className="text-gray-600">Loading game...</p></div>}>
      <PlayContent />
    </Suspense>
  );
}

function RoleRevealScreen({ myRole, secret }: { myRole: string; secret: string | null }) {
  return (
    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
      <div className="mb-8">
        <div className="text-8xl mb-4" aria-hidden="true">{myRole === 'imposter' ? 'I' : 'C'}</div>
        <h2 className="font-display text-3xl font-bold text-gray-900 mb-2">{myRole === 'imposter' ? 'YOU ARE THE IMPOSTER' : 'YOU ARE A CIVILIAN'}</h2>
        <p className="text-gray-600 text-lg">{myRole === 'imposter' ? "You don't know the secret. Listen carefully and blend in!" : 'You know the secret. Give a clue without making it obvious.'}</p>
      </div>
      {myRole === 'civilian' && secret && (
        <Card className="card-elevated bg-gradient-to-br from-orange-500 to-pink-500">
          <CardContent className="p-8 text-center text-white">
            <p className="text-sm font-medium mb-2 opacity-90">THE SECRET IS</p>
            <p className="font-display text-4xl font-bold tracking-wider">{secret}</p>
            <p className="text-sm mt-4 opacity-80">Give a clue that hints at it without giving it away</p>
          </CardContent>
        </Card>
      )}
      {myRole === 'imposter' && (
        <Card className="card-elevated bg-gradient-to-br from-purple-500 to-pink-500">
          <CardContent className="p-8 text-center text-white">
            <p className="text-sm font-medium mb-2 opacity-90">YOUR MISSION</p>
            <p className="font-display text-2xl font-bold mb-4">Blend In. Don&apos;t Get Caught.</p>
            <p className="text-sm opacity-80">Watch what others say. Give a vague clue. Act natural.</p>
          </CardContent>
        </Card>
      )}
    </motion.div>
  );
}

function ClueScreen({ myRole, secret, currentTurn, playerId, clues }: { myRole: string; secret: string | null; currentTurn: string | null; playerId: string; clues: Record<string, string> }) {
  const [clue, setClue] = useState('');
  const isMyTurn = currentTurn === playerId;
  const handleSubmit = async () => {
    if (!clue.trim() || !isMyTurn) return;
    setClue('');
  };
  return (
    <Card className="card-elevated">
      <CardContent className="p-6">
        {myRole === 'civilian' && secret && (
          <div className="mb-6 p-4 bg-orange-50 rounded-xl border border-orange-100">
            <p className="text-sm font-medium text-orange-700 mb-1">Secret: {secret}</p>
          </div>
        )}
        {myRole === 'imposter' && (
          <div className="mb-6 p-4 bg-purple-50 rounded-xl border border-purple-100">
            <p className="text-sm font-medium text-purple-700">You are the Imposter. Blend in!</p>
          </div>
        )}
        <div className="space-y-4 mb-6">
          {Object.entries(clues).map(([pid, text]) => (
            <div key={pid} className="p-4 bg-gray-50 rounded-xl border border-gray-100"><p className="text-gray-900">{text}</p></div>
          ))}
        </div>
        {isMyTurn ? (
          <div className="space-y-4">
            <textarea value={clue} onChange={(e) => setClue(e.target.value)} placeholder="Enter your clue..." className="w-full p-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none min-h-[100px]" maxLength={200} />
            <Button onClick={handleSubmit} disabled={!clue.trim()} className="w-full">SUBMIT CLUE</Button>
          </div>
        ) : (
          <p className="text-center text-gray-500">Waiting for other players...</p>
        )}
      </CardContent>
    </Card>
  );
}

function DiscussionScreen() {
  const [message, setMessage] = useState('');
  const [messages] = useState<Array<{ id: string; player_nickname: string; text: string }>>([]);
  return (
    <Card className="card-elevated">
      <CardContent className="p-6">
        <div className="space-y-4 max-h-[400px] overflow-y-auto mb-4">
          {messages.map((msg) => (
            <div key={msg.id} className="p-3 bg-gray-50 rounded-xl">
              <p className="font-medium text-gray-900">{msg.player_nickname}</p>
              <p className="text-gray-700">{msg.text}</p>
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <input type="text" value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Type a message..." className="flex-1 p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-orange-500 focus:border-transparent" />
          <Button onClick={() => setMessage('')} disabled={!message.trim()}>Send</Button>
        </div>
      </CardContent>
    </Card>
  );
}

function VotingScreen({ playerId, players, votes }: { playerId: string; players: Array<{ id: string; avatar_id: number; nickname: string }>; votes: Record<string, string> }) {
  const hasVoted = !!votes[playerId];
  return (
    <Card className="card-elevated">
      <CardContent className="p-6 text-center">
        <h3 className="font-display text-2xl font-bold text-gray-900 mb-2">WHO IS THE IMPOSTER?</h3>
        <p className="text-gray-600 mb-6">Tap to vote</p>
        <div className="grid grid-cols-2 gap-4">
          {players.map((p) => (
            <button key={p.id} disabled={hasVoted || p.id === playerId}
              className={`p-4 rounded-xl border-2 transition-all ${votes[playerId] === p.id ? 'border-orange-500 bg-orange-50' : 'border-gray-200 hover:border-orange-300'}`}>
              <Avatar avatarId={p.avatar_id} size="lg" nickname={p.nickname} />
              <p className="mt-2 font-medium text-gray-900">{p.nickname}</p>
              {votes[playerId] === p.id && <span className="text-sm text-orange-600 font-medium">VOTED</span>}
            </button>
          ))}
        </div>
        {hasVoted && <p className="mt-6 text-gray-500">Waiting for other players...</p>}
      </CardContent>
    </Card>
  );
}

function ResultScreen({ winner }: { winner: string }) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
      <h2 className="font-display text-3xl font-bold text-gray-900 mb-2">{winner === 'civilians' ? 'IMPOSTER CAUGHT!' : 'IMPOSTER ESCAPED!'}</h2>
      <p className="text-gray-600">{winner === 'civilians' ? 'Civilians win!' : 'Imposter wins!'}</p>
    </motion.div>
  );
}
