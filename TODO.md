# GUESS THE IMPOSTER — TODO

## 🟦 PHASE 0 — FOUNDATION

- [x] Initialize repository
- [x] Configure Next.js with TypeScript, Tailwind, ESLint
- [x] Configure Supabase client (browser + server)
- [x] Create folder structure
- [x] Create .env.example and .env.local
- [x] Create database schema (rooms, players, game_state, messages, reactions, topics, game_results, topic_packs)
- [x] Create database functions (generate_room_code, create_room_with_code, join_room, start_game)
- [x] Create shared TypeScript types (game.ts)
- [x] Create utility functions (cn, generateRoomCode, formatTime, getInitials)
- [x] Create design system components (Button, Card, Input, Modal, Avatar, Badge, Timer, Toast, GameHeader)
- [x] Create landing page with animations
- [x] Create Create Room page with validation
- [x] Create Join Room page with room info fetch
- [x] Create Lobby page with realtime player list
- [x] Create Play page (placeholder with phase screens)
- [x] Create Results page
- [x] Set up globals.css with Indian color palette
- [x] Configure root layout with providers
- [x] Verify development server starts (200 on / and /create)
- [x] Verify production build (next build green)
- [x] Lint clean (eslint, no warnings)
- [x] Test mobile viewport (320px, 375px, 414px)
- [x] Fix initial errors (Turbopack parse, TS strict, route-group duplication)
- [ ] Git commit
- [ ] Git push

## 🟩 PHASE 1 — DESIGN SYSTEM

- [ ] Define complete color palette (8 colors + semantic tokens)
- [ ] Define typography (display + UI fonts)
- [ ] Define spacing scale
- [ ] Polish Button variants and states
- [ ] Polish Card variants
- [ ] Polish Input/Textarea with validation states
- [ ] Polish Modal with animations
- [ ] Polish Avatar with status indicators
- [ ] Polish Badge variants
- [ ] Polish Timer (linear + circular)
- [ ] Create reusable animation variants (FadeIn, SlideUp, ScaleIn, Pulse, Shake)
- [ ] Create GameProvider context (theme, reduced-motion, sound)
- [ ] Test desktop (1920px, 1440px, 1024px)
- [ ] Test tablet (768px, 834px)
- [ ] Test mobile (320px, 375px, 414px)
- [ ] Test reduced-motion preference
- [ ] Git commit
- [ ] Git push

## 🟨 PHASE 2 — LANDING PAGE

- [ ] Hero section with animated logo
- [ ] Animated character showcase (8 characters)
- [ ] Floating particle background
- [ ] "How it Works" 6-step section
- [ ] Game Modes showcase (6 cards)
- [ ] CTA section with gradient card
- [ ] Footer with links
- [ ] Page transitions
- [ ] Meta tags (Open Graph, Twitter, JSON-LD)
- [ ] Test mobile
- [ ] Test desktop
- [ ] Git commit
- [ ] Git push

## 🟧 PHASE 3 — CREATE/JOIN ROOM

- [ ] Create Room UI with all settings
- [ ] Nickname validation (1-30 chars, unique per room)
- [ ] Room code generation (6 chars, collision-resistant)
- [ ] Room code validation on Join
- [ ] Player limit enforcement
- [ ] Error states (room not found, full, started, duplicate name)
- [ ] Loading states
- [ ] Copy room code with animation
- [ ] Share via Web Share API / clipboard
- [ ] WhatsApp/Telegram deep links
- [ ] Git commit
- [ ] Git push

## 🟥 PHASE 4 — LOBBY

- [ ] Player list with avatars and nicknames
- [ ] Host indicator (crown)
- [ ] Avatar picker for players
- [ ] Nickname editing (pre-game only)
- [ ] Room code display with copy/share
- [ ] Host controls (start, kick, settings)
- [ ] Settings modal (players, rounds, mode, difficulty)
- [ ] Realtime player join/leave animations
- [ ] Host transfer on disconnect
- [ ] Lobby animations (stagger-in, ready pulse)
- [ ] Git commit
- [ ] Git push

## 🟪 PHASE 5 — GAME ENGINE

- [ ] Define game state machine (LOBBY → ROLE_REVEAL → CLUE → DISCUSSION → VOTING → RESULT → GAME_OVER)
- [ ] Define player state
- [ ] Define round state
- [ ] Implement role assignment (server-side)
- [ ] Implement secret selection from topics
- [ ] Implement Imposter selection (1 for 4-7, 2 for 8+)
- [ ] Implement synchronized timers
- [ ] Implement phase transitions
- [ ] Server validation for all actions
- [ ] RLS: Imposter never receives secret
- [ ] Git commit
- [ ] Git push

## 🟫 PHASE 6 — CLUES

- [ ] Clue UI (secret display for civilians, fake for imposter)
- [ ] Clue input with validation
- [ ] Turn system with current player indicator
- [ ] Clue display with animated cards
- [ ] Timer (30s)
- [ ] Reactions (😂 🤔 😱 👀 🔥)
- [ ] Animations for clue submission
- [ ] Git commit
- [ ] Git push

## 🟦 PHASE 7 — DISCUSSION

- [ ] Discussion UI (radial desktop, vertical mobile)
- [ ] Real-time chat with optimistic updates
- [ ] Typing indicator
- [ ] Reactions on messages
- [ ] Timer (60s with 10s warning)
- [ ] System messages (phase changes, votes)
- [ ] Message validation/sanitization
- [ ] Mobile keyboard handling
- [ ] Git commit
- [ ] Git push

## 🟩 PHASE 8 — VOTING

- [ ] Voting UI with player cards
- [ ] Player selection with animation
- [ ] Vote confirmation modal
- [ ] Vote validation (server-side)
- [ ] Vote timer (20s)
- [ ] Waiting state with live count
- [ ] Vote counting and result broadcast
- [ ] Tie handling
- [ ] Git commit
- [ ] Git push

## 🟨 PHASE 9 — REVEAL

- [ ] Suspense animation (screen darken)
- [ ] "THE IMPOSTER WAS..." typewriter
- [ ] Dramatic pause
- [ ] Imposter card flip reveal
- [ ] Winner calculation
- [ ] Victory/Defeat animation
- [ ] Confetti explosion
- [ ] Sound effects
- [ ] Auto-advance to results
- [ ] Git commit
- [ ] Git push

## 🟧 PHASE 10 — RESULTS

- [ ] Results screen with winner banner
- [ ] Imposter reveal
- [ ] Player statistics
- [ ] Rematch button (same room, new round)
- [ ] New Room button
- [ ] Share result (canvas-generated image)
- [ ] Share card with QR code
- [ ] Share actions (Download, WhatsApp, Instagram, Copy)
- [ ] Git commit
- [ ] Git push

## 🟥 PHASE 11 — MODES

- [ ] Classic (baseline)
- [ ] Desi Life (200+ Indian topics)
- [ ] Hardcore (similar-word logic)
- [ ] Chaos (modifier system)
- [ ] Image Clue (asset pipeline)
- [ ] Friends Custom (topic builder)
- [ ] Desi Expert (100+ ultra-specific topics)
- [ ] AI Chaos (later)
- [ ] Git commit after each stable mode
- [ ] Git push after each stable mode

## 🟪 PHASE 12 — CONTENT DATABASE

- [ ] Topic database structure
- [ ] Categories (Food, Bollywood, Cricket, College, Travel, Tech, Festivals, Cities, Relationships, Work, Internet, School, Childhood, Daily Life)
- [ ] Easy topics (100+)
- [ ] Medium topics (100+)
- [ ] Hard topics (100+)
- [ ] Expert topics (100+)
- [ ] Indian topics (200+)
- [ ] Validation script
- [ ] Duplicate detection

## 🟫 PHASE 13 — ADVANCED DIFFICULTY

- [ ] Easy algorithm
- [ ] Medium algorithm
- [ ] Hard algorithm (similar-word clustering)
- [ ] Expert algorithm
- [ ] Difficulty testing
- [ ] Balance gameplay

## 🔊 PHASE 14 — AUDIO

- [ ] UI sounds (click, join, notification)
- [ ] Countdown sounds (3-2-1)
- [ ] Timer warning (10s)
- [ ] Clue submit sound
- [ ] Vote sound
- [ ] Suspense buildup
- [ ] Reveal sting
- [ ] Victory jingle
- [ ] Defeat sound
- [ ] Confetti sound
- [ ] Sound settings (mute toggle)
- [ ] Reduced-motion respect
- [ ] AudioContext pooling

## 🎨 PHASE 15 — ADVANCED ANIMATIONS

- [ ] Character idle animations
- [ ] Floating background elements
- [ ] Particle effects system
- [ ] Screen transitions
- [ ] Confetti system
- [ ] Emoji reactions
- [ ] Card flips
- [ ] Role reveal animation
- [ ] Countdown animation
- [ ] Vote animations
- [ ] Elimination animation
- [ ] Winner animation
- [ ] Loading animations
- [ ] Performance testing

## 📱 PHASE 16 — MOBILE OPTIMIZATION

- [ ] 320px layout
- [ ] 360px layout
- [ ] 375px layout
- [ ] 390px layout
- [ ] 414px layout
- [ ] Tablet layout
- [ ] Desktop layout
- [ ] Touch controls (44px minimum)
- [ ] Keyboard handling (discussion, voting)
- [ ] No horizontal overflow
- [ ] Timers always visible (sticky)
- [ ] Safe area insets

## 🌐 PHASE 17 — MULTIPLAYER STABILITY

- [ ] WebSocket connection management
- [ ] Reconnection logic
- [ ] Host migration
- [ ] Player disconnect handling
- [ ] Player reconnect handling
- [ ] Room expiration cleanup
- [ ] Server synchronization
- [ ] Race condition testing

## 🔐 PHASE 18 — SECURITY

- [ ] Server-side validation for all mutations
- [ ] Input sanitization (DOMPurify)
- [ ] Rate limiting
- [ ] Room code validation
- [ ] Secret protection (RLS)
- [ ] Environment variable security
- [ ] Abuse prevention

## 👤 PHASE 19 — ACCOUNTS

- [ ] Guest account persistence
- [ ] Google OAuth
- [ ] Profile page
- [ ] Username system
- [ ] Avatar persistence
- [ ] Account linking

## 🏆 PHASE 20 — STATS

- [ ] Games played
- [ ] Games won
- [ ] Imposter wins
- [ ] Civilian wins
- [ ] Times caught
- [ ] Times fooled players
- [ ] Favorite mode
- [ ] Best streak

## 🏅 PHASE 21 — ACHIEVEMENTS

- [ ] First Catch
- [ ] Master Bluffer (10 imposter wins)
- [ ] Detective (5 catches)
- [ ] Unstoppable (5 win streak)
- [ ] Desi Expert (10 Desi wins)
- [ ] Achievement UI
- [ ] Achievement persistence

## 🏆 PHASE 22 — LEADERBOARD

- [ ] Weekly leaderboard
- [ ] Monthly leaderboard
- [ ] All-time leaderboard
- [ ] Score calculation
- [ ] Anti-farming protection

## 💰 PHASE 23 — ADS

- [ ] Ad service abstraction
- [ ] Ad provider integration
- [ ] Pre-game ad
- [ ] Frequency control
- [ ] Loading fallback
- [ ] Ad failure handling
- [ ] Analytics
- [ ] Test mode

## 👑 PHASE 24 — PREMIUM

- [ ] Premium UI
- [ ] No ads
- [ ] Premium themes
- [ ] Premium modes
- [ ] Premium cosmetics
- [ ] Subscription handling

## 🎭 PHASE 25 — COSMETICS

- [ ] Avatars
- [ ] Avatar frames
- [ ] Victory animations
- [ ] Name effects
- [ ] Room themes
- [ ] Chat effects
- [ ] Cosmetic inventory

## 🧩 PHASE 26 — CUSTOM GAMES

- [ ] Custom topic list builder
- [ ] Custom game name
- [ ] Save pack
- [ ] Share pack
- [ ] Load pack
- [ ] Validation

## 🖼️ PHASE 27 — IMAGE MODE

- [ ] Image selection
- [ ] Image loading optimization
- [ ] Image clue UI
- [ ] Imposter variation
- [ ] Mobile optimization

## 🤖 PHASE 28 — AI MODE

- [ ] AI service abstraction
- [ ] Prompt system
- [ ] Scenario generation
- [ ] Topic generation
- [ ] Difficulty generation
- [ ] Safety filtering
- [ ] Fallback content

## 📲 PHASE 29 — PWA

- [ ] Manifest
- [ ] Icons (all sizes)
- [ ] Splash screens
- [ ] Install support
- [ ] Caching strategy
- [ ] Offline fallback

## 🔎 PHASE 30 — SEO

- [ ] Metadata
- [ ] Open Graph
- [ ] Social preview cards
- [ ] Game landing pages
- [ ] Search pages
- [ ] Sitemap
- [ ] Robots.txt
- [ ] Structured data

## 📊 PHASE 31 — ANALYTICS

- [ ] Landing views
- [ ] Play clicks
- [ ] Rooms created
- [ ] Rooms joined
- [ ] Games started
- [ ] Games completed
- [ ] Shares
- [ ] Ad events
- [ ] Premium clicks

## ⚡ PHASE 32 — PERFORMANCE

- [ ] Image optimization
- [ ] Code splitting
- [ ] Lazy loading
- [ ] Animation optimization
- [ ] Network optimization
- [ ] Bundle analysis
- [ ] Mobile performance

## 🧪 PHASE 33 — QA

- [ ] 4-player test
- [ ] 6-player test
- [ ] 8-player test
- [ ] 10-player test
- [ ] 12-player test
- [ ] Host disconnect
- [ ] Player disconnect
- [ ] Refresh handling
- [ ] Reconnect handling
- [ ] Invalid room
- [ ] Full room
- [ ] Timer timeout
- [ ] Vote timeout
- [ ] Mobile test
- [ ] Desktop test

## 🚀 PHASE 34 — LAUNCH

- [ ] Production build
- [ ] Production environment
- [ ] Custom domain
- [ ] HTTPS
- [ ] Database production config
- [ ] Analytics
- [ ] Error monitoring (Sentry)
- [ ] Ads
- [ ] Privacy page
- [ ] Terms page
- [ ] Final QA
- [ ] Launch

## ✨ PHASE 35 — POLISH

- [ ] Review every screen
- [ ] Review every animation
- [ ] Review every sound
- [ ] Review mobile UI
- [ ] Remove console errors
- [ ] Remove dead code
- [ ] Fix accessibility issues
- [ ] Fix performance issues
- [ ] Improve onboarding
- [ ] Improve sharing
- [ ] Final Git commit
- [ ] Final Git push

---

**Last Updated**: Phase 0 in progress
**Next Action**: Complete Phase 0, test multiplayer prototype, commit & push