'use client';

import { useEffect, useState, useCallback, useRef, Suspense } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { GameHeader, Timer, Card, CardContent, PhaseBadge, Button, Avatar, Modal } from '@/components/ui';
import { ReactionBar } from '@/components/game/ReactionBar';
import { ConfettiBurst } from '@/components/game/Confetti';
import type { Player } from '@/types/game';

// NOTE: never select the `secret` column directly — it is revoked for anon
// clients. Civilians receive it via POST /api/game/me (get_my_view RPC).
const GAME_STATE_COLUMNS =
  'id,room_id,phase,round,imposter_ids,current_turn,timer_ends_at,votes,clues,winner,scores,final_guess,vote_calls,revote_targets,created_at,updated_at';

const patternSvg = `data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fillRule='evenodd'%3E%3Cg fill='%23f97316' fillOpacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2V6h4V4h-4zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E`;

type Role = 'civilian' | 'imposter' | 'spectator';

interface GameStateRow {
  phase: string;
  round: number;
  imposter_ids: string[];
  current_turn: string | null;
  timer_ends_at: string | null;
  votes: Record<string, string>;
  clues: Record<string, string>;
  room_code?: string;
  winner?: string | null;
  scores: Record<string, number>;
  final_guess: { by?: string; guess?: string; correct?: boolean };
  vote_calls: Record<string, boolean>;
  revote_targets: string[];
}

interface MyView {
  role: Role | null;
  secret: string | null;
  category: string | null;
  hint: string | null;
  difficulty: string | null;
}

function PlayContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const roomId = searchParams.get('room');
  const playerId = searchParams.get('player');

  const [gameState, setGameState] = useState<GameStateRow | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [isHost, setIsHost] = useState(false);
  const [myRole, setMyRole] = useState<Role>('spectator');
  const [secret, setSecret] = useState<string | null>(null);
  const [myView, setMyView] = useState<MyView>({ role: null, secret: null, category: null, hint: null, difficulty: null });

  const supabase = createClient();

  const fetchMyView = useCallback(async () => {
    if (!roomId || !playerId) return;
    try {
      const res = await fetch('/api/game/me', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomId, playerId }),
      });
      if (!res.ok) return;
      const data = (await res.json()) as MyView;
      if (data.role) setMyRole(data.role);
      setSecret(data.secret);
      setMyView(data);
    } catch (err) {
      console.error('Fetch my view error:', err);
    }
  }, [roomId, playerId]);

  const fetchPlayers = useCallback(async () => {
    if (!roomId) return;
    try {
      const { data } = await supabase.from('players').select('*').eq('room_id', roomId).order('joined_at', { ascending: true });
      const list = (data ?? []) as unknown as Player[];
      setPlayers(list);
      const me = list.find((p) => p.id === playerId);
      if (me) setIsHost(me.is_host);
    } catch (err) {
      console.error('Fetch players error:', err);
    }
  }, [roomId, playerId, supabase]);

  useEffect(() => {
    if (!roomId || !playerId) {
      router.push('/');
      return;
    }
    const fetchGameState = async () => {
      try {
        const { data } = await supabase.from('game_state').select(GAME_STATE_COLUMNS).eq('room_id', roomId).single();
        const gs = data as unknown as GameStateRow | null;
        if (gs) setGameState(gs);
      } catch (err) {
        console.error('Fetch game state error:', err);
      }
    };
    fetchGameState();
    // Initial fetch on mount + realtime subscription below; cascading render is intended here.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchMyView();
    fetchPlayers();

    const channel = supabase
      .channel(`game:${roomId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'game_state', filter: `room_id=eq.${roomId}` }, (payload) => {
        const next = payload.new as unknown as GameStateRow;
        if (next) {
          setGameState(next);
          if (next.phase === 'game_over') {
            router.push(`/results?room=${roomId}&player=${playerId}`);
          }
        }
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'players', filter: `room_id=eq.${roomId}` }, () => {
        fetchPlayers();
        fetchMyView();
      })
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [roomId, playerId, router, supabase, fetchMyView, fetchPlayers]);

  // Host drives the phase machine: when the timer lapses, advance.
  useEffect(() => {
    if (!isHost || !gameState?.timer_ends_at || !roomId || !playerId) return;
    const msLeft = new Date(gameState.timer_ends_at).getTime() - Date.now();
    if (msLeft <= 0) {
      fetch('/api/game/advance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomId, playerId }),
      }).catch((err) => console.error('Advance error:', err));
      return;
    }
    const t = setTimeout(
      () => {
        fetch('/api/game/advance', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ roomId, playerId }),
        }).catch((err) => console.error('Advance error:', err));
      },
      msLeft + 750,
    );
    return () => clearTimeout(t);
  }, [isHost, gameState?.timer_ends_at, gameState?.phase, roomId, playerId]);

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

  const imposters = players.filter((p) => gameState.imposter_ids.includes(p.id));

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
          {gameState.phase === 'role_reveal' && (
            <RoleRevealScreen myRole={myRole} secret={secret} category={myView.category} hint={myView.hint} difficulty={myView.difficulty} />
          )}
          {gameState.phase === 'clue' && (
            <ClueScreen
              myRole={myRole}
              secret={secret}
              currentTurn={gameState.current_turn}
              playerId={playerId ?? ''}
              roomId={roomId ?? ''}
              players={players}
              clues={gameState.clues || {}}
              nightmare={myView.difficulty === 'nightmare'}
            />
          )}
          {gameState.phase === 'discussion' && (
            <DiscussionScreen
              roomId={roomId ?? ''}
              playerId={playerId ?? ''}
              players={players}
              isHost={isHost}
              voteCalls={gameState.vote_calls || {}}
            />
          )}
          {gameState.phase === 'voting' && (
            <VotingScreen
              playerId={playerId ?? ''}
              roomId={roomId ?? ''}
              players={players}
              votes={gameState.votes || {}}
              revoteTargets={gameState.revote_targets || []}
            />
          )}
          {gameState.phase === 'result' && (
            <ResultScreen
              winner={gameState.winner ?? ''}
              imposters={imposters}
              players={players}
              playerId={playerId ?? ''}
              roomId={roomId ?? ''}
              myRole={myRole}
              round={gameState.round}
              votes={gameState.votes || {}}
              finalGuess={gameState.final_guess || {}}
            />
          )}
          {gameState.phase === 'game_over' && (
            <ResultScreen
              winner={gameState.winner ?? ''}
              imposters={imposters}
              players={players}
              playerId={playerId ?? ''}
              roomId={roomId ?? ''}
              myRole={myRole}
              round={gameState.round}
              votes={gameState.votes || {}}
              finalGuess={gameState.final_guess || {}}
              final
            />
          )}
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

function RoleRevealScreen({ myRole, secret, category, hint, difficulty }: {
  myRole: string; secret: string | null; category: string | null; hint: string | null; difficulty: string | null;
}) {
  return (
    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
      <div className="mb-8">
        <div className="text-8xl mb-4" aria-hidden="true">{myRole === 'imposter' ? 'I' : 'C'}</div>
        <h2 className="font-display text-3xl font-bold text-gray-900 mb-2">{myRole === 'imposter' ? 'YOU ARE THE IMPOSTER' : 'YOU ARE A CIVILIAN'}</h2>
        <p className="text-gray-600 text-lg">{myRole === 'imposter' ? "Blend in. Figure out the secret. Don't get caught!" : 'You know the secret. Give a clue without making it obvious.'}</p>
      </div>
      {myRole === 'civilian' && secret && (
        <Card className="card-elevated bg-gradient-to-br from-orange-500 to-pink-500">
          <CardContent className="p-8 text-center text-white">
            {category && <p className="text-sm font-medium mb-1 opacity-90">CATEGORY: {category.toUpperCase()}</p>}
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
            {(category || hint) ? (
              <div className="mb-4">
                {category && <p className="font-display text-xl font-bold">Category: {category}</p>}
                {hint && <p className="text-lg opacity-90">Hint: {hint}</p>}
              </div>
            ) : (
              <p className="font-display text-2xl font-bold mb-4">You know NOTHING. Good luck!</p>
            )}
            <p className="text-sm opacity-80">
              {difficulty === 'nightmare' ? 'Nightmare: one-word clues, short timers, no re-votes.' : 'Watch what others say. Give a vague clue. Act natural.'}
            </p>
          </CardContent>
        </Card>
      )}
    </motion.div>
  );
}

function ClueScreen({
  myRole, secret, currentTurn, playerId, roomId, players, clues, nightmare,
}: {
  myRole: string; secret: string | null; currentTurn: string | null;
  playerId: string; roomId: string; players: Player[]; clues: Record<string, string>;
  nightmare: boolean;
}) {
  const [clue, setClue] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const isMyTurn = currentTurn === playerId;
  const byId = new Map(players.map((p) => [p.id, p]));
  const clueCount = Object.keys(clues).length;
  const turnPlayer = currentTurn ? byId.get(currentTurn) : undefined;

  const handleSubmit = async () => {
    const text = clue.trim();
    if (!text || !isMyTurn || isSubmitting) return;
    if (text.length > 200) {
      setSubmitError('Clue must be 200 characters or fewer.');
      return;
    }
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      const res = await fetch('/api/game/clue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomId, playerId, text }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to submit clue');
      setClue('');
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Failed to submit clue');
    } finally {
      setIsSubmitting(false);
    }
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

        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display text-lg font-bold text-gray-900">Clues</h3>
          <span className="text-sm text-gray-500">{clueCount}/{players.length} in</span>
        </div>

        <div className="space-y-3 mb-6">
          {Object.entries(clues).map(([pid, text]) => {
            const author = byId.get(pid);
            return (
              <motion.div key={pid} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                <div className="flex items-center gap-2 mb-1">
                  <Avatar avatarId={author?.avatar_id ?? 1} size="xs" nickname={author?.nickname ?? '?'} />
                  <p className="font-semibold text-sm text-gray-900">{author?.nickname ?? 'Someone'}{pid === playerId ? ' (you)' : ''}</p>
                </div>
                <p className="text-gray-900 mb-2">{text}</p>
                <ReactionBar roomId={roomId} playerId={playerId} targetType="clue" targetId={pid} compact />
              </motion.div>
            );
          })}
          {clueCount === 0 && <p className="text-center text-gray-400 text-sm py-4">No clues yet — yours could be first.</p>}
        </div>

        {nightmare && (
          <div className="mb-4 p-3 bg-red-50 rounded-xl border border-red-200 text-center">
            <p className="text-sm font-bold text-red-700">NIGHTMARE: exactly ONE word. No secret word. No mercy.</p>
          </div>
        )}
        {isMyTurn ? (
          <div className="space-y-3">
            <div className="p-3 bg-orange-50 rounded-xl border border-orange-200 text-center">
              <p className="text-sm font-semibold text-orange-700">Your turn! Give a clue{nightmare ? ' — ONE word' : ''}.</p>
            </div>
            <textarea
              value={clue}
              onChange={(e) => setClue(e.target.value)}
              placeholder={myRole === 'imposter' ? 'Say something vague but believable...' : 'Hint at the secret without saying it...'}
              className="w-full p-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none min-h-[100px]"
              maxLength={200}
            />
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-400">{clue.trim().length}/200</span>
              {submitError && <span className="text-xs text-red-600">{submitError}</span>}
            </div>
            <Button onClick={handleSubmit} disabled={!clue.trim() || isSubmitting} loading={isSubmitting} className="w-full">
              SUBMIT CLUE
            </Button>
          </div>
        ) : (
          <p className="text-center text-gray-500">
            {turnPlayer ? `Waiting on ${turnPlayer.nickname}...` : 'Waiting for other players...'}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

interface ChatMessage {
  id: string;
  player_id?: string;
  player_nickname: string;
  player_avatar: number;
  text: string;
  created_at: string;
}

function DiscussionScreen({ roomId, playerId, players, isHost, voteCalls }: {
  roomId: string; playerId: string; players: Player[]; isHost: boolean; voteCalls: Record<string, boolean>;
}) {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isSending, setIsSending] = useState(false);
  const [typingNames, setTypingNames] = useState<string[]>([]);
  const [sendError, setSendError] = useState<string | null>(null);
  const [isCallingVote, setIsCallingVote] = useState(false);
  const callCount = Object.keys(voteCalls || {}).length;
  const needed = Math.ceil(players.length / 2);
  const iCalled = !!(voteCalls || {})[playerId];
  const scrollRef = useRef<HTMLDivElement>(null);
  const typingTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastTypingSent = useRef(0);
  const supabase = createClient();
  const byId = new Map(players.map((p) => [p.id, p]));

  useEffect(() => {
    let cancelled = false;
    const fetchMessages = async () => {
      const { data } = await supabase
        .from('messages')
        .select('id, player_id, player_nickname, player_avatar, text, created_at')
        .eq('room_id', roomId)
        .order('created_at', { ascending: true })
        .limit(100);
      if (!cancelled) setMessages((data ?? []) as unknown as ChatMessage[]);
    };
    fetchMessages();

    const msgChannel = supabase
      .channel(`messages:${roomId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `room_id=eq.${roomId}` }, (payload) => {
        const row = payload.new as unknown as ChatMessage;
        setMessages((prev) => (prev.some((m) => m.id === row.id) ? prev : [...prev, row]));
      })
      .subscribe();

    const typingChannel = supabase.channel(`typing:${roomId}`, { config: { broadcast: { self: false } } });
    typingChannel
      .on('broadcast', { event: 'typing' }, (payload) => {
        const { playerId: typerId, nickname } = payload.payload as { playerId: string; nickname: string };
        if (typerId === playerId) return;
        setTypingNames((prev) => (prev.includes(nickname) ? prev : [...prev, nickname]));
        if (typingTimeout.current) clearTimeout(typingTimeout.current);
        typingTimeout.current = setTimeout(() => setTypingNames([]), 2500);
      })
      .subscribe();

    return () => {
      cancelled = true;
      if (typingTimeout.current) clearTimeout(typingTimeout.current);
      supabase.removeChannel(msgChannel);
      supabase.removeChannel(typingChannel);
    };
  }, [roomId, playerId, supabase]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  const broadcastTyping = () => {
    const now = Date.now();
    if (now - lastTypingSent.current < 2000) return;
    lastTypingSent.current = now;
    const me = byId.get(playerId);
    supabase.channel(`typing:${roomId}`).send({
      type: 'broadcast',
      event: 'typing',
      payload: { playerId, nickname: me?.nickname ?? 'Someone' },
    });
  };

  const send = async () => {
    const text = message.trim();
    if (!text || isSending) return;
    if (text.length > 280) {
      setSendError('Messages are limited to 280 characters.');
      return;
    }
    setIsSending(true);
    setSendError(null);
    setMessage('');
    try {
      const res = await fetch('/api/game/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomId, playerId, text }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to send');
    } catch (err) {
      setSendError(err instanceof Error ? err.message : 'Failed to send');
      setMessage(text);
    } finally {
      setIsSending(false);
    }
  };

  const callVote = async () => {
    if (isCallingVote || iCalled) return;
    setIsCallingVote(true);
    try {
      await fetch('/api/game/call-vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomId, playerId }),
      });
    } catch (err) {
      console.error('Call vote error:', err);
    } finally {
      setIsCallingVote(false);
    }
  };

  return (
    <Card className="card-elevated">
      <CardContent className="p-4 sm:p-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-display text-lg font-bold text-gray-900">Discussion</h3>
          <span className="text-xs text-gray-500">Make your case — then vote</span>
        </div>
        <div className="mb-3 p-3 bg-purple-50 rounded-xl border border-purple-200 flex flex-col sm:flex-row items-center gap-2 justify-between">
          <p className="text-sm text-purple-800">
            {isHost
              ? 'Host ho? Suspicion pak gaya toh vote shuru karo!'
              : callCount > 0
                ? `${callCount}/${needed} want to vote — shak badh raha hai!`
                : 'Shak ho raha hai? Vote call karo!'}
          </p>
          <Button size="sm" variant="secondary" onClick={callVote} disabled={isCallingVote || iCalled} loading={isCallingVote}>
            {iCalled ? `CALLED (${callCount}/${needed})` : isHost ? 'START VOTE NOW' : 'VOTE KARO!'}
          </Button>
        </div>
        <div ref={scrollRef} className="space-y-3 max-h-[50vh] min-h-[240px] overflow-y-auto mb-3 pr-1" role="log" aria-label="Discussion messages" aria-live="polite">
          {messages.length === 0 && (
            <p className="text-center text-gray-400 text-sm py-8">No messages yet. Who&apos;s acting suspicious?</p>
          )}
          {messages.map((msg) => {
            const mine = msg.player_id === playerId;
            return (
              <motion.div key={msg.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] rounded-2xl px-3 py-2 ${mine ? 'bg-orange-500 text-white rounded-br-md' : 'bg-gray-100 text-gray-900 rounded-bl-md'}`}>
                  {!mine && <p className="text-xs font-semibold opacity-70 mb-0.5">{msg.player_nickname}</p>}
                  <p className="text-sm break-words">{msg.text}</p>
                  {!mine && (
                    <ReactionBar roomId={roomId} playerId={playerId} targetType="message" targetId={msg.id} compact />
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
        <div className="h-5 mb-1" aria-live="polite">
          {typingNames.length > 0 && (
            <p className="text-xs text-gray-500 italic">{typingNames.join(', ')} {typingNames.length === 1 ? 'is' : 'are'} typing…</p>
          )}
        </div>
        <div className="flex gap-2 sticky bottom-0 bg-white pt-1">
          <input
            type="text"
            value={message}
            onChange={(e) => {
              setMessage(e.target.value);
              broadcastTyping();
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') send();
            }}
            placeholder="Who is suspicious and why?"
            maxLength={280}
            className="flex-1 p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            aria-label="Discussion message"
          />
          <Button onClick={send} disabled={!message.trim() || isSending} loading={isSending}>Send</Button>
        </div>
        {sendError && <p className="text-xs text-red-600 mt-1">{sendError}</p>}
      </CardContent>
    </Card>
  );
}

function VotingScreen({
  playerId, roomId, players, votes, revoteTargets,
}: {
  playerId: string; roomId: string; players: Player[]; votes: Record<string, string>; revoteTargets: string[];
}) {
  const [selected, setSelected] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [voteError, setVoteError] = useState<string | null>(null);
  const hasVoted = !!votes[playerId];
  const votesIn = Object.keys(votes).length;
  const isRevote = (revoteTargets || []).length > 0;
  const candidates = players.filter((p) => p.id !== playerId && (!isRevote || revoteTargets.includes(p.id)));
  const selectedPlayer = candidates.find((p) => p.id === selected);

  const submitVote = async () => {
    if (!selected || hasVoted || isSubmitting) return;
    setIsSubmitting(true);
    setVoteError(null);
    try {
      const res = await fetch('/api/game/vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomId, voterId: playerId, targetId: selected }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to submit vote');
      setConfirming(false);
    } catch (err) {
      setVoteError(err instanceof Error ? err.message : 'Failed to submit vote');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="card-elevated">
      <CardContent className="p-6 text-center">
        <h3 className="font-display text-2xl font-bold text-gray-900 mb-2">WHO IS THE IMPOSTER?</h3>
        {isRevote && (
          <div className="mb-3 p-3 bg-yellow-50 rounded-xl border border-yellow-300">
            <p className="font-bold text-yellow-800">DEADLOCK! Tie ho gaya.</p>
            <p className="text-sm text-yellow-700">Re-vote — sirf tied players eligible hain.</p>
          </div>
        )}
        <p className="text-gray-600 mb-1">Tap a player, then confirm. Votes are locked in.</p>
        <p className="text-sm text-gray-500 mb-6" aria-live="polite">{votesIn}/{players.length} votes in</p>
        <div className="grid grid-cols-2 gap-4">
          {candidates.map((p) => {
            const isMine = votes[playerId] === p.id;
            const isSelected = selected === p.id;
            return (
              <motion.button
                key={p.id}
                whileTap={hasVoted ? undefined : { scale: 0.96 }}
                onClick={() => {
                  if (hasVoted) return;
                  setSelected(p.id);
                  setConfirming(true);
                }}
                disabled={hasVoted}
                aria-label={`Vote for ${p.nickname}`}
                className={`p-4 rounded-xl border-2 transition-all ${
                  isMine
                    ? 'border-orange-500 bg-orange-50'
                    : isSelected
                      ? 'border-purple-400 bg-purple-50'
                      : 'border-gray-200 hover:border-orange-300'
                } ${hasVoted && !isMine ? 'opacity-60' : ''}`}
              >
                <Avatar avatarId={p.avatar_id} size="lg" nickname={p.nickname} />
                <p className="mt-2 font-medium text-gray-900">{p.nickname}</p>
                {isMine && <span className="text-sm text-orange-600 font-semibold">YOUR VOTE</span>}
              </motion.button>
            );
          })}
        </div>
        {voteError && <p className="mt-4 text-sm text-red-600">{voteError}</p>}
        {hasVoted && <p className="mt-6 text-gray-500">Vote locked. Waiting for other players...</p>}

        <Modal isOpen={confirming && !hasVoted} onClose={() => setConfirming(false)} title="Confirm your vote" size="sm">
          <p className="text-gray-600 mb-2">
            Vote for <span className="font-bold text-gray-900">{selectedPlayer?.nickname}</span> as the Imposter?
          </p>
          <p className="text-sm text-gray-500 mb-6">You cannot change your vote afterwards.</p>
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" onClick={() => setConfirming(false)} disabled={isSubmitting}>Back</Button>
            <Button className="flex-1" onClick={submitVote} loading={isSubmitting}>VOTE</Button>
          </div>
        </Modal>
      </CardContent>
    </Card>
  );
}

function useTypewriter(text: string, start: boolean, speedMs = 55): string {
  const [shown, setShown] = useState('');
  useEffect(() => {
    if (!start) return;
    let i = 0;
    const t = setInterval(() => {
      i += 1;
      setShown(text.slice(0, i));
      if (i >= text.length) clearInterval(t);
    }, speedMs);
    return () => clearInterval(t);
  }, [text, start, speedMs]);
  return shown;
}

function ResultScreen({ winner, imposters, players, playerId, roomId, myRole, round, votes, finalGuess, final }: {
  winner: string; imposters: Player[]; players: Player[]; playerId: string; roomId: string;
  myRole: string; round: number; votes: Record<string, string>;
  finalGuess: { by?: string; guess?: string; correct?: boolean }; final?: boolean;
}) {
  const civiliansWon = winner === 'civilians';
  const reduceMotion = useReducedMotion();
  const [stage, setStage] = useState(reduceMotion ? 3 : 0);
  const suspenseText = useTypewriter('THE IMPOSTER WAS...', stage === 0 && !reduceMotion);
  const [guess, setGuess] = useState('');
  const [isGuessing, setIsGuessing] = useState(false);
  const [guessError, setGuessError] = useState<string | null>(null);
  const nameOf = (id: string) => players.find((p) => p.id === id)?.nickname ?? 'Someone';
  const hasGuessed = finalGuess && Object.keys(finalGuess).length > 0;
  const iAmCaughtImposter = myRole === 'imposter' && civiliansWon && !hasGuessed;

  const submitGuess = async () => {
    if (!guess.trim() || isGuessing) return;
    setIsGuessing(true);
    setGuessError(null);
    try {
      const res = await fetch('/api/game/final-guess', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomId, playerId, guess: guess.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to submit guess');
    } catch (err) {
      setGuessError(err instanceof Error ? err.message : 'Failed to submit guess');
    } finally {
      setIsGuessing(false);
    }
  };

  useEffect(() => {
    if (reduceMotion) return;
    const timers = [
      setTimeout(() => setStage(1), 1400), // suspense pause
      setTimeout(() => setStage(2), 2300), // imposter flip
      setTimeout(() => setStage(3), 3400), // outcome banner
    ];
    return () => timers.forEach(clearTimeout);
  }, [reduceMotion]);

  const names = imposters.length > 0 ? imposters.map((p) => p.nickname).join(' & ') : '???';

  return (
    <div className="text-center" role="status" aria-live="polite">
      <AnimatePresence>{stage < 3 && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.55 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black z-10" aria-hidden="true" />}</AnimatePresence>

      <div className="relative z-20">
        {stage <= 1 && (
          <div className="py-16">
            <p className="font-display text-2xl sm:text-4xl font-bold tracking-widest text-white min-h-[3rem]">
              {suspenseText}
              <span className="animate-pulse">|</span>
            </p>
            {stage === 1 && <p className="text-white/60 mt-4 text-sm">...</p>}
          </div>
        )}

        {stage >= 2 && (
          <motion.div initial={{ rotateY: 90, opacity: 0 }} animate={{ rotateY: 0, opacity: 1 }} transition={{ duration: 0.6, ease: 'easeOut' }} style={{ transformStyle: 'preserve-3d' }}>
            <p className="text-sm font-semibold text-white/70 mb-3">THE IMPOSTER WAS</p>
            <div className="flex flex-wrap justify-center gap-4 mb-4">
              {imposters.length > 0 ? (
                imposters.map((p) => (
                  <div key={p.id} className="text-center">
                    <Avatar avatarId={p.avatar_id} size="2xl" nickname={p.nickname} role="imposter" />
                    <p className="mt-2 font-display text-2xl font-bold text-white">{p.nickname}</p>
                  </div>
                ))
              ) : (
                <p className="font-display text-2xl font-bold text-white">{names}</p>
              )}
            </div>
          </motion.div>
        )}

        {stage >= 3 && (
          <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: 'spring' as const, stiffness: 200, damping: 16 }}>
            <h2 className={`font-display text-4xl sm:text-5xl font-bold mb-2 ${civiliansWon ? 'text-green-400' : 'text-purple-400'}`}>
              {civiliansWon ? 'IMPOSTER CAUGHT!' : 'IMPOSTER ESCAPED!'}
            </h2>
            <p className="text-white/80">
              {civiliansWon ? 'Civilians take the round!' : 'The Imposter fooled everyone!'} (Round {round}
              {final ? ', final' : ''})
            </p>
          </motion.div>
        )}
      </div>

      {stage >= 3 && civiliansWon && !hasGuessed && <ConfettiBurst />}

      {stage >= 3 && (
        <div className="relative z-20 mt-6 max-w-md mx-auto">
          <div className="bg-white/10 backdrop-blur rounded-2xl p-4 text-left">
            <p className="text-xs font-bold tracking-widest text-white/60 mb-2">VOTE RESULT</p>
            {Object.keys(votes).length === 0 && <p className="text-white/70 text-sm">Koi vote nahi pada — imposter bach gaya!</p>}
            {Object.entries(
              Object.entries(votes).reduce<Record<string, string[]>>((acc, [voter, target]) => {
                (acc[target] = acc[target] || []).push(voter);
                return acc;
              }, {}),
            )
              .sort((a, b) => b[1].length - a[1].length)
              .map(([target, voters]) => (
                <p key={target} className="text-white text-sm">
                  <strong>{nameOf(target)}</strong> — {voters.length} vote{voters.length > 1 ? 's' : ''} ({voters.map(nameOf).join(', ')})
                </p>
              ))}
          </div>

          {iAmCaughtImposter && (
            <div className="mt-4 bg-purple-900/60 border border-purple-400/40 rounded-2xl p-4">
              <p className="font-display text-lg font-bold text-purple-200">ONE LAST CHANCE!</p>
              <p className="text-white/70 text-sm mb-3">Secret word guess karo — sahi hua toh round tumhara (+5)!</p>
              <div className="flex gap-2">
                <input
                  value={guess}
                  onChange={(e) => setGuess(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') submitGuess();
                  }}
                  placeholder="Secret word..."
                  maxLength={100}
                  className="flex-1 px-3 py-2 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-400"
                  aria-label="Final guess"
                />
                <Button variant="secondary" onClick={submitGuess} disabled={!guess.trim() || isGuessing} loading={isGuessing}>GUESS</Button>
              </div>
              {guessError && <p className="text-red-300 text-xs mt-1">{guessError}</p>}
            </div>
          )}

          {!iAmCaughtImposter && civiliansWon && !hasGuessed && (
            <p className="text-white/70 text-sm mt-4">Pakda gaya imposter guess kar raha hai... 🍿</p>
          )}

          {hasGuessed && (
            <div className={`mt-4 rounded-2xl p-4 font-display text-xl font-bold ${finalGuess.correct ? 'bg-purple-900/60 border border-purple-400/40 text-purple-200' : 'bg-green-900/60 border border-green-400/40 text-green-200'}`}>
              {finalGuess.correct ? 'IMPOSSIBLE! THE IMPOSTER STOLE THE ROUND! (+5)' : `BUSTED! "${finalGuess.guess}" galat hai. CREW WINS!`}
            </div>
          )}

          <p className="text-white/50 text-sm mt-4">{final ? 'Final scores next…' : 'Next round starting…'}</p>
        </div>
      )}
    </div>
  );
}
