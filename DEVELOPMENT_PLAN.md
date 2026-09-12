# OpenCode Development Rules

🚨 **OPENCODE DEVELOPMENT RULES**

You are developing Guess The Imposter, a production-quality multiplayer web game.

## RULE 1 — WORK PHASE BY PHASE

Never implement multiple phases at once.

When instructed to implement a phase, implement ONLY that phase.

Do not automatically continue to the next phase.

## RULE 2 — READ THE PROJECT FIRST

Before modifying code:

- Read README.md
- Read TODO.md
- Read DEVELOPMENT_PLAN.md
- Inspect the existing project structure
- Inspect relevant existing components
- Understand the current architecture

Do not blindly overwrite existing work.

## RULE 3 — PRESERVE WORKING FEATURES

Never break previously completed functionality while implementing a new phase.

If an existing component can be reused, reuse it.

Do not duplicate functionality unnecessarily.

## RULE 4 — NO PLACEHOLDER GAMEPLAY

Do not create fake buttons that appear functional but do nothing.

If a feature cannot yet be implemented because a later phase is required, create a clean disabled state or appropriate placeholder and document it in TODO.md.

## RULE 5 — MOBILE FIRST

Every screen must work on:

- 320px
- 360px
- 375px
- 390px
- 414px
- Tablet (768px, 834px)
- Desktop (1024px+)

Do not finish a feature only for desktop.

## RULE 6 — ANIMATION QUALITY

The game must feel alive.

Use animation for:

- Transitions
- Buttons
- Cards
- Characters
- Role reveal
- Voting
- Results
- Notifications
- Reactions

However, animations must never prevent users from playing.

Respect reduced-motion preferences.

## RULE 7 — GAME SECURITY

Never trust the client for sensitive game state.

The Imposter must not receive the secret through client state, HTML, unnecessary API responses, or publicly accessible data.

Validate important game actions server-side.

## RULE 8 — ERROR HANDLING

Every network operation must have:

- Loading state
- Success state
- Error state
- Retry behavior where appropriate

Never leave users staring at an unexplained blank screen.

## RULE 9 — NO SECRET EXPOSURE

Never place API keys, database passwords, private tokens, or other secrets in client-side code.

Use environment variables.

Update .env.example whenever a new environment variable is introduced.

## RULE 10 — ACCESSIBILITY

Use:

- Keyboard navigation
- Visible focus states
- Readable contrast
- Semantic HTML
- Accessible buttons
- Accessible labels
- Reduced-motion support

## RULE 11 — CODE QUALITY

Prefer:

- TypeScript
- Reusable components
- Clear types
- Small functions
- Meaningful names
- Minimal duplication
- Clear game-state architecture

Avoid unnecessary dependencies.

## RULE 12 — TEST BEFORE FINISHING

Before declaring a phase complete:

- Run the development server
- Run type checking
- Run linting
- Run tests if available
- Inspect the browser console
- Test the feature manually
- Test mobile layout
- Fix discovered issues

## RULE 13 — UPDATE TODO.md

When a task is completed:

Change `- [ ]` to `- [x]`

Do not mark something complete if it has not actually been tested.

## RULE 14 — UPDATE README.md

If the architecture, setup process, feature list, environment variables, or game behavior changes materially, update README.md.

## RULE 15 — GIT CHECKPOINT

At the end of each phase:

STOP.

Do not automatically continue.

Report:

- Files changed
- Features implemented
- Tests performed
- Bugs fixed
- TODO items completed
- Remaining issues

Then wait for the developer to test and commit/push.

## RULE 16 — NEVER MASSIVE REWRITE

Do not rewrite the entire project simply because a new phase begins.

Make incremental changes.

## RULE 17 — DO NOT INVENT UNNECESSARY FEATURES

Follow the development plan.

If you identify an excellent additional feature, add it to a FUTURE_IDEAS.md file instead of silently changing scope.

## RULE 18 — PRODUCT QUALITY

The final product should not feel like a student demo.

It should feel like a polished consumer game.

Prioritize:

- Instant usability
- Visual polish
- Responsiveness
- Satisfying feedback
- Reliable multiplayer
- Fast loading
- Clear UX
- Fun gameplay

## RULE 19 — DO NOT USE COPYRIGHTED ASSETS

Use original assets, properly licensed assets, or generated assets that are safe to use.

Do not copy characters, logos, artwork, sounds, or UI from existing games.

## RULE 20 — STOP AFTER THE REQUESTED PHASE

This is the most important rule.

If the developer says:

"Implement Phase 4."

Implement Phase 4.

Do NOT implement Phase 5.

At the end, provide a concise implementation report and wait for the next instruction.

---

# COMPLETE BUILD ORDER

## Phase 0: Foundation + Multiplayer Prototype
- Next.js + TypeScript + Tailwind + ESLint
- Supabase setup with Realtime
- Database schema (rooms, players, game_state, messages, reactions, topics, game_results, topic_packs)
- Shared types (types/game.ts)
- Create Room API + page
- Join Room API + page
- Lobby with realtime player list
- Basic Play page structure
- Results page structure
- Design system components (Button, Card, Input, Modal, Avatar, Badge, Timer, Toast, GameHeader)
- Landing page with animations
- Git commit: "phase 0: foundation + realtime prototype"

## Phase 1: Design System
- Complete color palette (8 colors + semantic)
- Typography (display + UI fonts)
- Spacing scale
- All component variants polished
- Animation variants
- GameProvider context
- Cross-device testing
- Git commit: "phase 1: design system"

## Phase 2: Landing Page
- Hero with animated logo
- 8 animated characters
- Particle background
- How it Works (6 steps)
- Game Modes showcase
- CTA section
- Footer
- Meta tags
- Git commit: "phase 2: animated landing page"

## Phase 3: Create/Join Room
- Create Room UI with all settings
- Nickname validation
- Room code generation
- Join Room with validation
- Error states
- Loading states
- Copy/share room code
- Git commit: "phase 3: create join room"

## Phase 4: Lobby
- Player list with avatars
- Host indicator
- Avatar picker
- Nickname editing
- Room code display
- Host controls
- Settings modal
- Realtime animations
- Host transfer
- Git commit: "phase 4: multiplayer lobby"

## Phase 5: Game Engine
- State machine
- Role assignment (server)
- Secret selection
- Imposter selection
- Synchronized timers
- Phase transitions
- Server validation
- RLS for secret protection
- Git commit: "phase 5: core game engine"

## Phase 6: Clues
- Clue UI (civilian vs imposter)
- Clue input
- Turn system
- Clue display
- Timer
- Reactions
- Animations
- Git commit: "phase 6: clue round"

## Phase 7: Discussion
- Discussion UI
- Real-time chat
- Typing indicator
- Reactions
- Timer
- System messages
- Mobile keyboard
- Git commit: "phase 7: discussion phase"

## Phase 8: Voting
- Voting UI
- Player selection
- Confirmation modal
- Vote validation
- Timer
- Waiting state
- Vote counting
- Tie handling
- Git commit: "phase 8: voting system"

## Phase 9: Reveal
- Suspense animation
- Typewriter text
- Dramatic pause
- Card flip reveal
- Winner calculation
- Victory/defeat animation
- Confetti
- Sound effects
- Git commit: "phase 9: dramatic reveal"

## Phase 10: Results
- Results screen
- Player stats
- Rematch
- New Room
- Share result (canvas)
- Share actions
- Git commit: "phase 10: results and rematch"

## Phase 11+: Modes & Content
- Classic (done)
- Desi Life (200+ topics)
- Hardcore (similar-word logic)
- Chaos (modifiers)
- Image Clue (assets)
- Friends Custom (builder)
- Desi Expert (100+ topics)
- AI Chaos (later)
- Git commit after each mode

## Remaining Phases (12-35)
See TODO.md for complete list

---

# MVP SCOPE (Phases 0-10)

**Playable Core Loop**: 4 friends → create room → join → roles → clues → discuss → vote → reveal → laugh → rematch

**Timeline**: 2-3 weeks

**Tech**: Next.js + Supabase Realtime + Framer Motion + Tailwind

---

# ARCHITECTURE DECISIONS

## State Management
- Server-authoritative game state via Supabase Realtime
- Client subscribes to `game_state` and `players` tables
- Optimistic UI for chat, confirmed by server

## Security Model
- RLS policies on all tables
- Imposter never receives `secret` column
- All mutations via Edge Functions or RPC
- Rate limiting on API routes

## Real-time Sync
- `rooms` - room metadata, settings
- `players` - player list, roles, connection status
- `game_state` - phase, round, secret, imposters, timer, votes, clues
- `messages` - discussion chat
- `reactions` - emoji reactions on clues/messages

## Animation Strategy
- Framer Motion for complex sequences (reveal, transitions)
- CSS animations for micro-interactions (buttons, cards)
- Lottie for character animations (future)
- Respect `prefers-reduced-motion`

## Mobile Strategy
- Mobile-first CSS (Tailwind responsive)
- Touch targets ≥ 44px
- Virtual keyboard handling (viewport units)
- Sticky timers/header
- Safe area insets

---

# ENVIRONMENT VARIABLES

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# App
NEXT_PUBLIC_APP_URL=
NODE_ENV=
```

---

# DATABASE SCHEMA SUMMARY

| Table | Purpose |
|-------|---------|
| `rooms` | Room metadata, settings, status |
| `players` | Player list, nicknames, avatars, roles |
| `game_state` | Phase, round, secret, imposters, timer, votes, clues |
| `messages` | Discussion chat |
| `reactions` | Emoji reactions |
| `topics` | Word database by mode/difficulty |
| `game_results` | Game history for stats |
| `topic_packs` | Custom topic packs |

---

# API ENDPOINTS

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/rooms/create` | Create new room |
| POST | `/api/rooms/join` | Join existing room |
| GET | `/api/rooms/[code]` | Get room info |
| POST | `/api/game/start` | Start game (host only) |

---

# COMPONENT ARCHITECTURE

```
src/components/ui/
├── Button.tsx          # All button variants
├── Card.tsx            # Card + subcomponents
├── Input.tsx           # Input, Textarea, Label
├── Modal.tsx           # Modal + ConfirmModal
├── Avatar.tsx          # Avatar + AvatarPicker
├── Badge.tsx           # Badge + RoleBadge + PhaseBadge
├── Timer.tsx           # Timer + CircularTimer
├── Toast.tsx           # ToastProvider + hooks
├── GameHeader.tsx      # Game header with timer
└── index.ts            # Exports
```

---

# TESTING CHECKLIST PER PHASE

- [ ] `npm run dev` starts without errors
- [ ] `npm run build` completes successfully
- [ ] `npm run typecheck` passes
- [ ] `npm run lint` passes
- [ ] No console errors in browser
- [ ] Feature works on mobile (320px, 375px, 414px)
- [ ] Feature works on desktop
- [ ] Multiplayer sync verified (2+ browser tabs)
- [ ] Reconnection works
- [ ] Accessibility basics (focus, contrast, labels)

---

# DEPLOYMENT CHECKLIST

- [ ] Vercel project connected
- [ ] Supabase production project
- [ ] Environment variables set in Vercel
- [ ] Custom domain configured
- [ ] HTTPS enforced
- [ ] CSP headers
- [ ] Sentry error monitoring
- [ ] Analytics configured
- [ ] Privacy/Terms pages live