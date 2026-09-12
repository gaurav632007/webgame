'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button, Card, CardContent, Avatar, GameHeader } from '@/components/ui';
import type { Player, Room } from '@/types/game';
import { useToastHelpers } from '@/components/ui/Toast';

const patternSvg = `data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fillRule='evenodd'%3E%3Cg fill='%23f97316' fillOpacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E`;

function LobbyContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { success, error } = useToastHelpers();
  const roomId = searchParams.get('room');
  const playerId = searchParams.get('player');

  const [room, setRoom] = useState<Room | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null);
  const [isHost, setIsHost] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [settings, setSettings] = useState({ maxPlayers: 8, mode: 'classic' as Room['mode'], difficulty: 'medium' as Room['difficulty'], rounds: 3 });

  const supabase = createClient();

  const fetchRoomData = useCallback(async () => {
    if (!roomId) return;
    try {
      const { data } = await supabase.from('rooms').select('*').eq('id', roomId).single();
      const roomData = data as unknown as Room | null;
      if (roomData) {
        setRoom(roomData);
        setSettings({ maxPlayers: roomData.max_players, mode: roomData.mode, difficulty: roomData.difficulty, rounds: roomData.rounds });
      }
      const { data: playersData } = await supabase.from('players').select('*').eq('room_id', roomId).order('joined_at', { ascending: true });
      const list = (playersData ?? []) as unknown as Player[];
      setPlayers(list);
      const me = list.find((p) => p.id === playerId);
      if (me) {
        setCurrentPlayer(me);
        setIsHost(me.is_host);
      }
    } catch (err) {
      console.error('Fetch room error:', err);
    }
  }, [roomId, playerId, supabase]);

  useEffect(() => {
    // Initial fetch on mount + realtime subscription below; cascading render is intended here.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchRoomData();
    if (!roomId) return;
    const playersChannel = supabase
      .channel(`players:${roomId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'players', filter: `room_id=eq.${roomId}` }, () => fetchRoomData())
      .subscribe();
    const roomChannel = supabase
      .channel(`room:${roomId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'rooms', filter: `id=eq.${roomId}` }, (payload) => {
        const next = payload.new as unknown as Room;
        if (next) {
          setRoom(next);
          setSettings({ maxPlayers: next.max_players, mode: next.mode, difficulty: next.difficulty, rounds: next.rounds });
        }
      })
      .subscribe();
    return () => {
      supabase.removeChannel(playersChannel);
      supabase.removeChannel(roomChannel);
    };
  }, [roomId, fetchRoomData, supabase]);

  const copyRoomCode = async () => {
    if (room?.code) {
      await navigator.clipboard.writeText(room.code);
      success('Copied!', `Room code ${room.code} copied to clipboard`);
    }
  };

  const shareRoom = async () => {
    if (!room?.code) return;
    const url = `${window.location.origin}/join/${room.code}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: 'Guess The Imposter', text: `Join my game! Room code: ${room.code}`, url });
      } catch { /* dismissed */ }
    } else {
      await navigator.clipboard.writeText(url);
      success('Link copied!', 'Share this link with friends');
    }
  };

  const kickPlayer = async (targetId: string) => {
    if (!isHost || !currentPlayer || targetId === currentPlayer.id) return;
    try {
      await supabase.from('players').delete().eq('id', targetId);
      success('Player removed', 'They have been kicked from the room');
    } catch {
      error('Failed to kick', 'Please try again');
    }
  };

  const startGame = async () => {
    if (!isHost || !roomId) return;
    if (players.length < 4) {
      error('Not enough players', 'Need at least 4 players to start');
      return;
    }
    setIsStarting(true);
    try {
      const response = await fetch('/api/game/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomId }),
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to start game');
      }
      router.push(`/play?room=${roomId}&player=${playerId}`);
    } catch (err) {
      error('Failed to start', err instanceof Error ? err.message : 'Please try again');
    } finally {
      setIsStarting(false);
    }
  };

  const updateSettings = async (next: typeof settings) => {
    if (!isHost || !roomId) return;
    try {
      await supabase.from('rooms').update(next).eq('id', roomId);
      setSettings(next);
      setShowSettings(false);
      success('Settings updated', 'Game settings have been changed');
    } catch {
      error('Failed to update', 'Please try again');
    }
  };

  if (!room) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-pink-50 to-purple-50">
        <motion.div className="text-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="animate-spin w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-gray-600">Loading room...</p>
        </motion.div>
      </div>
    );
  }

  const connectedPlayers = players.filter((p) => p.is_connected);
  const canStart = isHost && connectedPlayers.length >= 4;

  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="absolute inset-0" style={{ backgroundImage: `url(${patternSvg})` }} />
      <GameHeader roomCode={room.code} phase="lobby" onCopyCode={copyRoomCode} onLeave={() => router.push('/')} />
      <main className="relative px-4 py-6 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <h2 className="font-display text-2xl font-bold text-gray-900">Players ({connectedPlayers.length}/{room.max_players})</h2>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={copyRoomCode}>Copy Code</Button>
                <Button variant="outline" size="sm" onClick={shareRoom}>Share</Button>
                {isHost && <Button variant="secondary" size="sm" onClick={() => setShowSettings(true)}>Settings</Button>}
              </div>
            </div>
          </div>
          <Card className="card-elevated">
            <CardContent className="p-4 sm:p-6">
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {connectedPlayers.map((player, index) => (
                  <motion.div key={player.id} initial={{ opacity: 0, scale: 0.8, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ delay: index * 0.1, type: 'spring' as const, stiffness: 100, damping: 15 }} className="relative">
                    <div className="text-center group">
                      <div className="relative mx-auto mb-3 w-fit">
                        <Avatar avatarId={player.avatar_id} size="xl" nickname={player.nickname} isHost={player.is_host} showStatus isConnected={player.is_connected} />
                        {isHost && player.id !== currentPlayer?.id && (
                          <button onClick={() => kickPlayer(player.id)} className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600" aria-label={`Kick ${player.nickname}`}>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                          </button>
                        )}
                      </div>
                      <div className="flex flex-col items-center gap-1">
                        <span className="font-semibold text-gray-900 truncate max-w-[100px]">{player.nickname}{player.is_host && <span className="ml-1">H</span>}</span>
                        <span className="text-xs text-gray-500">{player.id === currentPlayer?.id ? '(You)' : ''}</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
                {connectedPlayers.length < room.max_players && (
                  <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="col-span-1 flex flex-col items-center justify-center h-32 border-2 border-dashed border-gray-200 rounded-xl text-gray-400">
                    <div className="text-4xl mb-2" aria-hidden="true">+</div>
                    <span className="text-sm font-medium">Waiting for players...</span>
                  </motion.div>
                )}
              </div>
            </CardContent>
          </Card>
          {isHost ? (
            <div className="mt-6 flex justify-center">
              <Button size="xl" className="w-full sm:w-auto min-w-[280px]" onClick={startGame} disabled={!canStart || isStarting} loading={isStarting}>START GAME</Button>
            </div>
          ) : (
            <div className="mt-6 text-center text-gray-500"><p>Waiting for host to start the game...</p></div>
          )}
          <AnimatePresence>
            {showSettings && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setShowSettings(false)}>
                <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                  <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                    <h3 className="font-display text-xl font-bold text-gray-900">Game Settings</h3>
                    <button onClick={() => setShowSettings(false)} className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100" aria-label="Close settings">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                  </div>
                  <div className="p-6 space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Players</label>
                      <select value={settings.maxPlayers} onChange={(e) => setSettings({ ...settings, maxPlayers: Number(e.target.value) })} className="input-field">
                        {[4, 5, 6, 7, 8, 9, 10, 11, 12].map((n) => (<option key={n} value={n}>{n} Players</option>))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Rounds</label>
                      <select value={settings.rounds} onChange={(e) => setSettings({ ...settings, rounds: Number(e.target.value) })} className="input-field">
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (<option key={n} value={n}>{n} Round{n > 1 ? 's' : ''}</option>))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Game Mode</label>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {(['classic', 'desi-life', 'hardcore', 'chaos', 'image-clue', 'friends-custom'] as const).map((mode) => (
                          <button key={mode} type="button" onClick={() => setSettings({ ...settings, mode })}
                            className={`p-3 rounded-xl border-2 text-center transition-all duration-200 ${settings.mode === mode ? 'border-orange-500 bg-orange-50' : 'border-gray-200 hover:border-orange-300'}`}>
                            <div className="text-xs font-medium text-gray-700 capitalize">{mode.replace('-', ' ')}</div>
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Difficulty</label>
                      <div className="grid grid-cols-4 gap-2">
                        {(['easy', 'medium', 'hard', 'expert'] as const).map((diff) => (
                          <button key={diff} type="button" onClick={() => setSettings({ ...settings, difficulty: diff })}
                            className={`px-3 py-2 rounded-xl border-2 text-center text-sm font-medium transition-all duration-200 ${settings.difficulty === diff ? 'border-orange-500 bg-orange-50 text-orange-700' : 'border-gray-200 hover:border-gray-300 text-gray-700'}`}>
                            {diff.charAt(0).toUpperCase() + diff.slice(1)}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="flex gap-3 pt-4">
                      <Button variant="outline" className="flex-1" onClick={() => setShowSettings(false)}>Cancel</Button>
                      <Button className="flex-1" onClick={() => updateSettings(settings)}>Save Settings</Button>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}

export default function LobbyPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><p className="text-gray-600">Loading room...</p></div>}>
      <LobbyContent />
    </Suspense>
  );
}
