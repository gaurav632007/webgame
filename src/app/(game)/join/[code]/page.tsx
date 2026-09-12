'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { Button, Input, Card, CardContent, AvatarPicker } from '@/components/ui';
import { useToastHelpers } from '@/components/ui/Toast';

const patternSvg = `data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fillRule='evenodd'%3E%3Cg fill='%23f97316' fillOpacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E`;

export default function JoinRoomPage() {
  const router = useRouter();
  const params = useParams();
  const rawCode = params.code;
  const code = (Array.isArray(rawCode) ? rawCode[0] : rawCode) as string;
  const { success, error } = useToastHelpers();

  const [nickname, setNickname] = useState('');
  const [avatarId, setAvatarId] = useState(1);
  const [isJoining, setIsJoining] = useState(false);
  const [roomInfo, setRoomInfo] = useState<{ name: string; players: number; maxPlayers: number; mode: string; difficulty: string } | null>(null);
  const [roomNotFound, setRoomNotFound] = useState(false);

  useEffect(() => {
    if (!code) return;
    const fetchRoomInfo = async (roomCode: string) => {
      try {
        const response = await fetch(`/api/rooms/${roomCode}`);
        if (response.ok) {
          const data = await response.json();
          setRoomInfo({
            name: `Room ${roomCode}`,
            players: data.players?.length || 0,
            maxPlayers: data.room?.max_players || 8,
            mode: data.room?.mode || 'classic',
            difficulty: data.room?.difficulty || 'medium',
          });
        } else {
          setRoomNotFound(true);
        }
      } catch {
        setRoomNotFound(true);
      }
    };
    fetchRoomInfo(code.toUpperCase());
  }, [code]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nickname.trim()) {
      error('Nickname required', 'Please enter a nickname to continue');
      return;
    }
    if (roomInfo && roomInfo.players >= roomInfo.maxPlayers) {
      error('Room full', 'This room has reached the maximum number of players');
      return;
    }
    setIsJoining(true);
    try {
      const response = await fetch('/api/rooms/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: code.toUpperCase(), nickname: nickname.trim(), avatarId }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to join room');
      success('Joined room!', `Welcome to the game, ${nickname}!`);
      router.push(`/lobby?room=${data.roomId}&player=${data.playerId}`);
    } catch (err) {
      error('Failed to join room', err instanceof Error ? err.message : 'Please try again');
    } finally {
      setIsJoining(false);
    }
  };

  if (roomNotFound) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-orange-50 via-pink-50 to-purple-50">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center max-w-md">
          <div className="text-6xl mb-4" aria-hidden="true">🚫</div>
          <h1 className="font-display text-3xl font-bold text-gray-900 mb-2">Room Not Found</h1>
          <p className="text-gray-600 mb-6">The room code &quot;{code.toUpperCase()}&quot; doesn&apos;t exist or the game has already started.</p>
          <Button onClick={() => router.push('/create')} size="lg">CREATE NEW ROOM</Button>
        </motion.div>
      </div>
    );
  }

  const isFull = roomInfo ? roomInfo.players >= roomInfo.maxPlayers : false;

  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="absolute inset-0" style={{ backgroundImage: `url(${patternSvg})` }} />
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
          <div className="text-center mb-8">
            <Link href="/" className="inline-flex items-center gap-2 mb-6">
              <span className="text-3xl" aria-hidden="true">🎭</span>
              <span className="font-display font-bold text-3xl bg-gradient-to-r from-orange-600 to-pink-600 bg-clip-text text-transparent">Guess The Imposter</span>
            </Link>
            <h1 className="font-display text-3xl font-bold text-gray-900 mb-2">Join Room</h1>
            <p className="text-gray-600">Enter your details to join the game</p>
          </div>
          {roomInfo && (
            <Card className="card-elevated mb-6">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-400 to-pink-500 flex items-center justify-center text-white font-bold text-xl">G</div>
                    <div>
                      <p className="font-semibold text-gray-900">Room {code.toUpperCase()}</p>
                      <p className="text-sm text-gray-500">{roomInfo.mode} - {roomInfo.difficulty}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900">{roomInfo.players}/{roomInfo.maxPlayers}</p>
                    <p className="text-xs text-gray-500">Players</p>
                  </div>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                  <motion.div className="h-full bg-gradient-to-r from-orange-400 to-pink-500" initial={{ width: 0 }} animate={{ width: `${(roomInfo.players / roomInfo.maxPlayers) * 100}%` }} transition={{ duration: 0.5 }} />
                </div>
              </CardContent>
            </Card>
          )}
          <Card className="card-elevated">
            <CardContent className="p-6 sm:p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Choose Your Avatar</label>
                  <AvatarPicker selectedId={avatarId} onSelect={setAvatarId} size="lg" />
                </div>
                <Input label="Your Nickname" value={nickname} onChange={(e) => setNickname(e.target.value)} placeholder="Enter your name" maxLength={30} autoFocus required disabled={isFull} />
                {isFull && <p className="text-sm text-red-600 text-center">This room is full</p>}
                <Button type="submit" className="w-full" size="lg" loading={isJoining} disabled={isFull}>JOIN ROOM</Button>
              </form>
            </CardContent>
          </Card>
          <div className="mt-6 text-center">
            <Button variant="ghost" onClick={() => router.push('/create')}>CREATE A NEW ROOM INSTEAD</Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
