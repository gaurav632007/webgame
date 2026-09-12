'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button, Input, Card, CardContent, AvatarPicker } from '@/components/ui';
import { GAME_MODES, DIFFICULTIES, DEFAULT_ROOM_SETTINGS, categoryIcon, prettyCategory } from '@/types/game';
import { useToastHelpers } from '@/components/ui/Toast';

interface DatasetInfo {
  category: string;
  count: number;
  examples: string[];
}

const patternSvg = `data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fillRule='evenodd'%3E%3Cg fill='%23f97316' fillOpacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E`;

export default function CreateRoomPage() {
  const router = useRouter();
  const { success, error } = useToastHelpers();
  const [nickname, setNickname] = useState('');
  const [avatarId, setAvatarId] = useState(1);
  const [settings, setSettings] = useState(DEFAULT_ROOM_SETTINGS);
  const [isCreating, setIsCreating] = useState(false);
  const [datasets, setDatasets] = useState<DatasetInfo[]>([]);

  useEffect(() => {
    fetch('/api/topics/datasets')
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d?.datasets) setDatasets(d.datasets as DatasetInfo[]);
      })
      .catch(() => {});
  }, []);

  const toggleDataset = (category: string) => {
    setSettings((s) => ({
      ...s,
      datasets: s.datasets.includes(category) ? s.datasets.filter((c) => c !== category) : [...s.datasets, category],
    }));
  };

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
    if (nickname.trim().length > 30) {
      error('Nickname too long', 'Keep it to 30 characters or fewer');
      return;
    }
    setIsCreating(true);
    try {
      const response = await fetch('/api/rooms/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nickname: nickname.trim(),
          maxPlayers: settings.maxPlayers,
          mode: settings.mode,
          difficulty: settings.difficulty,
          rounds: settings.rounds,
          datasets: settings.datasets,
          avatarId,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to create room');
      success('Room created!', `Your room code is ${data.code}`);
      router.push(`/lobby?room=${data.roomId}&player=${data.playerId}`);
    } catch (err) {
      error('Failed to create room', err instanceof Error ? err.message : 'Please try again');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="absolute inset-0" style={{ backgroundImage: `url(${patternSvg})` }} />
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
          <div className="text-center mb-8">
            <Link href="/" className="inline-flex items-center gap-2 mb-6">
              <span className="text-3xl" aria-hidden="true">🎭</span>
              <span className="font-display font-bold text-3xl bg-gradient-to-r from-orange-600 to-pink-600 bg-clip-text text-transparent">
                Guess The Imposter
              </span>
            </Link>
            <h1 className="font-display text-3xl font-bold text-gray-900 mb-2">Create Room</h1>
            <p className="text-gray-600">Set up your game and invite friends</p>
          </div>
          <Card className="card-elevated">
            <CardContent className="p-6 sm:p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Choose Your Avatar</label>
                  <AvatarPicker selectedId={avatarId} onSelect={setAvatarId} size="lg" />
                </div>
                <Input label="Your Nickname" value={nickname} onChange={(e) => setNickname(e.target.value)} placeholder="Enter your name" maxLength={30} autoFocus required error={nicknameError ?? undefined} helperText={`${nickname.trim().length}/30`} />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Players</label>
                    <select value={settings.maxPlayers} onChange={(e) => setSettings({ ...settings, maxPlayers: Number(e.target.value) })} className="input-field">
                      {[4, 5, 6, 7, 8, 9, 10, 11, 12].map((n) => (
                        <option key={n} value={n}>{n} Players</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Rounds</label>
                    <select value={settings.rounds} onChange={(e) => setSettings({ ...settings, rounds: Number(e.target.value) })} className="input-field">
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                        <option key={n} value={n}>{n} Round{n > 1 ? 's' : ''}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Game Mode</label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {GAME_MODES.map((mode) => (
                      <button key={mode.value} type="button" disabled={!mode.playable} title={mode.playable ? mode.description : `${mode.label} is coming soon`}
                        onClick={() => setSettings({ ...settings, mode: mode.value })}
                        className={`p-3 rounded-xl border-2 text-center transition-all duration-200 relative ${settings.mode === mode.value ? 'border-orange-500 bg-orange-50' : 'border-gray-200 hover:border-orange-300'} ${mode.playable ? '' : 'opacity-50 cursor-not-allowed'}`}>
                        <div className="text-2xl mb-1">{mode.icon}</div>
                        <div className="text-xs font-medium text-gray-700">{mode.label}</div>
                        {!mode.playable && (
                          <span className="absolute top-1 right-1 text-[10px] font-bold text-purple-600 bg-purple-100 rounded-full px-1.5 py-0.5">SOON</span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Difficulty</label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {DIFFICULTIES.map((diff) => (
                      <button key={diff.value} type="button" onClick={() => setSettings({ ...settings, difficulty: diff.value })}
                        className={`px-3 py-2 rounded-xl border-2 text-center text-sm font-medium transition-all duration-200 ${settings.difficulty === diff.value ? 'border-orange-500 bg-orange-50 text-orange-700' : 'border-gray-200 hover:border-gray-300 text-gray-700'}`}>
                        {diff.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-700">Word Packs (datasets)</label>
                    {settings.datasets.length > 0 && (
                      <button type="button" onClick={() => setSettings({ ...settings, datasets: [] })} className="text-xs font-medium text-orange-600 hover:underline">
                        Mixed (clear)
                      </button>
                    )}
                  </div>
                  {datasets.length === 0 ? (
                    <p className="text-sm text-gray-500">Loading packs... (Mixed by default)</p>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-56 overflow-y-auto pr-1">
                      {datasets.map((d) => {
                        const active = settings.datasets.includes(d.category);
                        return (
                          <motion.button
                            key={d.category}
                            type="button"
                            whileTap={{ scale: 0.96 }}
                            onClick={() => toggleDataset(d.category)}
                            aria-pressed={active}
                            title={d.examples.join(', ')}
                            className={`p-3 rounded-xl border-2 text-left transition-all duration-200 ${active ? 'border-orange-500 bg-orange-50' : 'border-gray-200 hover:border-orange-300'}`}>
                            <div className="flex items-center justify-between">
                              <span className="text-xl" aria-hidden="true">{categoryIcon(d.category)}</span>
                              {active && <span className="text-orange-600 font-bold" aria-hidden="true">✓</span>}
                            </div>
                            <div className="text-xs font-bold text-gray-800 mt-1">{prettyCategory(d.category)}</div>
                            <div className="text-[11px] text-gray-500">{d.count} words · e.g. {d.examples.slice(0, 2).join(', ')}</div>
                          </motion.button>
                        );
                      })}
                    </div>
                  )}
                  <p className="text-xs text-gray-500 mt-1.5">
                    {settings.datasets.length === 0 ? 'Mixed: words from every pack.' : `${settings.datasets.length} pack${settings.datasets.length > 1 ? 's' : ''} selected.`}
                  </p>
                </div>
                <Button type="submit" className="w-full" size="lg" loading={isCreating}>
                  CREATE ROOM
                </Button>
              </form>
            </CardContent>
          </Card>
          <p className="text-center text-sm text-gray-500 mt-6">
            By playing, you agree to our <a href="/terms" className="text-orange-600 hover:underline">Terms</a> and <a href="/privacy" className="text-orange-600 hover:underline">Privacy Policy</a>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
