'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { Button, Input, Card, CardContent, AvatarPicker } from '@/components/ui';
import { useToastHelpers } from '@/components/ui/Toast';

const patternSvg = `data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fillRule='evenodd'%3E%3Cg fill='%23f97316' fillOpacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E`;

type RoomStatus = 'loading' | 'open' | 'not-found' | 'started' | 'error';

function normalizeCode(raw: string): string {
  return raw.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6);
}

export default function JoinRoomPage() {
  const router = useRouter();
  const params = useParams();
  const rawCode = params.code;
  const code = normalizeCode((Array.isArray(rawCode) ? rawCode[0] : rawCode) ?? '');
  const { success, error } = useToastHelpers();

  const [nickname, setNickname] = useState('');
  const [avatarId, setAvatarId] = useState(1);
  const [isJoining, setIsJoining] = useState(false);
  const [status, setStatus] = useState<RoomStatus>(() => (code.length === 6 ? 'loading' : 'not-found'));
  const [roomInfo, setRoomInfo] = useState<{ players: number; maxPlayers: number; mode: string; difficulty: string } | null>(null);

  useEffect(() => {
    if (code.length !== 6) return;
    let cancelled = false;
    const fetchRoomInfo = async () => {
      try {
        const response = await fetch(`/api/rooms/${code}`);
        if (cancelled) return;
        if (!response.ok) {
          setStatus('not-found');
          return;
        }
        const data = await response.json();
        if (cancelled) return;
        if (data.room?.status && data.room.status !== 'waiting') {
          setStatus('started');
          return;
        }
        setRoomInfo({
          players: data.players?.length || 0,
          maxPlayers: data.room?.max_players || 8,
          mode: data.room?.mode || 'classic',
          difficulty: data.room?.difficulty || 'medium',
        });
        setStatus('open');
      } catch {
        if (!cancelled) setStatus('error');
      }
    };
    fetchRoomInfo();
    return () => {
      cancelled = true;
    };
  }, [code]);

  const nicknameError =
    nickname.length > 0 && nickname.trim().length === 0
      ? 'Nickname cannot be blank spaces'
      : nickname.trim().length > 30
        ? 'Nickname must be 30 characters or fewer'
        : null;

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
        body: JSON.stringify({ code, nickname: nickname.trim(), avatarId }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to join room');
      success('Joined room!', `Welcome to the game, ${nickname.trim()}!`);
      router.push(`/lobby?room=${data.roomId}&player=${data.playerId}`);
    } catch (err) {
      error('Failed to join room', err instanceof Error ? err.message : 'Please try again');
    } finally {
      setIsJoining(false);
    }
  };

  const roomLink = typeof window !== 'undefined' ? `${window.location.origin}/join/${code}` : `/join/${code}`;
  const shareText = `Join my Guess The Imposter game! Room code: ${code}`;

  if (status === 'not-found' || status === 'started') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-orange-50 via-pink-50 to-purple-50">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center max-w-md">
          <h1 className="font-display text-3xl font-bold text-gray-900 mb-2">
            {status === 'started' ? 'Game Already Started' : 'Room Not Found'}
          </h1>
          <p className="text-gray-600 mb-6">
            {status === 'started'
              ? `Room "${code}" already started playing. Ask the host for the next game.`
              : `The room code "${code}" doesn't look right. Check the code and try again.`}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button onClick={() => router.push('/create')} size="lg">CREATE NEW ROOM</Button>
            <Button variant="outline" onClick={() => router.push('/')} size="lg">HOME</Button>
          </div>
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

          {status === 'loading' && (
            <Card className="card-elevated mb-6">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="animate-spin w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full" aria-hidden="true" />
                <p className="text-gray-600">Checking room {code}...</p>
              </CardContent>
            </Card>
          )}

          {status === 'error' && (
            <Card className="card-elevated mb-6">
              <CardContent className="p-4">
                <p className="text-red-600 text-sm">Couldn&apos;t reach the server. Check your connection and <button className="underline font-medium" onClick={() => window.location.reload()}>try again</button>.</p>
              </CardContent>
            </Card>
          )}

          {status === 'open' && roomInfo && (
            <Card className="card-elevated mb-6">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="font-semibold text-gray-900">Room {code}</p>
                    <p className="text-sm text-gray-500 capitalize">{roomInfo.mode.replace('-', ' ')} · {roomInfo.difficulty}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900">{roomInfo.players}/{roomInfo.maxPlayers}</p>
                    <p className="text-xs text-gray-500">Players</p>
                  </div>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden mb-4">
                  <motion.div className="h-full bg-gradient-to-r from-orange-400 to-pink-500" initial={{ width: 0 }} animate={{ width: `${(roomInfo.players / roomInfo.maxPlayers) * 100}%` }} transition={{ duration: 0.5 }} />
                </div>
                <div className="flex gap-2">
                  <a
                    href={`https://wa.me/?text=${encodeURIComponent(`${shareText} ${roomLink}`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 text-center px-3 py-2 text-sm font-medium text-green-700 bg-green-50 rounded-xl hover:bg-green-100 transition-colors"
                  >
                    WhatsApp
                  </a>
                  <a
                    href={`https://t.me/share/url?url=${encodeURIComponent(roomLink)}&text=${encodeURIComponent(shareText)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 text-center px-3 py-2 text-sm font-medium text-sky-700 bg-sky-50 rounded-xl hover:bg-sky-100 transition-colors"
                  >
                    Telegram
                  </a>
                  <button
                    onClick={async () => {
                      await navigator.clipboard.writeText(roomLink);
                      success('Link copied!', 'Share this link with friends');
                    }}
                    className="flex-1 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
                  >
                    Copy link
                  </button>
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
                <Input label="Your Nickname" value={nickname} onChange={(e) => setNickname(e.target.value)} placeholder="Enter your name" maxLength={30} autoFocus required disabled={isFull} error={nicknameError ?? undefined} helperText={`${nickname.trim().length}/30`} />
                {isFull && <p className="text-sm text-red-600 text-center">This room is full</p>}
                <Button type="submit" className="w-full" size="lg" loading={isJoining} disabled={isFull || status !== 'open'}>JOIN ROOM</Button>
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
