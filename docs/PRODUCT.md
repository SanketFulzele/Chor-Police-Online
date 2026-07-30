# Chor Police Online

A modern multiplayer version of the classic Indian game **Chor Police** (also known as *Raja Mantri Chor Sipahi* / *Raja Mantri Chor Daku*). Built as a real-time web game with a polished, AAA-quality gaming interface.

---

## Project Overview

Chor Police Online brings the childhood paper-chit game to the browser. Four players join a room, receive hidden roles each round, and play through a structured flow of deduction and deception. The game is fully real-time using WebSockets — no page refreshes, no polling.

The application is split into a React frontend and a Node.js backend, communicating exclusively through Socket.IO events. The server is the authoritative source of all game state; clients are views that render server events.

---

## Vision

To create the definitive digital version of Chor Police — a game that looks, feels, and plays like a modern multiplayer title rather than a CRUD app. The goal is accessibility: anyone with a browser and a link can play with friends instantly, no accounts required.

---

## Technical Stack

| Layer      | Technology                                   |
| ---------- | -------------------------------------------- |
| Language   | TypeScript (strict mode throughout)          |
| Frontend   | React 19, Vite 8                             |
| Styling    | Tailwind CSS v4 (via `@tailwindcss/vite`)    |
| Routing    | React Router v7                              |
| State      | Zustand v5                                   |
| Forms      | React Hook Form v7                           |
| Animation  | Framer Motion v12                            |
| Backend    | Node.js, Express                             |
| Realtime   | Socket.IO v4                                 |
| Storage    | Browser Local Storage (game history, stats)  |

---

## Folder Structure

```
chor-police-online/
├── src/                              # Frontend (React + Vite)
│   ├── components/
│   │   ├── ui/                       # Reusable primitives
│   │   │   ├── Button.tsx            # 4 variants: primary, secondary, ghost, gold
│   │   │   ├── Card.tsx              # Glassmorphism container
│   │   │   └── Input.tsx             # Form input with label + error state
│   │   └── layout/
│   │       └── AppLayout.tsx         # Page wrapper with ambient background
│   ├── pages/
│   │   ├── Home.tsx                  # Landing page (Create / Join)
│   │   ├── CreateRoom.tsx            # Host room creation form
│   │   ├── JoinRoom.tsx              # Player join form with validation
│   │   ├── Room.tsx                  # Real-time waiting lobby
│   │   └── Game.tsx                  # Game placeholder (Batch 3+)
│   ├── hooks/
│   │   ├── useSocket.ts              # Socket connection lifecycle
│   │   └── useRoom.ts               # Room CRUD operations
│   ├── game/                          # Pure game engine (no React/IO deps)
│   │   ├── index.ts                   # Barrel export
│   │   ├── types.ts                   # Game-specific types
│   │   ├── gameEngine.ts              # Orchestrator
│   │   ├── gameStateMachine.ts        # Phase definitions
│   │   ├── roleDistributor.ts         # Fair role rotation
│   │   ├── scoreCalculator.ts         # Round scoring
│   │   ├── roundManager.ts            # Round tracking
│   │   ├── winnerCalculator.ts        # Leaderboard
│   │   ├── statisticsManager.ts       # Player stats
│   │   └── validators.ts              # Game action validations
│   ├── store/
│   │   ├── socketStore.ts            # Connection status + socket instance
│   │   └── roomStore.ts              # Room + player state
│   ├── utils/                        # (empty — future utilities)
│   ├── types/
│   │   └── index.ts                  # GameRole, GamePhase, Player, Room, etc.
│   ├── constants/
│   │   └── game.ts                   # ROLE_POINTS, SCORING, PHASE_DURATIONS
│   ├── App.tsx                       # React Router setup
│   ├── main.tsx                      # Entry point
│   ├── index.css                     # Tailwind CSS v4 + custom theme tokens
│   └── vite-env.d.ts                 # Vite type declarations
├── server/                           # Backend (Express + Socket.IO)
│   ├── package.json
│   ├── tsconfig.json
│   └── src/
│       ├── index.ts                  # Server entry + Socket.IO event handlers
│       ├── roomManager.ts            # Room CRUD, code generation, player mgmt
│       └── types.ts                  # Server-side type definitions
├── docs/
│   ├── PRODUCT.md                    # This file
│   └── DEVELOPMENT.md                # Development diary
├── public/
│   └── favicon.svg
└── README.md
```

---

## Current Application Flow

The following flow describes the user experience as implemented. Steps marked with **[PLANNED]** are designed but not yet built.

```
1. HOME SCREEN
   Route: /
   ─────────────────────────────────────────────
   - Landing page with title "Chor Police"
   - Two buttons: Create Room, Join Room
   - Role emoji display (👑 👮 🥷 🔫)
   - All glassmorphism cards with gold accents

2. CREATE ROOM
   Route: /create
   ─────────────────────────────────────────────
   - Host enters player name
   - Clicks Create → socket emits "create-room"
   - Server generates 6-character room code
   - Server creates Room object with host as Player
   - Client receives "room-created" event
   - Redirects to Waiting Room (/room?code=XYZ123)

3. JOIN ROOM
   Route: /join
   ─────────────────────────────────────────────
   - Player enters name and room code
   - Clicks Join → socket emits "join-room"
   - Server validates:
       • Room exists               → "Room not found"
       • Room has space            → "Room is full"
       • Game has not started      → "Game already started"
       • Name is unique            → "Name already taken"
   - On success: receives "room-joined" event
   - On error: receives "error-message" with message + code
   - Redirects to Waiting Room on success

4. WAITING LOBBY
   Route: /room?code=XYZ123
   ─────────────────────────────────────────────
   - REAL TIME — all players see live updates
   - Room code displayed prominently with copy button
   - Player list with animated cards:
       • Colored avatar (initial letter)
       • Player name
       • "(You)" label for self
       • Host badge (gold) for host
       • Connection indicator (green/gray dot)
       • Ready indicator (green/gray dot)
       • "Disconnected" label if player drops
   - Empty player slots shown as dashed placeholders
   - Ready/Not Ready toggle button (non-host players)
   - Start Game button (host only):
       • Disabled until 4 players AND all ready
       • Shows dynamic message:
         - "Waiting for X more players..."
         - "Waiting for all players to be ready"
         - "Start Game" (ready to start)
   - Leave Room button (cleans up on server)
   - Connection status indicator (Connected/Connecting/Disconnected)

5. GAME SCREEN [PLANNED — Batch 3]
   Route: /game
   ─────────────────────────────────────────────
   - Currently a placeholder
   - Shows "Game Starting..." with player names and round number
   - Host clicked "Start Game" → server transitions to "shuffling" phase
   - All players redirected to /game simultaneously via socket event

6. CARD DISTRIBUTION [PLANNED — Batch 3]
   ─────────────────────────────────────────────
   (Not yet implemented)

7. PLAYER REVEAL [PLANNED — Batch 3]
   ─────────────────────────────────────────────
   (Not yet implemented)

8. RAJA → MANTRI → CHOR [PLANNED — Batch 4]
   ─────────────────────────────────────────────
   (Not yet implemented)

9. RESULTS & SCORING [PLANNED — Batch 4]
   ─────────────────────────────────────────────
   (Not yet implemented)
```

---

## Game Engine Architecture

The Game Engine is a pure TypeScript layer that contains **all gameplay rules and logic**. It has zero dependencies on React, Socket.IO, or Express. This separation ensures game rules can be tested, reasoned about, and changed without touching UI or network code.

### File Structure

```
src/game/
├── index.ts                 # Barrel export
├── types.ts                 # Game-specific type definitions
├── gameEngine.ts            # Central orchestrator
├── gameStateMachine.ts      # Phase definitions and transitions
├── roleDistributor.ts       # Fair role rotation algorithm (future)
├── scoreCalculator.ts       # Round scoring logic (future)
├── roundManager.ts          # Round tracking and state (future)
├── winnerCalculator.ts      # Leaderboard and winner logic (future)
├── statisticsManager.ts     # Per-player statistics (future)
└── validators.ts            # Game action validations
```

### File Responsibilities

| File | Responsibility |
|------|---------------|
| `types.ts` | All game-specific interfaces: `GamePhase`, `GameState`, `RoundResult`, `RoleDistribution`, `ScoreInput`, `ScoreOutput`, `GameResult`, `LeaderboardEntry`, `ValidationResult` |
| `gameEngine.ts` | Orchestrator that will start/end rounds, advance phases, and coordinate the full game flow. Currently provides `createGameState()`, `advancePhase()`, `startNextRound()`, `recordRoundResult()` |
| `gameStateMachine.ts` | Defines all 12 game phases in order (`waiting → shuffling → card-distribution → card-reveal → card-hidden → raja-calling → mantri-reveal → guessing → reveal-roles → score-update → leaderboard → finished`) and legal transitions between them. Exports `canTransition()`, `getNextPhase()`, `getLegalTransitions()` |
| `roleDistributor.ts` | Will implement the deficit-based fair role rotation algorithm. Currently defines interfaces and explains the algorithm in comments. See `roleDistributor.ts:1-30` for the detailed algorithm design |
| `scoreCalculator.ts` | Will implement scoring based on Mantri's guess. Currently has typed function signatures only |
| `roundManager.ts` | Will track round number, completed rounds, and current phase. Defines `RoundState` interface |
| `winnerCalculator.ts` | Will determine winner and build leaderboard. Includes tie-breaking logic placeholder |
| `statisticsManager.ts` | Will calculate per-player stats (games played, wins, role counts, guess accuracy) |
| `validators.ts` | Central validation for all game actions: `canStartGame()`, `canRevealCard()`, `canGuess()`, `canEndRound()`, `canTransitionPhase()` |

### Architecture Rules

1. **React components must never contain gameplay rules.** Components render UI and call hooks; they do not calculate scores, distribute roles, or decide winners.
2. **Socket handlers must never calculate scores, distribute roles, or decide winners.** Socket event handlers receive events, call the Game Engine, and broadcast results.
3. **Zustand stores must never contain game logic.** Stores hold state; they do not implement game rules.
4. **The Game Engine is the single source of truth for all game rules.** Any change to how the game works (scoring, role distribution, phase transitions) happens only in `src/game/`.

### Future Implementation

| Batch | Engine Files Used |
|-------|------------------|
| Batch 3 | `gameEngine.ts`, `gameStateMachine.ts`, `roleDistributor.ts`, `roundManager.ts`, `validators.ts` |
| Batch 4 | `scoreCalculator.ts`, `validators.ts` |
| Batch 5 | `winnerCalculator.ts`, `statisticsManager.ts`, `gameEngine.ts` |

---

## Multiplayer Architecture

### Server as Source of Truth
The server owns all game state. Clients never hold authoritative state — they receive updates via socket events and render accordingly. This prevents desyncs and ensures all players see identical state.

### Room Lifecycle

```
1. CREATE  → Host sends "create-room" with name
           → Server generates unique 6-char code
           → Room stored in Map (in-memory)
           → Host joins Socket.IO room

2. JOIN    → Player sends "join-room" with code + name
           → Server validates (exists, not full, not started, name unique)
           → Player added to room.players
           → Player joins Socket.IO room
           → "room-updated" broadcast to all in room

3. UPDATE  → Any state change triggers "room-updated"
           → All connected clients receive full room object
           → Zustand store updated on each client

4. LEAVE   → Player sends "leave-room" or disconnects
           → Player removed from room.players
           → If last player: room destroyed
           → If host left: host transferred to next connected
           → "room-updated" broadcast

5. DESTROY → All players left → room deleted from Map
           → "room-destroyed" sent to any remaining listeners

6. START   → Host sends "start-game"
           → Server validates: 4 players, all ready, is host
           → Room phase set to "shuffling"
           → "game-starting" event to all players
           → All clients navigate to /game
```

### Player Lifecycle

```
1. Host creates room → Player object created with:
   - id (UUID, stable across reconnects)
   - socketId (changes on reconnect)
   - name, isHost=true, avatarColor, joinedAt
   
2. Player joins room → Same Player shape, isHost=false

3. Player toggles Ready → isReady toggled server-side → broadcast

4. Player disconnects → isConnected = false
   - If disconnected player was host → host transferred
   - Visual indicator shown to remaining players

5. Player reconnects → Socket.IO reconnects automatically
   - Server matches socket by... (reconnect logic TBD)

6. Player leaves → Player removed from room.players
   - Cleanup propagates to remaining clients
```

### Host Responsibilities

- Only the host can start the game
- If host disconnects, host is transferred to the next connected player (by join order)
- The new host receives a "host-changed" event
- There is no kick functionality yet

### Ready System

- Each player has `isReady: boolean`
- Players toggle via "player-ready" / "player-unready" events
- Host does not need to be ready to start
- Start Game requires: exactly 4 players AND all non-host players ready
- Ready state does NOT persist across page navigation

### Room Validation Rules

| Condition                  | Error Message            |
| -------------------------- | ------------------------ |
| Room code doesn't exist    | "Room not found"         |
| Room already has 4 players | "Room is full"           |
| Game has started           | "Game already started"   |
| Player name already taken  | "Name already taken"     |
| Name shorter than 2 chars  | "Name must be at least 2 characters" |

---

## WebSocket Communication

### Connection
- Client connects to server at `http://localhost:3001` (configurable via `VITE_SERVER_URL`)
- Transport: WebSocket with polling fallback
- Reconnection: enabled, infinite attempts, 1s–5s delay ramp

### Client → Server Events

| Event           | Payload                  | When                          |
| --------------- | ------------------------ | ----------------------------- |
| `create-room`   | `{ playerName }`         | Host clicks Create            |
| `join-room`     | `{ roomCode, playerName }` | Player clicks Join          |
| `leave-room`    | `{}`                     | Player clicks Leave           |
| `player-ready`  | `{}`                     | Player clicks Ready           |
| `player-unready`| `{}`                     | Player clicks Not Ready       |
| `start-game`    | `{}`                     | Host clicks Start Game        |

### Server → Client Events

| Event             | Payload                        | When                              |
| ----------------- | ------------------------------ | --------------------------------- |
| `room-created`    | `{ roomCode, playerId, room }` | Room created successfully         |
| `room-joined`     | `{ room, playerId }`           | Joined room successfully          |
| `room-updated`    | `{ room }`                     | Any room state change (broadcast) |
| `room-destroyed`  | `{}`                           | Last player left                  |
| `host-changed`    | `{ newHostId }`                | Host transferred on disconnect    |
| `game-starting`   | `{ room }`                     | Host started the game             |
| `error-message`   | `{ message, code }`            | Validation failure                |

Events are named and specific — no generic event dispatch. The `room-updated` event is broadcast to all players in a room after every state mutation (player join, leave, ready toggle, disconnect) so all clients stay synchronized.

---

## State Management

| Concern          | Store          | Key State                               |
| ---------------- | -------------- | --------------------------------------- |
| Socket status    | `socketStore`  | `socket`, `status` (disconnected/connecting/connected) |
| Room + players   | `roomStore`    | `room`, `playerId`                      |
| Form state       | React Hook Form| Local form state only                   |
| Route params     | URL search     | Room code passed via query string       |

Stores are updated only in response to socket events. Components read from stores via hooks and never write directly to room state. The `useRoom` hook provides a clean API: `createRoom(name)`, `joinRoom(code, name)`, `leaveRoom()`, `toggleReady()`, `startGame()`.

---

## UI/UX Principles

### Visual Style
- **Dark theme** as the only theme (base: `#0a0a0f`)
- **Glassmorphism** — frosted glass surfaces (`backdrop-filter: blur(20px)`) with translucent backgrounds
- **Gold accents** (`#ffd700`) for headings, primary actions, and highlights
- **Royal purple** (`#7c3aed`) for interactive elements (buttons, focus states)
- **Radial gradient backgrounds** for depth (subtle purple/gold glows)
- **Large typography** with clean sans-serif (Inter)
- **Spacious padding** — generous whitespace around all content
- **Consistent border radius** — `16px` for cards, `12px` for buttons, `10px` for inputs

### Design Tokens (defined in `index.css` via `@theme`)
| Token              | Value      | Usage                        |
| ------------------ | ---------- | ---------------------------- |
| `--color-background` | `#0a0a0f` | Page background             |
| `--color-gold`     | `#ffd700`  | Primary actions, highlights  |
| `--color-royal`    | `#7c3aed`  | Interactive elements         |
| `--color-emerald`  | `#10b981`  | Success / ready states       |
| `--color-rose`     | `#ef4444`  | Errors / disconnected states |

### Utility Classes
| Class              | Purpose                              |
| ------------------ | ------------------------------------ |
| `.glass`           | Standard glassmorphism surface       |
| `.glass-strong`    | Higher opacity glass surface         |
| `.glass-hover`     | Glass surface with hover effect      |
| `.gold-gradient`   | Gold gradient text effect            |
| `.text-glow`       | Gold text glow shadow                |
| `.bg-glow`         | Purple glow box-shadow               |
| `.particle-bg`     | Fixed background with radial glows   |

### Active Animations
| Context             | Framer Motion                      |
| ------------------- | ---------------------------------- |
| Page entry          | `fade + slide up` (0.4–0.6s)       |
| Card entry          | `fade + slide left` (staggered)    |
| Button interaction  | `scale` on hover/tap               |

### Responsive Design
| Breakpoint | Target              | Behavior                          |
| ---------- | ------------------- | --------------------------------- |
| < 640px    | Mobile phones       | Single column, full-width cards   |
| 640–1024px | Tablets             | Same layout, slightly larger      |
| > 1024px   | Desktop             | Centered max-width (448px) layouts |

- All pages fully usable on 375px wide screens
- Touch targets at least 44x44px
- No horizontal scrolling on any device

---

## Current Completed Features

### Infrastructure
- [x] React 19 + TypeScript + Vite 8 project setup
- [x] Tailwind CSS v4 with `@tailwindcss/vite` plugin
- [x] Custom dark theme with glassmorphism design tokens
- [x] React Router v7 with nested layout routes
- [x] Zustand v5 stores (socketStore, roomStore)
- [x] Framer Motion for page and component animations
- [x] React Hook Form for form validation
- [x] Express + Socket.IO backend server
- [x] TypeScript strict mode (client + server)
- [x] ESLint with TypeScript rules

### Multiplayer Lobby
- [x] Socket.IO connection with auto-reconnection
- [x] Server-side room manager (create, join, leave, destroy)
- [x] 6-character room code generation (ambiguous chars excluded)
- [x] Real-time player list synchronization
- [x] Player ready/unready system
- [x] Host controls (start game, host transfer on disconnect)
- [x] Room validation (exists, not full, not started, name unique)
- [x] Disconnect handling with visual indicators
- [x] Copy room code button
- [x] Connection status indicator
- [x] Reconnection support (Socket.IO built-in)
- [x] Room cleanup when all players leave

### UI Screens
- [x] Landing page (Home)
- [x] Create Room form
- [x] Join Room form with error display
- [x] Waiting lobby with animated player cards
- [x] Game starting placeholder

---

## Features Not Yet Implemented

The following are part of the product design but intentionally deferred:

- **Card distribution** — assigning roles to players each round
- **Card flip animation** — 3D rotateY reveal/hide
- **Shuffle animation** — visual card shuffle before distribution
- **Role assignment** — fair rotation algorithm for balanced role distribution
- **Raja phase** — Raja identifies the Mantri
- **Mantri reveal** — Mantri's identity shown to all
- **Mantri choice** — Mantri selects who they think is the Chor
- **Result calculation** — scoring based on correct/incorrect guess
- **Result animation** — confetti, role reveals, score popups
- **Leaderboard** — running total across rounds
- **End game** — host ends session, final results displayed
- **Game history storage** — localStorage persistence
- **Player statistics** — per-player stats across games
- **Error boundaries** — client-side crash recovery
- **Spectator mode** — (future)
- **Sound effects** — (future)

---

## Architecture Principles

1. **Separation of concerns** — UI, business logic, socket logic, state, and utilities are independent modules
2. **Server authority** — The server owns all game state; clients render server events
3. **Reusability** — UI components are generic, composable, and theme-aware
4. **Testability** — Pure functions in utils, hooks, and stores can be tested in isolation; socket logic is abstracted behind hooks
5. **Scalability** — Feature-based folder structure supports adding features without touching existing code
6. **Strict TypeScript** — No `any` types; interfaces define all data shapes

---

## Coding Standards

- One component per file
- Named exports for reusable components, default exports for pages
- Custom hooks for all side effects (socket, timers, etc.)
- Constants for all magic numbers (points, durations, limits)
- Pure functions for game logic (scoring, role distribution)
- No socket logic inside component files — always via hooks
- ESLint + TypeScript strict enabled; no unused variables or imports
- Props interfaces defined above the component
