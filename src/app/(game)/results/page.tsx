'use client';

import { motion } from 'framer-motion';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { Button, Card, CardContent, Avatar, RoleBadge } from '@/components/ui';
import { useToastHelpers } from '@/components/ui/Toast';

const patternSvg = `data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fillRule='evenodd'%3E%3Cg fill='%23f97316' fillOpacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E`;

type MockRole = 'civilian' | 'imposter';

function ResultsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { success } = useToastHelpers();
  const roomId = searchParams.get('room');
  const playerId = searchParams.get('player');

  const mockData: { winner: 'civilians' | 'imposter'; players: Array<{ id: string; nickname: string; avatar_id: number; role: MockRole }>; secret: string } = {
    winner: 'civilians',
    players: [
      { id: 'player-1', nickname: 'Gaurav', avatar_id: 1, role: 'civilian' },
      { id: 'player-2', nickname: 'Rahul', avatar_id: 3, role: 'imposter' },
      { id: 'player-3', nickname: 'Priya', avatar_id: 2, role: 'civilian' },
      { id: 'player-4', nickname: 'Arjun', avatar_id: 5, role: 'civilian' },
    ],
    secret: 'CRICKET',
  };

  const copyShareLink = async () => {
    const url = `${window.location.origin}/join/GTI123`;
    await navigator.clipboard.writeText(url);
    success('Copied!', 'Share link copied to clipboard');
  };

  const shareResult = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Guess The Imposter Result',
          text: `I ${mockData.winner === 'civilians' ? 'caught' : 'was'} the Imposter! Can you do better?`,
          url: window.location.href,
        });
      } catch { /* dismissed */ }
    } else {
      copyShareLink();
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="absolute inset-0" style={{ backgroundImage: `url(${patternSvg})` }} />
      <main className="relative px-4 py-6 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center mb-8">
            <h1 className="font-display text-4xl font-bold text-gray-900 mb-2">{mockData.winner === 'civilians' ? 'IMPOSTER CAUGHT!' : 'IMPOSTER ESCAPED!'}</h1>
            <p className="text-gray-600 text-lg">{mockData.winner === 'civilians' ? 'Civilians win!' : 'Imposter wins!'}</p>
          </motion.div>
          <Card className="card-elevated mb-6">
            <CardContent className="p-6">
              <div className="mb-6 p-4 bg-gradient-to-r from-orange-500 to-pink-500 rounded-xl text-white text-center">
                <p className="text-sm font-medium opacity-90 mb-1">THE SECRET WAS</p>
                <p className="font-display text-3xl font-bold tracking-wider">{mockData.secret}</p>
              </div>
              <h3 className="font-display text-xl font-bold text-gray-900 mb-4 text-center">THE IMPOSTER WAS...</h3>
              <div className="flex flex-wrap justify-center gap-4 mb-6">
                {mockData.players.map((player) => (
                  <motion.div key={player.id} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
                    <Avatar avatarId={player.avatar_id} size="xl" nickname={player.nickname} role={player.role} />
                    <p className="mt-2 font-medium text-gray-900">{player.nickname}</p>
                    <RoleBadge role={player.role} />
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
          <div className="space-y-3">
            <Button size="lg" className="w-full" onClick={() => router.push(`/lobby?room=${roomId}&player=${playerId}`)}>PLAY AGAIN</Button>
            <Button size="lg" variant="outline" className="w-full" onClick={() => router.push('/')}>NEW ROOM</Button>
            <Button size="lg" variant="secondary" className="w-full" onClick={shareResult}>SHARE RESULT</Button>
            <Button size="lg" variant="ghost" className="w-full" onClick={copyShareLink}>COPY LINK</Button>
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
