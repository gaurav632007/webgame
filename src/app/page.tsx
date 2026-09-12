'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { Button, Card } from '@/components/ui';
import { popIn, slideUp, staggerContainer, staggerItem } from '@/lib/animations';
import Link from 'next/link';

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

const GANG = ['Priya', 'Rahul', 'Aisha', 'Kabir', 'Meera', 'Rohan', 'Simran', 'Arjun'];

const patternSvg = `data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fillRule='evenodd'%3E%3Cg fill='%23fbbf24' fillOpacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E`;

function StringLights() {
  const reduceMotion = useReducedMotion();
  const bulbs = Array.from({ length: 28 });
  return (
    <div className="absolute top-0 left-0 right-0 overflow-hidden" aria-hidden="true">
      <svg viewBox="0 0 1200 60" preserveAspectRatio="none" className="w-full h-10 block">
        <path d="M0,8 Q300,52 600,22 T1200,30" fill="none" stroke="#f59e0b" strokeOpacity="0.5" strokeWidth="2" />
      </svg>
      <div className="absolute top-0 left-0 right-0 h-12">
        {bulbs.map((_, i) => (
          <motion.span
            key={i}
            className="absolute rounded-full"
            style={{
              left: `${(i * 100) / 27}%`,
              top: `${10 + Math.abs(Math.sin(i * 1.7)) * 26}px`,
              width: 7,
              height: 7,
              backgroundColor: ['#fbbf24', '#f472b6', '#a78bfa', '#34d399'][i % 4],
              boxShadow: `0 0 10px 2px ${['#fbbf24', '#f472b6', '#a78bfa', '#34d399'][i % 4]}`,
            }}
            animate={reduceMotion ? undefined : { opacity: [1, 0.4, 1] }}
            transition={{ duration: 2 + (i % 5) * 0.4, repeat: Infinity, ease: 'easeInOut', delay: (i % 7) * 0.3 }}
          />
        ))}
      </div>
    </div>
  );
}

function GangLineup() {
  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      className="flex flex-wrap justify-center gap-3 sm:gap-4"
      aria-label="Meet the gang"
    >
      {GANG.map((name, i) => (
        <motion.div key={name} variants={popIn} className="flex flex-col items-center gap-1.5">
          <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br ${AVATAR_GRADIENTS[i]} flex items-center justify-center font-display font-bold text-white text-lg shadow-lg shadow-black/40 rotate-[-2deg] odd:rotate-[2deg]`}>
            {name.slice(0, 2).toUpperCase()}
          </div>
          <span className="text-[11px] font-bold tracking-widest text-amber-200 bg-white/10 rounded-full px-2.5 py-0.5">{name.toUpperCase()}</span>
        </motion.div>
      ))}
    </motion.div>
  );
}

const steps = [
  { number: 1, title: 'Room Banao', en: 'Create a Room', description: 'Set up a game in seconds. Bilkul free.', bg: 'bg-cyan-100', accent: 'bg-cyan-500' },
  { number: 2, title: 'Doston Ko Bulao', en: 'Invite Friends', description: 'Share the code. Group mein forward karo.', bg: 'bg-orange-100', accent: 'bg-orange-500' },
  { number: 3, title: 'Secret Role Pao', en: 'Get Your Role', description: 'One of you is the imposter. Shhh!', bg: 'bg-amber-100', accent: 'bg-amber-500' },
  { number: 4, title: 'Clue Do', en: 'Give Clues', description: 'Describe it without being obvious. Hoshiyaari se!', bg: 'bg-teal-100', accent: 'bg-teal-500' },
  { number: 5, title: 'Charcha Karo', en: 'Discuss', description: 'Talk, analyse, find the lies. Chai pe charcha!', bg: 'bg-yellow-100', accent: 'bg-yellow-500' },
  { number: 6, title: 'Vote Karo', en: 'Vote', description: 'Vote who you think is the imposter. Pakad ke dikhao!', bg: 'bg-pink-100', accent: 'bg-pink-500' },
];

const modes = [
  { name: 'Classic', desc: 'The original bluffing game.', tag: 'Popular', tagColor: 'bg-green-400 text-green-950', color: 'from-cyan-500 to-blue-600', soon: false },
  { name: 'Desi Life', desc: 'Chai, cricket, shaadi — full desi.', tag: 'Desi', tagColor: 'bg-amber-300 text-amber-950', color: 'from-orange-500 to-red-500', soon: false },
  { name: 'Hardcore', desc: 'Tricky topics, tez dimaag needed.', tag: 'Tough', tagColor: 'bg-red-300 text-red-950', color: 'from-red-500 to-pink-600', soon: false },
  { name: 'Desi Expert', desc: 'Only true desis survive.', tag: 'Expert', tagColor: 'bg-purple-300 text-purple-950', color: 'from-purple-500 to-indigo-600', soon: false },
  { name: 'Chaos', desc: 'Unexpected rule twists.', tag: 'Crazy', tagColor: 'bg-orange-300 text-orange-950', color: 'from-fuchsia-500 to-purple-600', soon: true },
  { name: 'Friends Custom', desc: 'Create your own topics.', tag: 'Custom', tagColor: 'bg-emerald-300 text-emerald-950', color: 'from-emerald-500 to-teal-600', soon: true },
];

const difficulties = [
  { name: 'EASY', desc: 'Perfect for first-time players.', sub: 'Aram se khelo', bg: 'from-green-500 to-emerald-600' },
  { name: 'MEDIUM', desc: 'Balanced. Fun. Suspicious.', sub: 'Thoda tez', bg: 'from-amber-500 to-yellow-600' },
  { name: 'HARD', desc: 'Every clue matters.', sub: 'Dimaag lagao', bg: 'from-red-500 to-rose-600' },
  { name: 'EXPERT', desc: 'Only true detectives survive.', sub: 'Asli khiladi', bg: 'from-purple-500 to-violet-700' },
  { name: 'NIGHTMARE', desc: 'One-word clues. No mercy.', sub: 'Kya re bhai?!', bg: 'from-red-700 to-black' },
];

const demoClues = [
  { name: 'Rahul', clue: 'Cheesy' },
  { name: 'Priya', clue: 'Round' },
  { name: 'Arjun', clue: 'Party' },
  { name: 'Meera', clue: 'Delivery' },
];

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'VideoGame',
  name: 'Guess The Imposter',
  description: 'Ek secret. Ek jhootha. Pakad ke dikhao! A colorful Indian party game of bluffing and deduction.',
  genre: ['Party', 'Social Deduction', 'Multiplayer'],
  playMode: 'MultiPlayer',
  applicationCategory: 'Game',
  operatingSystem: 'Web',
  numberOfPlayers: { '@type': 'QuantitativeValue', minValue: 4, maxValue: 12 },
  inLanguage: 'hi-IN',
  isAccessibleForFree: true,
};

export default function LandingPage() {
  return (
    <div className="min-h-screen relative overflow-hidden bg-[#12102b] text-white">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="absolute inset-0" style={{ backgroundImage: `url(${patternSvg})` }} aria-hidden="true" />
      <div className="absolute inset-0 bg-gradient-to-b from-[#1b1445]/60 via-transparent to-[#0a081c]" aria-hidden="true" />
      <StringLights />

      <header className="relative px-4 py-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-display font-black text-xl sm:text-2xl tracking-tight">
              <span className="text-amber-300">GUESS THE</span> <span className="bg-gradient-to-r from-orange-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">IMPOSTER</span>
            </span>
          </div>
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium" aria-label="Primary">
            <Link href="#how" className="text-slate-300 hover:text-amber-300 transition-colors">How to Play</Link>
            <Link href="#modes" className="text-slate-300 hover:text-amber-300 transition-colors">Modes</Link>
            <Link href="/offline" className="text-slate-300 hover:text-amber-300 transition-colors">Pass &amp; Play</Link>
          </nav>
          <Link href="/create">
            <Button size="sm" className="px-5">PLAY NOW</Button>
          </Link>
        </div>
      </header>

      <motion.main variants={slideUp} initial="hidden" animate="visible" className="relative px-4 py-10 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <section className="text-center mb-14 relative z-10">
            <motion.h1 variants={slideUp} className="font-display font-black text-5xl sm:text-7xl lg:text-8xl leading-[0.95] mb-5">
              <span className="block text-amber-300 drop-shadow-[0_4px_0_rgba(0,0,0,0.45)]">GUESS THE</span>
              <span className="block bg-gradient-to-r from-orange-400 via-pink-400 to-purple-300 bg-clip-text text-transparent drop-shadow-[0_4px_0_rgba(0,0,0,0.45)]">IMPOSTER?</span>
            </motion.h1>
            <motion.p variants={slideUp} className="font-display text-2xl sm:text-3xl text-amber-200 mb-2">
              Ek secret. Ek jhootha. Pakad ke dikhao!
            </motion.p>
            <motion.p variants={slideUp} className="text-base sm:text-lg text-slate-300 mb-8">
              One secret. One liar. Can you catch them?
            </motion.p>
            <motion.div variants={slideUp} className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link href="/create" className="w-full sm:w-auto">
                <Button size="xl" className="w-full sm:w-auto px-10">PLAY NOW</Button>
              </Link>
              <Link href="/offline" className="w-full sm:w-auto">
                <Button size="xl" variant="secondary" className="w-full sm:w-auto px-10">PASS &amp; PLAY (OFFLINE)</Button>
              </Link>
              <Link href="#how" className="w-full sm:w-auto">
                <Button size="xl" variant="outline" className="w-full sm:w-auto px-10 border-slate-500 text-slate-200 hover:bg-white/10">HOW TO PLAY</Button>
              </Link>
            </motion.div>
            <motion.div variants={slideUp} className="mt-8 flex flex-wrap items-center justify-center gap-x-8 gap-y-2 text-sm text-slate-300">
              <span><strong className="text-white">4 – 12</strong> Players</span>
              <span><strong className="text-white">2</strong> Ways to Play — Room + Offline</span>
              <span><strong className="text-white">100%</strong> Desi Fun</span>
            </motion.div>
          </section>

          <section className="mb-16 relative z-10" aria-label="The gang">
            <p className="text-center text-sm font-semibold tracking-widest text-slate-400 mb-5">GOOD FRIENDS · SUSPICIOUS MINDS · GREAT TIMES</p>
            <GangLineup />
          </section>

          <section id="how" className="mb-16 relative z-10 scroll-mt-8">
            <div className="text-center mb-10">
              <h2 className="font-display text-4xl sm:text-5xl font-black text-amber-300">HOW TO PLAY</h2>
              <p className="text-slate-300 mt-1">Super simple. Super fun. Bilkul aasaan.</p>
            </div>
            <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true }} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {steps.map((step) => (
                <motion.div key={step.number} variants={staggerItem}>
                  <div className={`rounded-2xl ${step.bg} text-slate-900 p-5 h-full shadow-xl shadow-black/30 border-b-4 border-black/10`}>
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`w-7 h-7 rounded-full ${step.accent} text-white flex items-center justify-center font-bold text-sm`}>{step.number}</span>
                      <h3 className="font-display text-lg font-bold">{step.title}</h3>
                    </div>
                    <p className="text-sm font-semibold text-slate-700">{step.en}</p>
                    <p className="text-sm text-slate-600 mt-1">{step.description}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </section>

          <section className="mb-16 relative z-10">
            <div className="text-center mb-10">
              <h2 className="font-display text-4xl sm:text-5xl font-black text-amber-300">WHO&apos;S THE IMPOSTER?</h2>
              <p className="text-slate-300 mt-1">Same secret. Different minds.</p>
            </div>
            <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="max-w-3xl mx-auto rounded-2xl bg-[#1e1a12] border-8 border-[#5b3a1e] shadow-2xl shadow-black/50 p-6 sm:p-8" style={{ backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 30px, rgba(255,255,255,0.03) 31px)' }}>
              <div className="text-center mb-6">
                <span className="inline-block font-display text-xl sm:text-2xl font-bold text-amber-200 border-2 border-dashed border-amber-200/50 rounded-lg px-5 py-2">SECRET: PIZZA</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                {demoClues.map((c, i) => (
                  <motion.div key={c.name} variants={popIn} initial="hidden" whileInView="visible" viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="bg-[#f5ead2] text-slate-900 rounded-lg p-3 text-center shadow-md rotate-[-1deg] odd:rotate-[1deg]">
                    <div className={`w-10 h-10 mx-auto rounded-full bg-gradient-to-br ${AVATAR_GRADIENTS[i]} flex items-center justify-center text-white font-bold text-sm mb-1`}>{c.name.slice(0, 2).toUpperCase()}</div>
                    <p className="font-bold text-sm">{c.name}</p>
                    <p className="italic text-slate-700">&ldquo;{c.clue}&rdquo;</p>
                  </motion.div>
                ))}
              </div>
              <p className="text-center font-display text-xl text-rose-300">Someone doesn&apos;t know the secret... Kaun hai woh?</p>
            </motion.div>
          </section>

          <section id="modes" className="mb-16 relative z-10 scroll-mt-8">
            <div className="text-center mb-10">
              <h2 className="font-display text-4xl sm:text-5xl font-black text-amber-300">CHOOSE YOUR MODE</h2>
              <p className="text-slate-300 mt-1">Different vibes. Same betrayal. Dhokha guaranteed.</p>
            </div>
            <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true }} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {modes.map((mode) => (
                <motion.div key={mode.name} variants={staggerItem}>
                  <div className={`rounded-2xl bg-gradient-to-br ${mode.color} p-6 h-full shadow-xl shadow-black/30 ${mode.soon ? 'opacity-90' : ''}`}>
                    <h3 className="font-display text-2xl font-black text-white mb-1">{mode.name.toUpperCase()}</h3>
                    <p className="text-white/85 text-sm mb-4">{mode.desc}</p>
                    <span className={`inline-block text-xs font-bold rounded-full px-3 py-1 ${mode.tagColor}`}>{mode.soon ? `${mode.tag} · Soon` : mode.tag}</span>
                  </div>
                </motion.div>
              ))}
            </motion.div>
            <p className="text-center text-slate-300 mt-8">
              Aur suno — <Link href="/offline" className="text-amber-300 font-bold hover:underline">Pass &amp; Play</Link> mein ek hi phone ghumao, no internet needed!
            </p>
          </section>

          <section className="mb-16 relative z-10">
            <div className="text-center mb-10">
              <h2 className="font-display text-4xl sm:text-5xl font-black text-amber-300">CHOOSE YOUR DIFFICULTY</h2>
              <p className="text-slate-300 mt-1">From casual fun to full mind games.</p>
            </div>
            <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true }} className="grid grid-cols-2 lg:grid-cols-5 gap-5">
              {difficulties.map((d) => (
                <motion.div key={d.name} variants={staggerItem}>
                  <div className={`rounded-2xl bg-gradient-to-b ${d.bg} p-6 text-center shadow-xl shadow-black/30 h-full`}>
                    <h3 className="font-display text-2xl font-black text-white">{d.name}</h3>
                    <p className="text-amber-200 text-sm font-semibold">{d.sub}</p>
                    <p className="text-white/85 text-sm mt-2">{d.desc}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </section>

          <section className="relative z-10 mb-8">
            <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center">
              <Card className="max-w-2xl mx-auto bg-gradient-to-br from-orange-500 via-pink-500 to-purple-600 border-0 p-8 sm:p-12 shadow-2xl shadow-pink-900/40">
                <div className="text-white">
                  <h2 className="font-display text-3xl sm:text-4xl font-black mb-3">Bluff Better. Play Together.</h2>
                  <p className="text-white/90 mb-8 text-lg">Room banao ya phone ghumao — game shuru karo, no account needed!</p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Link href="/create">
                      <Button size="xl" variant="secondary" className="w-full sm:w-auto px-10">ONLINE ROOM</Button>
                    </Link>
                    <Link href="/offline">
                      <Button size="xl" className="w-full sm:w-auto px-10 bg-white text-pink-600 hover:bg-slate-100">PASS &amp; PLAY</Button>
                    </Link>
                  </div>
                </div>
              </Card>
            </motion.div>
          </section>
        </div>
      </motion.main>

      <footer className="relative px-4 py-10 border-t border-white/10">
        <div className="max-w-7xl mx-auto">
          <nav className="flex flex-wrap items-center justify-center gap-x-8 gap-y-2 mb-5 text-sm font-medium" aria-label="Footer">
            <Link href="/create" className="text-slate-300 hover:text-amber-300 transition-colors">Play Now</Link>
            <Link href="/offline" className="text-slate-300 hover:text-amber-300 transition-colors">Pass &amp; Play</Link>
            <Link href="#how" className="text-slate-300 hover:text-amber-300 transition-colors">How to Play</Link>
            <Link href="#modes" className="text-slate-300 hover:text-amber-300 transition-colors">Modes</Link>
            <Link href="/privacy" className="text-slate-300 hover:text-amber-300 transition-colors">Privacy</Link>
            <Link href="/terms" className="text-slate-300 hover:text-amber-300 transition-colors">Terms</Link>
          </nav>
          <div className="text-center text-slate-400 text-sm">
            <p className="mb-1">Good Friends. Suspicious Minds. Great Times.</p>
            <p>Guess The Imposter © 2026</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
