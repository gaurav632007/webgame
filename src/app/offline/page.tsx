'use client';

import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { Button, Card, CardContent, Avatar } from '@/components/ui';
import { ConfettiBurst } from '@/components/game/Confetti';
import { ModeBanner } from '@/components/game/ModeBanner';
import { GAME_MODES, DIFFICULTIES, type Difficulty, type GameMode } from '@/types/game';
import { pickLocalSecret } from '@/data/topics';

type Stage = 'setup' | 'reveal' | 'discuss' | 'vote' | 'result';

interface OfflinePlayer {
  name: string;
  avatar: number;
}

const AVATAR_GRADIENTS = [
  'from-orange-400 to-pink-500',
  'from-blue-400 to-purple-500',
  'from-green-400 to-teal-500',
  'from-purple-400 to-pink-500',
  'from-yellow-400 to-orange-500',
  'from-teal-400 to-cyan-500',
  'from-pink-400 to-rose-500',
  'from-indigo-400 to-blue-500',
];

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function OfflinePage() {
  const [stage, setStage] = useState<Stage>('setup');
  const [names, setNames] = useState<string[]>(['', '', '', '']);
  const [mode, setMode] = useState<GameMode>('desi-life');
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [players, setPlayers] = useState<OfflinePlayer[]>([]);
  const [secret, setSecret] = useState('');
  const [imposters, setImposters] = useState<number[]>([]);
  const [step, setStep] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [discussLeft, setDiscussLeft] = useState(60);
  const [votes, setVotes] = useState<number[]>([]);
  const [score, setScore] = useState({ civilians: 0, imposters: 0 });
  const [outcome, setOutcome] = useState<'civilians' | 'imposter' | null>(null);
  const [showImposter, setShowImposter] = useState(false);

  const playableModes = useMemo(() => GAME_MODES.filter((m) => m.playable), []);

  const startGame = (roster: OfflinePlayer[]) => {
    const idx = roster.map((_, i) => i);
    const shuffled = shuffle(idx);
    const impCount = roster.length >= 8 ? 2 : 1;
    setImposters(shuffled.slice(0, impCount));
    setSecret(pickLocalSecret(mode, difficulty));
    setStep(0);
    setRevealed(false);
    setVotes(new Array(roster.length).fill(-1));
    setOutcome(null);
    setShowImposter(false);
    setStage('reveal');
  };

  const handleSetup = () => {
    const roster = names
      .map((n) => n.trim())
      .filter((n) => n.length > 0)
      .map((name, i) => ({ name, avatar: (i % 8) + 1 }));
    if (roster.length < 4) return;
    const lower = roster.map((p) => p.name.toLowerCase());
    if (new Set(lower).size !== lower.length) return;
    setPlayers(roster);
    startGame(roster);
  };

  const validNames = names.map((n) => n.trim()).filter((n) => n.length > 0);
  const dupes = new Set(validNames.map((n) => n.toLowerCase())).size !== validNames.length;

  // Discussion countdown
  useEffect(() => {
    if (stage !== 'discuss' || discussLeft <= 0) return;
    const t = setTimeout(() => setDiscussLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [stage, discussLeft]);

  // Offline scoring: caught imposter → every civilian +3; survived → imposter +5.
  const castVote = (voterIdx: number, targetIdx: number) => {
    const next = [...votes];
    next[voterIdx] = targetIdx;
    setVotes(next);
    if (voterIdx + 1 < players.length) {
      setStep(voterIdx + 1);
      return;
    }
    // All votes in: most-voted is accused. Tie = imposter bach gaya.
    const counts = new Map<number, number>();
    next.forEach((v) => counts.set(v, (counts.get(v) ?? 0) + 1));
    let accused = -1;
    let top = 0;
    let tied = false;
    counts.forEach((c, idx) => {
      if (c > top) {
        top = c;
        accused = idx;
        tied = false;
      } else if (c === top) {
        tied = true;
      }
    });
    const caught = !tied && imposters.includes(accused);
    const w = caught ? 'civilians' : 'imposter';
    setOutcome(w);
    if (caught) {
      setScore((s) => ({ ...s, civilians: s.civilians + 3 }));
    } else {
      setScore((s) => ({ ...s, imposters: s.imposters + 5 }));
    }
    setStage('result');
  };

  const rematch = () => {
    startGame(players);
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-[#12102b] text-white">
      <div className="absolute inset-0 bg-gradient-to-b from-[#1b1445]/60 via-transparent to-[#0a081c]" aria-hidden="true" />
      <header className="relative px-4 py-4 sm:px-6">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <Link href="/" className="font-display font-black text-xl">
            <span className="text-amber-300">GUESS THE</span> <span className="text-pink-400">IMPOSTER</span>
          </Link>
          <span className="text-xs font-bold tracking-widest text-amber-200 bg-white/10 rounded-full px-3 py-1">PASS &amp; PLAY · OFFLINE</span>
        </div>
      </header>

      <main className="relative px-4 pb-12 sm:px-6">
        <div className="max-w-3xl mx-auto">
          {stage !== 'setup' && <ModeBanner mode={mode} difficulty={difficulty} className="max-w-md mx-auto" />}
          <AnimatePresence mode="wait">
            {stage === 'setup' && (
              <motion.div key="setup" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <div className="text-center mb-6">
                  <h1 className="font-display text-3xl sm:text-4xl font-black text-amber-300">Ek Phone. Poori Gang.</h1>
                  <p className="text-slate-300 mt-1">Phone ghumao, roles chhupao, imposter pakdao. No internet needed!</p>
                  {(score.civilians > 0 || score.imposters > 0) && (
                    <p className="mt-2 text-sm font-bold text-slate-200">Session score — Civilians {score.civilians} : {score.imposters} Imposters</p>
                  )}
                </div>
                <Card className="bg-white/5 border-white/10 backdrop-blur">
                  <CardContent className="p-6 space-y-5">
                    <div>
                      <label className="block text-sm font-semibold text-slate-200 mb-2">Players (4–12, ek line mein ek naam)</label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {names.map((n, i) => (
                          <div key={i} className="flex items-center gap-2">
                            <Avatar avatarId={(i % 8) + 1} size="sm" nickname={n || `Player ${i + 1}`} />
                            <input
                              value={n}
                              onChange={(e) => setNames(names.map((x, j) => (j === i ? e.target.value : x)))}
                              placeholder={`Player ${i + 1}`}
                              maxLength={20}
                              className="flex-1 px-3 py-2 rounded-xl bg-white/10 border border-white/15 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400"
                              aria-label={`Player ${i + 1} name`}
                            />
                          </div>
                        ))}
                      </div>
                      <div className="flex gap-2 mt-3">
                        {names.length > 4 && (
                          <Button variant="outline" size="sm" className="border-slate-500 text-slate-200" onClick={() => setNames(names.slice(0, -1))}>− Remove</Button>
                        )}
                        {names.length < 12 && (
                          <Button variant="outline" size="sm" className="border-slate-500 text-slate-200" onClick={() => setNames([...names, ''])}>+ Add player</Button>
                        )}
                      </div>
                      {dupes && <p className="text-red-400 text-sm mt-2">Naam unique rakho — duplicates allowed nahi!</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-200 mb-2">Mode</label>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {playableModes.map((m) => (
                          <button key={m.value} type="button" onClick={() => setMode(m.value)}
                            className={`p-3 rounded-xl border-2 text-center text-sm font-bold transition-all ${mode === m.value ? 'border-amber-400 bg-amber-400/10 text-amber-200' : 'border-white/15 text-slate-300 hover:border-white/40'}`}>
                            {m.label}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-200 mb-2">Difficulty</label>
                      <div className="grid grid-cols-4 gap-2">
                        {DIFFICULTIES.map((d) => (
                          <button key={d.value} type="button" onClick={() => setDifficulty(d.value)}
                            className={`px-2 py-2 rounded-xl border-2 text-center text-sm font-bold transition-all ${difficulty === d.value ? 'border-amber-400 bg-amber-400/10 text-amber-200' : 'border-white/15 text-slate-300 hover:border-white/40'}`}>
                            {d.label}
                          </button>
                        ))}
                      </div>
                    </div>
                    <Button size="lg" className="w-full" disabled={validNames.length < 4 || dupes} onClick={handleSetup}>
                      {validNames.length < 4 ? `ADD ${4 - validNames.length} MORE PLAYER${4 - validNames.length > 1 ? 'S' : ''}` : 'DEAL ROLES · KHEL SHURU!'}
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {stage === 'reveal' && (
              <motion.div key={`reveal-${step}`} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
                <p className="text-slate-400 text-sm mb-1">Phone pass karo — player {step + 1} of {players.length}</p>
                <h2 className="font-display text-3xl font-black text-white mb-1">{players[step].name}</h2>
                <p className="text-amber-200 mb-6">Baaki sab — aankhein band! 🙈</p>
                <Card className="bg-white/5 border-white/10 backdrop-blur max-w-md mx-auto">
                  <CardContent className="p-8">
                    {!revealed ? (
                      <Button size="lg" className="w-full" onClick={() => setRevealed(true)}>TAP TO SEE MY ROLE (secret!)</Button>
                    ) : imposters.includes(step) ? (
                      <div>
                        <p className="text-6xl mb-3">🕵️</p>
                        <p className="font-display text-2xl font-black text-purple-300">TUM HO IMPOSTER!</p>
                        <p className="text-slate-300 mt-2 text-sm">Secret tumhe nahi pata. Natak karo, pakde mat jao!</p>
                      </div>
                    ) : (
                      <div>
                        <p className="text-sm font-bold text-slate-400 mb-1">SECRET SHABD:</p>
                        <p className="font-display text-4xl font-black text-amber-300 mb-2">{secret}</p>
                        <p className="text-slate-300 text-sm">Tum CIVILIAN ho. Hint do, par jawab mat do!</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
                <Button size="lg" variant="secondary" className="mt-6 min-w-[240px]" disabled={!revealed}
                  onClick={() => {
                    setRevealed(false);
                    if (step + 1 < players.length) setStep(step + 1);
                    else {
                      setStep(0);
                      setDiscussLeft(60);
                      setStage('discuss');
                    }
                  }}>
                  {step + 1 < players.length ? 'CHHUPAO & PASS KARO →' : 'SAB READY? CHARCHA SHURU!'}
                </Button>
                {!revealed && <p className="text-slate-500 text-sm mt-3">Pehle apna role dekho, phir pass karo.</p>}
              </motion.div>
            )}

            {stage === 'discuss' && (
              <motion.div key="discuss" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
                <h2 className="font-display text-3xl font-black text-amber-300 mb-1">CHARCHA TIME! ☕</h2>
                <p className="text-slate-300 mb-2">Clues mooh se bolo, behes karo, ilzaam lagao. Likhna kuch nahi!</p>
                <p className="text-amber-200/80 text-sm mb-6">Shak pak gaya? Discussion khatam karke vote out karo.</p>
                <div className="font-mono font-bold text-7xl text-white mb-6 tabular-nums">
                  {Math.floor(discussLeft / 60)}:{String(discussLeft % 60).padStart(2, '0')}
                </div>
                <div className="flex flex-wrap justify-center gap-2 max-w-md mx-auto mb-6">
                  {players.map((p, i) => (
                    <span key={i} className="text-xs font-bold text-slate-300 bg-white/10 rounded-full px-3 py-1">{p.name}</span>
                  ))}
                </div>
                <Button size="lg" className="min-w-[240px]" onClick={() => { setVotes(new Array(players.length).fill(-1)); setStep(0); setStage('vote'); }}>
                  {discussLeft > 0 ? 'CHARCHA OVER — VOTE KARO!' : 'TIME KHATAM — VOTE KARO!'}
                </Button>
              </motion.div>
            )}

            {stage === 'vote' && (
              <motion.div key={`vote-${step}`} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
                <p className="text-slate-400 text-sm mb-1">Vote {votes.filter((v) => v >= 0).length + 1} of {players.length} — ek tap, no bakwaas!</p>
                <h2 className="font-display text-3xl font-black text-white mb-1">{players[step].name}</h2>
                <p className="text-amber-200 mb-5">Imposter kaun? Baaki sab door dekho! 👀</p>
                <div className="grid grid-cols-2 gap-3 max-w-md mx-auto">
                  {players.map((p, i) =>
                    i === step ? null : (
                      <button key={i} onClick={() => castVote(step, i)}
                        className="p-4 rounded-2xl bg-white/5 border-2 border-white/15 hover:border-amber-400 active:scale-95 transition-all">
                        <div className={`w-12 h-12 mx-auto rounded-full bg-gradient-to-br ${AVATAR_GRADIENTS[i % 8]} flex items-center justify-center text-white font-bold mb-1`}>
                          {p.name.slice(0, 2).toUpperCase()}
                        </div>
                        <p className="font-bold text-white text-sm truncate">{p.name}</p>
                      </button>
                    ),
                  )}
                </div>
              </motion.div>
            )}

            {stage === 'result' && (
              <motion.div key="result" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
                {!showImposter ? (
                  <div>
                    <p className="font-display text-2xl sm:text-3xl font-black text-white mb-2">SAB TAIYAAR?</p>
                    <p className="text-slate-300 mb-6">Sabse bada twist — imposter ka pardafaash! Dhol bajao! 🥁</p>
                    <Button size="lg" className="min-w-[260px]" onClick={() => setShowImposter(true)}>PARDAFAASH KARO! 🎭</Button>
                  </div>
                ) : (
                  <div>
                    <motion.div initial={{ rotateY: 90, opacity: 0 }} animate={{ rotateY: 0, opacity: 1 }} transition={{ duration: 0.6 }}>
                      <div className="flex flex-wrap justify-center gap-3 mb-4">
                        {imposters.map((i) => (
                          <div key={i} className="bg-white/5 border border-purple-400/40 rounded-2xl px-6 py-4">
                            <div className={`w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br ${AVATAR_GRADIENTS[i % 8]} flex items-center justify-center text-white font-display font-black text-xl mb-2`}>
                              {players[i].name.slice(0, 2).toUpperCase()}
                            </div>
                            <p className="text-xs font-bold text-purple-300 tracking-widest">IMPOSTER THA!</p>
                            <p className="font-display text-2xl font-black text-white">{players[i].name}</p>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                    <p className="text-slate-300 mb-5">Secret tha: <strong className="text-amber-300">{secret}</strong></p>
                    <div>
                      {outcome === 'civilians' && <ConfettiBurst />}
                      <h2 className={`font-display text-4xl font-black mb-2 ${outcome === 'civilians' ? 'text-green-400' : 'text-purple-300'}`}>
                        {outcome === 'civilians' ? 'PAKDA GAYA! 🎉' : 'BACH GAYA! 😈'}
                      </h2>
                      <p className="text-slate-400 text-sm mb-1">
                        {outcome === 'civilians' ? 'Crew ne sahi pakda — sabko +3!' : 'Imposter bach gaya — use +5!'}
                      </p>
                      <p className="font-bold text-slate-200 mb-5">Session score — Civilians {score.civilians} : {score.imposters} Imposters</p>
                      <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <Button size="lg" onClick={rematch}>REMATCH · EK AUR!</Button>
                        <Button size="lg" variant="outline" className="border-slate-500 text-slate-200" onClick={() => setStage('setup')}>NEW SETUP</Button>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
