# Guess The Imposter 🇮🇳

Play. Talk. Bluff. Suspect. Vote.

A colorful, animated, Indian-inspired social deduction party game for the web.

## 🎮 Core Gameplay

1. **Create or join a room** - Share a 6-character code with friends
2. **Choose a nickname & avatar** - Pick from 8 original characters
3. **Receive a secret role** - Civilian knows the secret, Imposter doesn't
4. **Give clues** - Describe the secret without being too obvious
5. **Discuss** - Chat, accuse, defend, and read the room
6. **Vote** - Choose who you think is the Imposter
7. **Reveal** - Dramatic animation reveals the Imposter
8. **Rematch or share** - Play again or share your victory

## 🎯 Game Modes

| Mode | Description |
|------|-------------|
| 🔍 **Classic** | Standard Imposter game |
| 🇮🇳 **Desi Life** | Indian topics: chai, cricket, Bollywood, weddings |
| 🧠 **Hardcore** | Similar, tricky topics requiring subtle clues |
| 🤪 **Chaos** | Random rule twists each round |
| 🖼️ **Image Clue** | Picture-based clues |
| 👥 **Friends Custom** | Your own topic packs |
| 🎭 **Desi Expert** | Ultra-specific Indian cultural references |
| 🤖 **AI Chaos** | AI-generated scenarios (later) |

## 🏆 Difficulty Levels

- 🟢 **Easy** - Obvious topics for beginners
- 🟡 **Medium** - Normal gameplay
- 🔴 **Hard** - Similar concepts requiring deduction
- 🟣 **Expert** - Very subtle, culturally specific topics

## 🎨 Design Direction

- **Vibrant Indian-inspired palette**: Saffron, Royal Blue, Pink, Purple, Turquoise, Yellow, Green, Cream
- **Original cartoon characters**: 8 unique personalities (Arjun, Priya, Rahul, Aisha, Kabir, Meera, Rohan, Simran)
- **Festival/celebration aesthetic**: Rangoli patterns, marigold colors, colorful lights
- **Fully animated**: Framer Motion + CSS animations for every interaction
- **Mobile-first**: Works on 320px to desktop
- **Sound effects**: Satisfying audio feedback for all actions

## 🏗️ Technology Stack

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **Animation**: Framer Motion, CSS animations
- **Backend**: Next.js API Routes, Supabase (PostgreSQL + Realtime)
- **Real-time**: Supabase Realtime for multiplayer sync
- **Deployment**: Vercel (frontend), Supabase (database/backend)
- **Auth**: Anonymous play first, Google login later

## 📁 Project Structure

```
guess-the-imposter/
├── app/
│   ├── (game)/           # Game route group
│   │   ├── create/       # Create room page
│   │   ├── join/[code]/  # Join room page
│   │   ├── lobby/        # Multiplayer lobby
│   │   ├── play/         # Main game screen
│   │   └── results/      # Game results
│   ├── api/              # API routes
│   │   ├── rooms/        # Room CRUD
│   │   └── game/         # Game actions
│   ├── layout.tsx        # Root layout
│   ├── page.tsx          # Landing page
│   └── globals.css       # Global styles
├── components/
│   ├── ui/               # Design system primitives
│   ├── game/             # Game-specific components
│   └── layout/           # Layout components
├── lib/
│   ├── supabase/         # Supabase clients
│   ├── game/             # Game logic, state machine
│   ├── audio/            # Sound management
│   └── analytics/        # Event tracking
├── hooks/                # Custom React hooks
├── types/                # TypeScript types
├── data/                 # Topic databases
├── public/               # Static assets
├── supabase/
│   ├── migrations/       # Database schema
│   └── functions/        # Edge Functions
├── styles/               # Additional styles
└── tests/                # Test files
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm/pnpm/yarn
- Supabase account

### Installation

```bash
# Clone the repository
git clone <repo-url>
cd guess-the-imposter

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your Supabase credentials
```

### Supabase Setup

1. Create a new Supabase project
2. Run the migration in `supabase/migrations/001_initial_schema.sql`
3. Enable Realtime for tables: `rooms`, `players`, `game_state`, `messages`, `reactions`
4. Copy your project URL and anon key to `.env.local`

### Development

```bash
# Start development server
npm run dev

# Run type checking
npm run typecheck

# Run linting
npm run lint

# Run tests
npm test
```

Open [http://localhost:3000](http://localhost:3000) to play.

## 🎮 Game Flow

```
LANDING PAGE
     ↓
CREATE / JOIN ROOM
     ↓
PLAYER LOBBY (real-time)
     ↓
GAME SETTINGS (host only)
     ↓
START GAME
     ↓
ROLE REVEAL (5s animation)
     ↓
CLUE ROUND (30s per player)
     ↓
DISCUSSION (60s free chat)
     ↓
VOTING (20s)
     ↓
DRAMATIC REVEAL
     ↓
RESULTS & SHARE
     ↓
REMATCH / NEW ROOM
```

## 🔐 Security

- **Server-authoritative**: Secret word never sent to Imposter's client
- **RLS Policies**: Row Level Security on all tables
- **Input validation**: Zod schemas on all API routes
- **Rate limiting**: On mutating endpoints
- **No secrets in frontend**: All sensitive ops via Edge Functions

## 📱 Mobile Support

- Responsive down to 320px
- Touch-friendly targets (44px minimum)
- Safe area inset handling
- Virtual keyboard management
- PWA ready (manifest, icons, offline fallback)

## 💰 Monetization (Planned)

- **Free**: Watch ad before game
- **Premium (₹49/mo)**: No ads, custom rooms, advanced modes, exclusive cosmetics
- **Cosmetics**: Avatar frames, victory animations, room themes
- **No gameplay advantages sold**

## 📈 Analytics Events

- `landing_view`, `play_clicked`, `room_created`, `room_joined`
- `game_started`, `game_completed`, `game_shared`
- `ad_started`, `ad_completed`, `premium_clicked`

## 🧪 Quality Standards

Every phase must pass:
- ✅ TypeScript compilation
- ✅ ESLint checks
- ✅ Console error-free
- ✅ Mobile responsive (320px, 375px, 414px)
- ✅ Multiplayer synchronization
- ✅ Reconnection handling
- ✅ Accessibility (WCAG AA)

## 📄 License

MIT License - feel free to use for learning or commercial projects.

---

**Built with ❤️ for Indian parties everywhere** 🇮🇳