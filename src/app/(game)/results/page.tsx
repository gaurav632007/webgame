'use client';

import { motion } from 'framer-motion';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useCallback, useEffect, useState } from 'react';
import { Button, Card, CardContent, Avatar, RoleBadge } from '@/components/ui';
import { useToastHelpers } from '@/components/ui/Toast';
import { downloadBlob, drawResultCard } from '@/lib/share';

const patternSvg = `data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fillRule='evenodd'%3E%3Cg fill='%23f97316' fillOpacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E`;

interface ResultPlayer {
  id: string;
  nickname: string;
  avatar_id: number;
  role: string;
  is_host: boolean;
}

interface ResultData {
  secret: string | null;
  winner: string | null;
  phase: string;
  round: number;
  rounds: number;
  mode: string;
  difficulty: string;
  roomCode: string;
  imposters: ResultPlayer[];
  civilians: ResultPlayer[];
}

function ResultsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { success, error } = useToastHelpers();
  const roomId = searchParams.get('room');
  const playerId = searchParams.get('player');

  const [data, setData] = useState<ResultData | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isRematching, setIsRematching] = useState(false);
  const [isSharing, setIsSharing] = useState(false);

  const fetchResult = useCallback(async () => {
    if (!roomId || !playerId) {
      router.push('/');
      return;
    }
    try {
      const res = await fetch('/api/game/result', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomId, playerId }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error || 'Failed to load results');
      setData(body as ResultData);
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : 'Failed to load results');
    }
  }, [roomId, playerId, router]);

  useEffect(() => {
    // Initial fetch on mount; cascading render is intended here.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchResult();
  }, [fetchResult]);

  const isHost = data ? [...data.imposters, ...data.civilians].some((p) => p.id === playerId && p.is_host) : false;

  const rematch = async () => {
    if (!roomId || !playerId) return;
    setIsRematching(true);
    try {
      const res = await fetch('/api/game/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomId, hostPlayerId: playerId }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error || 'Failed to start rematch');
      router.push(`/play?room=${roomId}&player=${playerId}`);
    } catch (err) {
      error('Rematch failed', err instanceof Error ? err.message : 'Please try again');
    } finally {
      setIsRematching(false);
    }
  };

  const shareCard = async () => {
    if (!data) return;
    setIsSharing(true);
    try {
      const blob = await drawResultCard({
        winner: data.winner ?? 'imposter',
        secret: data.secret,
        imposters: data.imposters,
        playerCount: data.imposters.length + data.civilians.length,
        roomCode: data.roomCode,
      });
      const file = new File([blob], 'guess-the-imposter-result.png', { type: 'image/png' });
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: 'Guess The Imposter result',
          text: `I ${data.winner === 'civilians' ? 'caught' : 'was'} the Imposter! Can you do better?`,
        });
      } else if (navigator.share) {
        await navigator.share({
          title: 'Guess The Imposter result',
          text: `I ${data.winner === 'civilians' ? 'caught' : 'was'} the Imposter in "${data.secret}"! Can you do better? Play free: ${window.location.origin}`,
          url: window.location.origin,
        });
      } else {
        downloadBlob(blob, 'guess-the-imposter-result.png');
        success('Card downloaded!', 'Share the image with your friends');
      }
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') return;
      error('Share failed', err instanceof Error ? err.message : 'Please try again');
    } finally {
      setIsSharing(false);
    }
  };

  if (loadError) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-orange-50 via-pink-50 to-purple-50">
        <div className="text-center max-w-md">
          <h1 className="font-display text-3xl font-bold text-gray-900 mb-2">Results not ready</h1>
          <p className="text-gray-600 mb-6">{loadError}</p>
          <Button onClick={() => router.push('/')}>HOME</Button>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-pink-50 to-purple-50">
        <motion.div className="text-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="animate-spin w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-gray-600">Tallying the results...</p>
        </motion.div>
      </div>
    );
  }

  const civiliansWon = data.winner === 'civilians';

  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="absolute inset-0" style={{ backgroundImage: `url(${patternSvg})` }} />
      <main className="relative px-4 py-6 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center mb-8">
            <h1 className="font-display text-4xl font-bold text-gray-900 mb-2">
              {civiliansWon ? 'IMPOSTER CAUGHT!' : 'IMPOSTER ESCAPED!'}
            </h1>
            <p className="text-gray-600 text-lg capitalize">
              {data.mode.replace('-', ' ')} · {data.difficulty} · Round {data.round}/{data.rounds}
            </p>
          </motion.div>

          <Card className="card-elevated mb-6">
            <CardContent className="p-6">
              <div className="mb-6 p-4 bg-gradient-to-r from-orange-500 to-pink-500 rounded-xl text-white text-center">
                <p className="text-sm font-medium opacity-90 mb-1">THE SECRET WAS</p>
                <p className="font-display text-3xl font-bold tracking-wider">{data.secret ?? '???'}</p>
              </div>
              <h3 className="font-display text-xl font-bold text-gray-900 mb-4 text-center">THE IMPOSTER {data.imposters.length > 1 ? 'WERE' : 'WAS'}...</h3>
              <div className="flex flex-wrap justify-center gap-4 mb-2">
                {data.imposters.map((player, i) => (
                  <motion.div key={player.id} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 * i }} className="text-center">
                    <Avatar avatarId={player.avatar_id} size="xl" nickname={player.nickname} role="imposter" />
                    <p className="mt-2 font-medium text-gray-900">{player.nickname}</p>
                    <RoleBadge role="imposter" />
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="card-elevated mb-6">
            <CardContent className="p-6">
              <h3 className="font-display text-xl font-bold text-gray-900 mb-4 text-center">CIVILIANS</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {data.civilians.map((player) => (
                  <div key={player.id} className="text-center p-3 bg-gray-50 rounded-xl">
                    <Avatar avatarId={player.avatar_id} size="md" nickname={player.nickname} />
                    <p className="mt-1 font-medium text-gray-900 text-sm truncate">{player.nickname}</p>
                    <RoleBadge role="civilian" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="space-y-3">
            {isHost ? (
              <Button size="lg" className="w-full" onClick={rematch} loading={isRematching}>REMATCH</Button>
            ) : (
              <Button size="lg" className="w-full" onClick={() => router.push(`/lobby?room=${roomId}&player=${playerId}`)}>BACK TO LOBBY</Button>
            )}
            <Button size="lg" variant="secondary" className="w-full" onClick={shareCard} loading={isSharing}>SHARE RESULT CARD</Button>
            <Button size="lg" variant="outline" className="w-full" onClick={() => router.push('/')}>NEW ROOM</Button>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function ResultsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><p className="text-gray-600">Loading results...</p></div>}>
      <ResultsContent />
    </Suspense>
  );
}
