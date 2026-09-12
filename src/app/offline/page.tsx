'use client';

import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { Button, Card, CardContent, Input, Avatar } from '@/components/ui';
import { GAME_MODES, DIFFICULTIES, type Difficulty, type GameMode } from '@/types/game';
import { pickLocalSecret } from '@/data/topics';

type Stage = 'setup' | 'reveal' | 'clue' | 'discuss' | 'vote' | 'result';

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
  const [clues, setClues] = useState<string[]>([]);
  const [clueInput, setClueInput] = useState('');
  const [votes, setVotes] = useState<number[]>([]);
  const [discussLeft, setDiscussLeft] = useState(60);
  const [score, setScore] = useState({ civilians: 0, imposters: 0 });

  const playableModes = useMemo(() => GAME_MODES.filter((m) => m.playable), []);

  const startGame = (roster: OfflinePlayer[]) => {
    const idx = roster.map((_, i) => i);
    const shuffled = shuffle(idx);
    const impCount = roster.length >= 8 ? 2 : 1;
    setImposters(shuffled.slice(0, impCount));
    setSecret(pickLocalSecret(mode, difficulty));
    setClues(new Array(roster.length).fill(''));
    setVotes(new Array(roster.length).fill(-1));
    setStep(0);
    setRevealed(false);
    setClueInput('');
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

  const tally = () => {
    const counts = new Map<number, number>();
    votes.forEach((v) => {
      if (v >= 0) counts.set(v, (counts.get(v) ?? 0) + 1);
    });
    let top = -1;
    let topCount = 0;
    let second = 0;
    counts.forEach((c, idx) => {
      if (c > topCount) {
        second = topCount;
        top = idx;
        topCount = c;
      } else if (c > second) {
        second = c;
      }
    });
    return topCount > second && imposters.includes(top) ? 'civilians' : 'imposter';
  };

  const winner = stage === 'result' ? tally() : null;

  const rematch = () => {
    if (winner === 'civilians') setScore((s) => ({ ...s, civilians: s.civilians + 1 }));
    else if (winner === 'imposter') setScore((s) => ({ ...s, imposters: s.imposters + 1 }));
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
                      setStage('clue');
                    }
                  }}>
                  {step + 1 < players.length ? 'CHHUPAO & PASS KARO →' : 'SAB READY? CLUES SHURU!'}
                </Button>
                {!revealed && <p className="text-slate-500 text-sm mt-3">Pehle apna role dekho, phir pass karo.</p>}
              </motion.div>
            )}

            {stage === 'clue' && (
              <motion.div key={`clue-${step}`} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <div className="text-center mb-4">
                  <p className="text-slate-400 text-sm">Clue {step + 1} of {players.length}</p>
                  <h2 className="font-display text-3xl font-black text-white">{players[step].name} ka clue</h2>
                </div>
                <div className="space-y-2 mb-5">
                  {clues.slice(0, step).map((c, i) => (
                    <div key={i} className="flex items-center gap-2 bg-white/5 rounded-xl px-4 py-2">
                      <span className="font-bold text-sm text-slate-300 w-24 truncate">{players[i].name}</span>
                      <span className="text-white">{c}</span>
                    </div>
                  ))}
                </div>
                <Card className="bg-white/5 border-white/10 backdrop-blur max-w-md mx-auto">
                  <CardContent className="p-6 space-y-3">
                    <Input label="Apna clue likho (1 word best hai!)" value={clueInput} onChange={(e) => setClueInput(e.target.value)} maxLength={50} autoFocus />
                    <Button size="lg" className="w-full" disabled={!clueInput.trim()}
                      onClick={() => {
                        const next = [...clues];
                        next[step] = clueInput.trim();
                        setClues(next);
                        setClueInput('');
                        if (step + 1 < players.length) setStep(step + 1);
                        else {
                          setStep(0);
                          setDiscussLeft(60);
                          setStage('discuss');
                        }
                      }}>
                      CLUE LOCK KARO →
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {stage === 'discuss' && (
              <motion.div key="discuss" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
                <h2 className="font-display text-3xl font-black text-amber-300 mb-1">CHARCHA TIME! ☕</h2>
                <p className="text-slate-300 mb-6">Behes karo, ilzaam lagao, jhooth pakdo. Chillao mat!</p>
                <div className="font-mono font-bold text-7xl text-white mb-6 tabular-nums">
                  {Math.floor(discussLeft / 60)}:{String(discussLeft % 60).padStart(2, '0')}
                </div>
                <div className="space-y-2 max-w-md mx-auto mb-6 text-left">
                  {clues.map((c, i) => (
                    <div key={i} className="flex items-center gap-2 bg-white/5 rounded-xl px-4 py-2">
                      <span className="font-bold text-sm text-slate-300 w-24 truncate">{players[i].name}</span>
                      <span className="text-white">{c}</span>
                    </div>
                  ))}
                </div>
                <Button size="lg" className="min-w-[240px]" onClick={() => { setStep(0); setStage('vote'); }}>
                  {discussLeft > 0 ? 'SKIP KARO, VOTE PE CHALO' : 'TIME KHATAM — VOTE KARO!'}
                </Button>
              </motion.div>
            )}

            {stage === 'vote' && (
              <motion.div key={`vote-${step}`} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
                <p className="text-slate-400 text-sm mb-1">Secret vote — player {step + 1} of {players.length}. Baaki sab door dekho!</p>
                <h2 className="font-display text-3xl font-black text-white mb-5">{players[step].name}, imposter kaun?</h2>
                <div className="grid grid-cols-2 gap-3 max-w-md mx-auto">
                  {players.map((p, i) =>
                    i === step ? null : (
                      <button key={i} onClick={() => {
                        const next = [...votes];
                        next[step] = i;
                        setVotes(next);
                        if (step + 1 < players.length) setStep(step + 1);
                        else setStage('result');
                      }}
                        className="p-4 rounded-2xl bg-white/5 border-2 border-white/15 hover:border-amber-400 transition-all">
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

            {stage === 'result' && winner && (
              <motion.div key="result" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
                <h2 className={`font-display text-4xl sm:text-5xl font-black mb-2 ${winner === 'civilians' ? 'text-green-400' : 'text-purple-300'}`}>
                  {winner === 'civilians' ? 'PAKDA GAYA! 🎉' : 'BACH GAYA! 😈'}
                </h2>
                <p className="text-slate-300 mb-5">Secret tha: <strong className="text-amber-300">{secret}</strong></p>
                <div className="flex flex-wrap justify-center gap-3 mb-5">
                  {imposters.map((i) => (
                    <div key={i} className="bg-white/5 border border-purple-400/40 rounded-2xl px-5 py-3">
                      <p className="text-xs font-bold text-purple-300 tracking-widest">IMPOSTER</p>
                      <p className="font-display text-xl font-bold text-white">{players[i].name}</p>
                    </div>
                  ))}
                </div>
                <div className="max-w-md mx-auto mb-6 text-left space-y-2">
                  <p className="text-sm font-bold text-slate-400">Votes:</p>
                  {votes.map((v, i) => (
                    <p key={i} className="text-sm text-slate-300">{players[i].name} → <strong className="text-white">{players[v].name}</strong></p>
                  ))}
                </div>
                <p className="font-bold text-slate-200 mb-5">Session score — Civilians {score.civilians + (winner === 'civilians' ? 1 : 0)} : {score.imposters + (winner === 'imposter' ? 1 : 0)} Imposters</p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button size="lg" onClick={rematch}>REMATCH · EK AUR!</Button>
                  <Button size="lg" variant="outline" className="border-slate-500 text-slate-200" onClick={() => setStage('setup')}>NEW SETUP</Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
