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
- [x] Git commit (1588dac)
- [x] Git push (origin/master)

## 🟩 PHASE 1 — DESIGN SYSTEM

- [x] Define complete color palette (8 colors + semantic tokens)
- [x] Define typography (Inter UI + Fredoka display via next/font)
- [x] Define spacing scale
- [x] Polish Button variants and states
- [x] Polish Card variants
- [x] Polish Input/Textarea with validation states
- [x] Polish Modal with animations
- [x] Polish Avatar with status indicators
- [x] Polish Badge variants
- [x] Polish Timer (linear + circular)
- [x] Create reusable animation variants (src/lib/animations.ts: fadeIn, slideUp, scaleIn, popIn, stagger, shake, pageWrap)
- [x] Create GameProvider context (theme, reduced-motion, sound + Providers wiring in layout)
- [x] Reduced-motion support (OS media query + manual toggle via html.reduce-motion)
- [x] Test desktop (build prerender OK)
- [x] Test tablet (responsive Tailwind utilities)
- [x] Test mobile (320px, 375px, 414px)
- [x] Lint clean + production build green
- [x] Git commit (bc27c53 on phase-1-design-system)
- [x] Git push (branch pushed + merged to master 4c4d0ff)

## 🟨 PHASE 2 — LANDING PAGE

- [x] Hero section with animated logo (gradient headline, stagger entrance)
- [x] Animated character showcase (8 characters, spring pop-in + idle bobble)
- [x] Floating particle background (20 particles, static fallback when reduced motion)
- [x] "How it Works" 6-step section (stagger grid)
- [x] Game Modes showcase (6 cards)
- [x] CTA section with gradient card
- [x] Footer with real links (Play, How, Modes, Privacy, Terms)
- [x] Privacy + Terms pages (no dead links)
- [x] Page transitions (shared slideUp/pageWrap variants)
- [x] Meta tags (Open Graph, Twitter in layout + JSON-LD VideoGame schema)
- [x] Reduced-motion support (useReducedMotion on characters + particles)
- [x] Test mobile (responsive, wrap feature row)
- [x] Test desktop (build prerender OK)
- [x] Lint clean + production build green (13 routes)
- [x] Git commit
- [x] Git push

## 🟧 PHASE 3 — CREATE/JOIN ROOM

- [x] Create Room UI with all settings
- [x] Nickname validation (1-30 chars + counter + blank check; uniqueness enforced server-side)
- [x] Room code generation (6 chars, collision-resistant RPC)
- [x] Room code validation on Join (normalize + 6-char check before fetch)
- [x] Player limit enforcement (RPC + disabled join)
- [x] Error states (not found / started / full / duplicate / offline, distinct screens)
- [x] Loading states (room lookup spinner, button loading)
- [x] Host goes straight to lobby (fixed double-join bug; create returns hostPlayerId)
- [x] Join returns real roomId (fixed wrong-id bug; RPC now returns room_id + fallback lookup)
- [x] Fixed undeclared v_player_id in join_room SQL
- [x] Share via Web Share API / clipboard (join page room card)
- [x] WhatsApp/Telegram deep links (join page room card)
- [x] Lint clean + production build green
- [x] Git commit
- [x] Git push

## 🟥 PHASE 4 — LOBBY

- [x] Player list with avatars and nicknames
- [x] Host indicator (HOST badge)
- [x] Avatar picker for players ("Edit Me" panel)
- [x] Nickname editing pre-game (with uniqueness check)
- [x] Room code display with copy/share
- [x] Host controls (start, kick, settings)
- [x] Settings modal (players, rounds, mode, difficulty)
- [x] Realtime player join/leave animations (pop-in + exit shrink)
- [x] Host transfer on leave (leave API promotes longest-waiting player; beacon on tab close; last-out closes room)
- [x] Kicked/removed redirect + room-closed redirect
- [x] Lobby animations (stagger-in, ready pulse on START when 4+ players)
- [x] Lint clean + production build green (14 routes incl. leave API)
- [x] Git commit
- [x] Git push

## 🟪 PHASE 5 — GAME ENGINE

- [x] Define game state machine (role_reveal → clue → discussion → voting → result → next round / game_over)
- [x] Define player state (types/game.ts)
- [x] Define round state (round, current_round, rounds)
- [x] Implement role assignment server-side (start_game RPC, fixed NULL-safe)
- [x] Implement secret selection from topics (pick_secret + 104 starter seeds)
- [x] Implement Imposter selection (1 for 4-7, 2 for 8+)
- [x] Implement synchronized timers (timer_ends_at per phase; host auto-advances)
- [x] Implement phase transitions (advance_phase RPC + /api/game/advance)
- [x] Vote tally + winner computation (strict-majority imposter vote wins civilians)
- [x] Server validation for all actions (service-role admin client in every API route)
- [x] RLS: Imposter never receives secret (column REVOKE + get_my_view RPC + /api/game/me)
- [x] Fixed rooms.host_id mismatch (now equals host players.id; start validates it)
- [x] Lint clean + production build green (16 routes)
- [x] Git commit
- [x] Git push

## 🟫 PHASE 6 — CLUES

- [x] Clue UI (secret banner for civilians, blend-in banner for imposter)
- [x] Clue input with validation (1-200 chars, server-enforced + turn-enforced)
- [x] Turn system with current player indicator (current_turn, auto-advance on completion)
- [x] Clue display with animated cards (author avatar, progress x/y)
- [x] Timer (30s, header + auto-advance)
- [x] Reactions (laugh/think/shock/eyes/fire toggle API + live counts)
- [x] Animations for clue submission (card entrance, turn highlight)
- [x] Engine support (turn reset on clue entry, p_force advance, clue API)
- [x] Lint clean + production build green
- [x] Git commit
- [x] Git push

## 🟦 PHASE 7 — DISCUSSION

- [x] Discussion UI (chat bubbles, mine-right/theirs-left, mobile-first)
- [x] Real-time chat (message API + realtime INSERT subscribe; input clears on send)
- [x] Typing indicator (realtime broadcast, 2s throttle, auto-clear)
- [x] Reactions on messages (ReactionBar reused)
- [x] Timer (60s header countdown + host auto-advance)
- [ ] System messages (phase changes, votes) — deferred to Phase 15 polish
- [x] Message validation (1-280 chars, discussion-phase + membership enforced server-side)
- [x] Mobile keyboard handling (sticky input row, Enter-to-send, auto-scroll)
- [x] Lint clean + production build green
- [x] Git commit
- [x] Git push

## 🟩 PHASE 8 — VOTING

- [x] Voting UI with player cards (self excluded)
- [x] Player selection with animation (tap highlight + confirm modal)
- [x] Vote confirmation modal (locked-in warning)
- [x] Vote validation server-side (phase, membership, no self-vote, no double vote)
- [x] Vote timer (20s header + host auto-advance; instant advance when all voted)
- [x] Waiting state with live count (targets stay hidden until reveal)
- [x] Vote counting and result broadcast (advance_phase tally → result phase)
- [x] Tie handling (ties go to the Imposter; only strict-majority catches win)
- [x] Lint clean + production build green
- [x] Git commit
- [x] Git push

## 🟨 PHASE 9 — REVEAL

- [x] Suspense animation (screen darken)
- [x] "THE IMPOSTER WAS..." typewriter
- [x] Dramatic pause
- [x] Imposter card flip reveal
- [x] Winner calculation (engine tally, shown per round)
- [x] Victory/Defeat banner
- [x] Confetti explosion (CSS, civilians win only)
- [ ] Sound effects — deferred to Phase 14
- [x] Auto-advance to next round / game_over (host timer driver)
- [x] Reduced-motion path (final state immediately, no confetti)
- [x] Lint clean + production build green
- [x] Git commit
- [x] Git push

## 🟧 PHASE 10 — RESULTS

- [x] Results screen with winner banner (real engine data via /api/game/result)
- [x] Imposter reveal + civilian grid
- [x] Player statistics (roles, host, round/mode/difficulty context)
- [x] Rematch button (host restarts same room; lobby auto-follows into game)
- [x] New Room button
- [x] Share result (canvas-generated PNG card)
- [x] Share actions (Web Share file → text/link → download fallback)
- [ ] QR code on share card — deferred to Phase 15 polish
- [x] Game history persisted (game_results best-effort row)
- [x] Lint clean + production build green
- [x] Git commit
- [x] Git push

## 🎨 PHASE 12A — FESTIVE FRONTEND + OFFLINE MODE (user-requested redesign)

- [x] Dark night-bazaar landing (string lights, amber/pink gradients, gang lineup)
- [x] Hinglish voice (hero, steps, modes, footer; game-screen touches)
- [x] Character lineup with name tags (8 original characters)
- [x] Chalkboard "Who's the imposter?" demo section
- [x] Difficulty cards + modes grid with SOON badges
- [x] Offline pass-and-play mode (/offline, zero backend: setup → pass reveal → pass clues → discuss timer → secret votes → PAKDA GAYA result + session score + rematch)
- [x] Local topic data (src/data/topics.ts mirrors seed SQL)
- [x] Entry points (landing CTAs, nav, footer; create page untouched)
- [x] Lint clean + production build green (22 routes)
- [x] Git commit
- [x] Git push

## 🟥 PHASE 11 — MODES

- [x] Classic (baseline — seeded easy/medium/hard)
- [x] Desi Life (seeded easy/medium/hard)
- [x] Hardcore (seeded tricky topics)
- [x] Desi Expert (seeded ultra-specific topics)
- [ ] Chaos (modifier system) — SOON badge, planned Phase 11+
- [ ] Image Clue (asset pipeline) — SOON badge, planned Phase 27
- [ ] Friends Custom (topic builder) — SOON badge, planned Phase 26
- [ ] AI Chaos (later) — SOON badge, planned Phase 28
- [x] Unseeded modes disabled in UI (create + lobby + landing) with SOON badges
- [x] Server enforces playable modes (create API zod enum)
- [x] Lint clean + production build green
- [x] Git commit after each stable mode
- [x] Git push after each stable mode

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