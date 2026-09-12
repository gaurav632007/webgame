'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { Button, Card, CardContent } from '@/components/ui';
import { popIn, slideUp, staggerContainer, staggerItem } from '@/lib/animations';
import Link from 'next/link';

const characters = [
  { id: 1, name: 'Arjun', x: 10, y: 20, delay: 0 },
  { id: 2, name: 'Priya', x: 80, y: 15, delay: 0.5 },
  { id: 3, name: 'Rahul', x: 15, y: 70, delay: 1 },
  { id: 4, name: 'Aisha', x: 75, y: 75, delay: 1.5 },
  { id: 5, name: 'Kabir', x: 50, y: 5, delay: 2 },
  { id: 6, name: 'Meera', x: 5, y: 50, delay: 2.5 },
  { id: 7, name: 'Rohan', x: 90, y: 40, delay: 3 },
  { id: 8, name: 'Simran', x: 30, y: 85, delay: 3.5 },
];

const gradientColors = [
  'from-orange-400 to-pink-500',
  'from-blue-400 to-purple-500',
  'from-green-400 to-teal-500',
  'from-purple-400 to-pink-500',
  'from-yellow-400 to-orange-500',
  'from-teal-400 to-cyan-500',
  'from-pink-400 to-rose-500',
  'from-indigo-400 to-blue-500',
];

const patternSvg = `data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fillRule='evenodd'%3E%3Cg fill='%23f97316' fillOpacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E`;

function Character({ char, index }: { char: (typeof characters)[0]; index: number }) {
  const gradient = gradientColors[index % gradientColors.length];
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      variants={popIn}
      initial="hidden"
      animate="visible"
      transition={{ delay: char.delay }}
      style={{ left: `${char.x}%`, top: `${char.y}%` }}
      className="absolute transform -translate-x-1/2 -translate-y-1/2"
    >
      <motion.div
        animate={reduceMotion ? undefined : { rotate: [-3, 3, -3] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        className={`w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br ${gradient} flex items-center justify-center font-bold text-white text-lg sm:text-xl shadow-lg shadow-orange-500/25`}
      >
        {char.name.slice(0, 2)}
      </motion.div>
      <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs font-medium text-gray-600 whitespace-nowrap opacity-80">
        {char.name}
      </div>
    </motion.div>
  );
}

function FloatingParticle({ index }: { index: number }) {
  const sizes = [4, 6, 8, 10, 12];
  const colors = ['#fb923c', '#f472b6', '#c084fc', '#60a5fa', '#2dd4bf'];
  const size = sizes[index % sizes.length];
  const color = colors[index % colors.length];
  const delay = index * 0.5;
  const duration = 8 + (index % 4) * 2;
  const reduceMotion = useReducedMotion();

  if (reduceMotion) {
    return (
      <div
        className="absolute rounded-full opacity-20"
        style={{ width: size, height: size, backgroundColor: color, left: `${(index * 13) % 100}%`, top: `${(index * 29) % 100}%` }}
        aria-hidden="true"
      />
    );
  }

  return (
    <motion.div
      className="absolute rounded-full opacity-30"
      style={{ width: size, height: size, backgroundColor: color, left: `${(index * 13) % 100}%` }}
      initial={{ opacity: 0, scale: 0 }}
      animate={{ y: [-50, 50, -50], x: [-30, 30, -30], opacity: [0.1, 0.3, 0.1] }}
      transition={{ duration, delay, repeat: Infinity, ease: 'easeInOut' }}
      aria-hidden="true"
    />
  );
}

const steps = [
  { number: 1, title: 'Create Room', description: 'Pick a mode, difficulty, and invite friends' },
  { number: 2, title: 'Get Your Role', description: 'Civilian knows the secret. Imposter does not.' },
  { number: 3, title: 'Give Clues', description: 'Describe the secret without being too obvious' },
  { number: 4, title: 'Discuss', description: 'Chat, accuse, defend, and read the room' },
  { number: 5, title: 'Vote', description: 'Choose who you think is the Imposter' },
  { number: 6, title: 'Catch Them!', description: 'Reveal the Imposter and celebrate' },
];

const modes = [
  { name: 'Classic', desc: 'Standard Imposter game', color: 'from-orange-400 to-pink-500', soon: false },
  { name: 'Desi Life', desc: 'Chai, cricket, Bollywood...', color: 'from-amber-400 to-orange-500', soon: false },
  { name: 'Hardcore', desc: 'Similar, tricky topics', color: 'from-red-400 to-pink-500', soon: false },
  { name: 'Desi Expert', desc: 'Ultra-specific Indian topics', color: 'from-purple-400 to-pink-500', soon: false },
  { name: 'Chaos', desc: 'Random rule twists', color: 'from-teal-400 to-cyan-500', soon: true },
  { name: 'Custom', desc: 'Your own topic packs', color: 'from-blue-400 to-indigo-500', soon: true },
];

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'VideoGame',
  name: 'Guess The Imposter',
  description: 'A colorful, animated Indian-inspired social deduction party game. One secret. One liar. Can you catch them?',
  genre: ['Party', 'Social Deduction', 'Multiplayer'],
  playMode: 'MultiPlayer',
  applicationCategory: 'Game',
  operatingSystem: 'Web',
  numberOfPlayers: { '@type': 'QuantitativeValue', minValue: 4, maxValue: 12 },
  inLanguage: 'en-IN',
  isAccessibleForFree: true,
};

export default function LandingPage() {
  return (
    <div className="min-h-screen relative overflow-hidden">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="absolute inset-0" style={{ backgroundImage: `url(${patternSvg})` }} aria-hidden="true" />

      <div className="absolute inset-0" aria-hidden="true">
        {Array.from({ length: 20 }).map((_, i) => (
          <FloatingParticle key={i} index={i} />
        ))}
      </div>

      <header className="relative px-4 py-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl" aria-hidden="true">🎭</span>
            <span className="font-display font-bold text-2xl bg-gradient-to-r from-orange-600 to-pink-600 bg-clip-text text-transparent">
              Guess The Imposter
            </span>
          </div>
          <nav className="hidden md:flex items-center gap-6" aria-label="Primary">
            <Link href="#how" className="text-gray-600 hover:text-orange-600 font-medium transition-colors">How to Play</Link>
            <Link href="#modes" className="text-gray-600 hover:text-orange-600 font-medium transition-colors">Modes</Link>
            <Link href="/create" className="text-gray-600 hover:text-orange-600 font-medium transition-colors">Play Now</Link>
          </nav>
        </div>
      </header>

      <motion.main
        variants={slideUp}
        initial="hidden"
        animate="visible"
        className="relative px-4 py-12 sm:px-6 lg:px-8"
      >
        <div className="max-w-7xl mx-auto">
          <section className="text-center mb-20 relative z-10">
            <motion.h1
              variants={slideUp}
              className="font-display text-5xl sm:text-7xl lg:text-8xl font-bold mb-6"
            >
              <span className="block bg-gradient-to-r from-orange-600 via-pink-600 to-purple-600 bg-clip-text text-transparent">
                Guess The
              </span>
              <span className="block bg-gradient-to-r from-amber-500 via-orange-500 to-pink-500 bg-clip-text text-transparent">
                Imposter
              </span>
            </motion.h1>

            <motion.p
              variants={slideUp}
              className="text-xl sm:text-2xl text-gray-600 mb-10 max-w-2xl mx-auto font-medium"
            >
              One secret. One liar. Can you catch them?
            </motion.p>

            <motion.div
              variants={slideUp}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <Link href="/create">
                <Button size="xl" className="w-full sm:w-auto px-10 py-4 text-lg">PLAY NOW</Button>
              </Link>
              <Link href="#how">
                <Button size="xl" variant="outline" className="w-full sm:w-auto px-10 py-4 text-lg">HOW TO PLAY</Button>
              </Link>
            </motion.div>

            <motion.div
              variants={slideUp}
              className="mt-8 flex flex-wrap items-center justify-center gap-x-8 gap-y-2 text-sm text-gray-500"
            >
              <span>Mobile Friendly</span>
              <span>Fully Animated</span>
              <span>Sound Effects</span>
              <span>Indian Themed</span>
            </motion.div>
          </section>

          <section id="how" className="mb-20 relative z-10 scroll-mt-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <span className="inline-block px-4 py-1.5 rounded-full bg-orange-100 text-orange-700 text-sm font-medium mb-4">
                HOW IT WORKS
              </span>
              <h2 className="font-display text-4xl sm:text-5xl font-bold text-gray-900">
                Play in <span className="text-gradient">6 Simple Steps</span>
              </h2>
            </motion.div>

            <motion.div
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {steps.map((step) => (
                <motion.div key={step.number} variants={staggerItem}>
                  <Card className="h-full card-elevated hover:shadow-2xl hover:shadow-orange-500/20 transition-all duration-300">
                    <CardContent className="text-center p-6">
                      <div className="flex items-center justify-center gap-2 mb-3">
                        <span className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-pink-500 flex items-center justify-center text-white font-bold text-sm">
                          {step.number}
                        </span>
                        <h3 className="font-display text-xl font-bold text-gray-900">{step.title}</h3>
                      </div>
                      <p className="text-gray-600">{step.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          </section>

          <section id="modes" className="mb-20 relative z-10 scroll-mt-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <span className="inline-block px-4 py-1.5 rounded-full bg-purple-100 text-purple-700 text-sm font-medium mb-4">
                GAME MODES
              </span>
              <h2 className="font-display text-4xl sm:text-5xl font-bold text-gray-900">
                Choose Your <span className="text-gradient">Adventure</span>
              </h2>
            </motion.div>

            <motion.div
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {modes.map((mode) => (
                <motion.div key={mode.name} variants={staggerItem}>
                  <Card className={`h-full card-elevated hover:shadow-2xl hover:shadow-orange-500/20 transition-all duration-300 group ${mode.soon ? 'opacity-80' : ''}`}>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${mode.color} group-hover:scale-110 transition-transform`} aria-hidden="true" />
                        {mode.soon && (
                          <span className="text-xs font-bold text-purple-600 bg-purple-100 rounded-full px-2.5 py-1">SOON</span>
                        )}
                      </div>
                      <h3 className="font-display text-xl font-bold text-gray-900 mb-2">{mode.name}</h3>
                      <p className="text-gray-600">{mode.desc}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          </section>

          <section className="relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <Card className="max-w-2xl mx-auto card-elevated bg-gradient-to-br from-orange-500 via-pink-500 to-purple-500 p-8 sm:p-12">
                <div className="text-white">
                  <h2 className="font-display text-3xl sm:text-4xl font-bold mb-4">Ready to Play?</h2>
                  <p className="text-white/90 mb-8 text-lg">
                    Create a room in seconds. No accounts needed. Just share the code and play!
                  </p>
                  <Link href="/create">
                    <Button size="xl" variant="secondary" className="w-full sm:w-auto px-10 py-4 text-lg">
                      START GAME NOW
                    </Button>
                  </Link>
                </div>
              </Card>
            </motion.div>
          </section>
        </div>
      </motion.main>

      <footer className="relative px-4 py-12 border-t border-orange-100">
        <div className="max-w-7xl mx-auto">
          <nav className="flex flex-wrap items-center justify-center gap-x-8 gap-y-2 mb-6 text-sm font-medium" aria-label="Footer">
            <Link href="/create" className="text-gray-600 hover:text-orange-600 transition-colors">Play Now</Link>
            <Link href="#how" className="text-gray-600 hover:text-orange-600 transition-colors">How to Play</Link>
            <Link href="#modes" className="text-gray-600 hover:text-orange-600 transition-colors">Game Modes</Link>
            <Link href="/privacy" className="text-gray-600 hover:text-orange-600 transition-colors">Privacy</Link>
            <Link href="/terms" className="text-gray-600 hover:text-orange-600 transition-colors">Terms</Link>
          </nav>
          <div className="text-center text-gray-500 text-sm">
            <p className="mb-2">Made for Indian parties everywhere</p>
            <p>Guess The Imposter © 2026</p>
          </div>
        </div>
      </footer>

      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        {characters.map((char, index) => (
          <Character key={char.id} char={char} index={index} />
        ))}
      </div>
    </div>
  );
}
