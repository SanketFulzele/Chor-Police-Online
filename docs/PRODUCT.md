# Chor Police Online

A modern multiplayer version of the classic Indian game **Chor Police** (also known as *Raja Mantri Chor Sipahi*). Built as a real-time web game with a polished, AAA-quality gaming interface.

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
│   │   ├── layout/
│   │   │   └── AppLayout.tsx         # Page wrapper with ambient background
│   │   └── game/                     # Game-specific components
│   │       ├── Card.tsx              # 3D flip card with role display
│   │       ├── ShuffleAnimation.tsx  # Card shuffle animation
│   │       └── WaitingProgress.tsx   # Player reveal/hide status
│   ├── pages/
│   │   ├── Home.tsx                  # Landing page (Create / Join)
│   │   ├── CreateRoom.tsx            # Host room creation form
│   │   ├── JoinRoom.tsx              # Player join form with validation
│   │   ├── Room.tsx                  # Real-time waiting lobby
│   │   └── Game.tsx                  # Game page with phase-based rendering
│   ├── hooks/
│   │   ├── useSocket.ts              # Socket connection lifecycle
│   │   ├── useRoom.ts               # Room CRUD operations
│   │   └── useGame.ts               # Game socket event listeners + actions
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
│   │   ├── roomStore.ts              # Room + player state
│   │   └── gameStore.ts              # Game phase, role, card state
│   ├── utils/                        # (empty — future utilities)
│   ├── types/
│   │   └── index.ts                  # Re-exports from shared/socket/types
│   ├── constants/
│   │   └── game.ts                   # ROLE_POINTS, SCORING, PHASE_DURATIONS
│   ├── App.tsx                       # React Router setup
│   ├── main.tsx                      # Entry point
│   ├── index.css                     # Tailwind CSS v4 + custom theme tokens
│   └── vite-env.d.ts                 # Vite type declarations
├── shared/                           # Shared between frontend and backend
│   └── socket/                       # Socket event contract (single source of truth)
│       ├── index.ts                  # Barrel export
│       ├── events.ts                 # SocketEvents enum (all event names)
│       ├── payloads.ts               # Typed payloads for all events
│       └── types.ts                  # GameRole, GamePhase, Player, Room
├── server/                           # Backend (Express + Socket.IO)
│   ├── package.json
│   ├── tsconfig.json
│   └── src/
│       ├── index.ts                  # Server entry + Socket.IO event handlers
│       ├── gameHandler.ts            # Game-phase socket event handlers
│       ├── roomManager.ts            # Room CRUD, code generation, player mgmt
│       └── types.ts                  # Re-exports from shared/socket/types
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
   - Role card display (Raja, Mantri, Sipahi, Chor)
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

5. GAME SCREEN — CARD DISTRIBUTION
   Route: /game
   ─────────────────────────────────────────────
   - All players redirected to /game simultaneously via `game-starting` event
   - Phase: shuffling → ShuffleAnimation plays for 2.5s while server assigns roles
   - Phase: card-distribution → Each player privately receives their role via `cards-distributed`
   - Phase: card-reveal → 3D flip card animation, reveal/hide buttons
   - Server validates no double-reveal, no reveal-after-hide
   - When all 4 players hide → server auto-advances to waiting-raja

6. RAJA PHASE
   ─────────────────────────────────────────────
   - Phase: waiting-raja (brief, server-side processing)
   - Raja is auto-identified by the server
   - Phase: raja-calling → Raja sees "You are Raja" + player selection list
   - Other players see "The Raja is choosing a Mantri..."
   - Raja clicks a player → emits `call-mantri` with chosen player ID
   - Server validates: correct phase, caller is Raja, target is valid player

7. MANTRI REVEAL
   ─────────────────────────────────────────────
   - Phase: mantri-reveal → Mantri identity broadcast to all via `mantri-revealed`
   - Animated reveal: scale-in with role emoji, player avatar, role name
   - All clients synchronized
   - Auto-advances to guessing after 2.5s

8. GUESSING PHASE
   ─────────────────────────────────────────────
   - Phase: guessing → Only the Mantri can interact
   - Mantri sees Chor and Sipahi as selectable players (Raja/Mantri excluded)
   - Tap to select, then confirm (double-tap flow prevents misclicks)
   - Other players see "The Mantri is trying to identify the Chor..."
   - Server validates: correct phase, caller is Mantri, valid target, no duplicates
   - Invalid targets (Raja, Mantri, disconnected, self) are rejected

9. REVEAL ROLES & SCORING
   ─────────────────────────────────────────────
   - Phase: reveal-roles → All roles revealed simultaneously with flip animation
   - `roles-revealed` event broadcasts full role map to all players
   - Phase: score-update → Round result displayed (Correct/Wrong)
   - Scoring rules:
     Correct Guess: Raja +1000, Mantri +500, Sipahi +300, Chor +0
     Wrong Guess:   Raja +1000, Mantri  +0, Sipahi +300, Chor +500
   - Score calculation is inside the Game Engine (scoreCalculator.ts)

10. LEADERBOARD & NEXT ROUND
    ─────────────────────────────────────────────
    - Phase: leaderboard → Sorted scores with medal emojis (🥇🥈🥉)
    - Host sees "Next Round" and "End Game" buttons; other players see "Waiting for host..."
    - Host clicks "Next Round" → server increments round, redistributes roles fairly
    - Host clicks "End Game" → game ends, winner is calculated
    - Returns to shuffling phase for next round
    - Game continues until host ends the session

11. GAME OVER
    ─────────────────────────────────────────────
    - Phase: finished → Game Over screen displayed
    - Winner announced with trophy emoji and avatar
    - Podium: Final standings with medal emojis (🥇🥈🥉)
    - Player Statistics: role counts, guess accuracy for each player
    - Game automatically saved to LocalStorage
    - "Back to Home" and "Game History" buttons
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
| `gameEngine.ts` | **Single owner of all gameplay rules.** Exports action functions (`startGame`, `revealCard`, `hideCard`, `callMantri`, `submitGuess`, `nextRound`, `endGame`) that each self-validate, mutate the room, and return typed events to emit. Provides `advanceToPhase()` for generic phase transitions with automatic role distribution when leaving `shuffling`. Phase scheduling (timed auto-advancements) returned as `ScheduledEvent[]`. Calls `calculateScores()` from `scoreCalculator.ts`, `distributeRoles()` from `roleDistributor.ts`, `buildGameResult()` from `winnerCalculator.ts`, and `calculatePlayerStats()` from `statisticsManager.ts`. Zero dependencies on React, Socket.IO, or Express. |
| `gameStateMachine.ts` | Defines all 13 game phases in order (`waiting → shuffling → card-distribution → card-reveal → card-hidden → waiting-raja → raja-calling → mantri-reveal → guessing → reveal-roles → score-update → leaderboard → finished`) and legal transitions between them. Exports `canTransition()`, `getNextPhase()`, `getLegalTransitions()` |
| `roleDistributor.ts` | Deficit-based fair role rotation algorithm. Distributes roles using deficit scores with last-role penalty to avoid repeats. Random shuffle on first round; fair distribution on subsequent rounds. |
| `scoreCalculator.ts` | Scoring logic — single source of truth. Correct: Raja +1000, Mantri +500, Sipahi +300, Chor +0. Wrong: Raja +1000, Mantri +0, Sipahi +300, Chor +500. Exports `calculateScores()` and `accumulateScores()` |
| `roundManager.ts` | Tracks round number, completed rounds, and current phase. Defines `RoundState` interface. Exports `createRoundState()`, `nextRound()`, `completeRound()` |
| `winnerCalculator.ts` | Fully implemented — `calculateLeaderboard()` from round history, `determineWinner()`, `buildGameResult()`, `hasTie()` |
| `statisticsManager.ts` | Fully implemented — `calculatePlayerStats()` (games played, wins, role counts, guess accuracy), `countRoles()` |
| `validators.ts` | Stubs — all validation is now implemented inline in `gameEngine.ts` action functions |

### Architecture Rules

1. **React components must never contain gameplay rules.** Components render UI and call hooks; they do not calculate scores, distribute roles, or decide winners.
2. **Socket handlers must never contain gameplay logic.** Socket event handlers receive events, validate auth, call the Game Engine, and broadcast results. No phase transitions, no score calculations, no role distribution, no validation logic.
3. **Zustand stores must never contain game logic.** Stores hold state; they do not implement game rules.
4. **The Game Engine is the single execution layer for all gameplay.** Every game action (start round, reveal card, hide card, call mantri, submit guess, next round) is a function in `src/game/gameEngine.ts`. The engine validates, mutates state, and returns events to emit. It calls `scoreCalculator.ts`, `roleDistributor.ts`, and `gameStateMachine.ts` internally.
5. **Scoring has a single source of truth.** `src/game/scoreCalculator.ts` is the only place where scoring logic lives. No other file contains `calculateScores()` or `accumulateScores()` implementations.

### Future Implementation

| Batch | Engine Files Used |
|-------|------------------|
| Batch 3 | `gameEngine.ts`, `gameStateMachine.ts`, `roleDistributor.ts`, `roundManager.ts`, `validators.ts` |
| Batch 4 | `scoreCalculator.ts` (implemented) |
| Batch 5 | `winnerCalculator.ts`, `statisticsManager.ts`, `gameEngine.ts` |

---

## Multiplayer Architecture

### Server as Source of Truth
The server owns all game state. Clients never hold authoritative state — they receive updates via socket events and render accordingly. This prevents desyncs and ensures all players see identical state.

### Game Engine as Single Execution Layer
All gameplay rules live in `src/game/gameEngine.ts`. Socket handlers do not contain gameplay logic — they are thin controllers that receive events, validate auth, call the engine, and broadcast results. The execution flow is:

```
Client Event → Server Handler (auth) → Game Engine (validate + mutate + return events)
                                          ↓
                                    emitResult() → ROOM_UPDATED + specific events
                                          ↓
                                    scheduleOrApply() → setTimeout → advanceToPhase()
```

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
            → Handler calls `gameEngine.startGame(room, player)`
            → Engine validates (4 players, all ready, is host)
            → Sets room.phase = "shuffling", room.round = 1
            → Returns events + scheduled transition (2500ms → role distribution)
            → Handler broadcasts ROOM_UPDATED + GAME_STARTING
            → All clients navigate to /game
            → After 2500ms: engine auto-distributes roles, advances to card-reveal
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

| Event             | Payload                      | When                              |
| ----------------- | ---------------------------- | --------------------------------- |
| `create-room`     | `{ playerName }`             | Host clicks Create                |
| `join-room`       | `{ roomCode, playerName }`   | Player clicks Join                |
| `leave-room`      | `{}`                         | Player clicks Leave               |
| `player-ready`    | `{}`                         | Player clicks Ready               |
| `player-unready`  | `{}`                         | Player clicks Not Ready           |
| `start-game`      | `{}`                         | Host clicks Start Game            |
| `reveal-card`     | `{}`                         | Player reveals card               |
| `hide-card`       | `{}`                         | Player hides card                 |
| `call-mantri`     | `{ chosenId }`               | Raja selects Mantri               |
| `submit-guess`    | `{ chosenId }`               | Mantri submits guess              |
| `next-round`      | `{}`                         | Host starts next round            |
| `end-game`        | `{}`                         | Host ends the game               |
| `reconnect`       | `{ roomCode, playerId }`     | Player reconnects to active room  |

### Server → Client Events

| Event                | Payload                                      | When                              |
| -------------------- | -------------------------------------------- | --------------------------------- |
| `room-created`       | `{ roomCode, playerId, room }`               | Room created successfully         |
| `room-joined`        | `{ room, playerId }`                         | Joined room successfully          |
| `room-updated`       | `{ room }`                                   | Any room state change (broadcast) |
| `room-destroyed`     | `{}`                                         | Last player left                  |
| `host-changed`       | `{ newHostId }`                              | Host transferred on disconnect    |
| `game-starting`      | `{ room }`                                   | Host started the game             |
| `cards-distributed`  | `{ role, phase }`                            | Role assigned privately to player |
| `phase-changed`      | `{ phase }`                                  | Game phase transition             |
| `card-revealed`      | `{ playerId }`                               | Player revealed their card        |
| `card-hidden`        | `{ playerId }`                               | Player hid their card             |
| `mantri-revealed`    | `{ mantriId }`                               | Raja's choice broadcast           |
| `guess-submitted`    | `{ playerId }`                               | Mantri submitted a guess          |
| `roles-revealed`     | `{ roles }`                                  | All roles revealed simultaneously |
| `round-result`       | `{ roundNumber, isCorrect, scores, roles, mantriId, chosenId }` | Round scoring result |
| `score-updated`      | `{ scores, totals }`                         | Score summary for the round       |
| `leaderboard-updated`| `{ leaderboard[] }`                          | Sorted leaderboard                |
| `next-round-started` | `{ room, round }`                            | Next round has begun              |
| `game-over`          | `{ winnerId, winnerName, leaderboard[], playerStatistics, roundHistory[] }` | Game ended, final results    |
| `reconnect-state`    | `{ room, playerId, myRole }`                  | Reconnect state for returning player |
| `player-reconnected` | `{ playerId }`                               | Player reconnected during game    |
| `player-disconnected`| `{ playerId }`                               | Player disconnected during game   |
| `error-message`      | `{ message, code }`                          | Validation failure                |

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

- **Result animation** — confetti, role reveals, score popups
- **Spectator mode** — (future)

---

## Shared Socket Event Contract

The `shared/socket/` directory contains the **single source of truth** for all Socket.IO event communication between frontend and backend.

### Files

| File | Purpose |
|------|---------|
| `events.ts` | `SocketEvents` constant object — every event name as a typed constant (e.g. `SocketEvents.CREATE_ROOM`, `SocketEvents.JOIN_ROOM`) |
| `payloads.ts` | Strongly typed payload interfaces for every event (e.g. `CreateRoomPayload`, `RoomUpdatedPayload`, `CardsDistributedPayload`) with a `SocketPayloadMap` that maps each event to its payload type |
| `types.ts` | Core domain types shared across the wire: `GameRole`, `GamePhase`, `Player`, `Room`, `PlayerStatistics` |
| `index.ts` | Barrel re-export of all constants, types, and payloads |

### Why This Architecture

- **One source of truth** — Event names are defined once and imported everywhere. No risk of typos like `"create_room"` vs `"create-room"`.
- **Compile-time safety** — If a payload shape changes, both the emitting and receiving side must be updated or TypeScript catches the mismatch.
- **Autocomplete** — IDEs provide autocomplete for event names, eliminating the need to grep the codebase for available events.
- **Easy maintenance** — To add a new event, add the name to `events.ts`, define the payload in `payloads.ts`, and both sides immediately have access.
- **Future mobile app compatibility** — The shared contract can be published as a standalone npm package consumed by mobile clients.

### Usage

Both frontend and backend import directly from `shared/socket/`:

```ts
// Before (raw strings):
socket.emit("create-room", { playerName: "Alice" });
socket.on("room-created", ({ room }) => { ... });

// After (typed constants):
import { SocketEvents } from "../../shared/socket/events";

socket.emit(SocketEvents.CREATE_ROOM, { playerName: "Alice" });
socket.on(SocketEvents.ROOM_CREATED, ({ room }) => { ... });
```

## Architecture Principles

1. **Separation of concerns** — UI, business logic, socket logic, state, and utilities are independent modules
2. **Server authority** — The server owns all game state; clients render server events
3. **Game Engine authority** — All gameplay rules (validation, scoring, phase transitions, role distribution) live exclusively in `src/game/`. Socket handlers are thin controllers that call the engine and broadcast results.
4. **Reusability** — UI components are generic, composable, and theme-aware
5. **Testability** — Pure functions in utils, hooks, and stores can be tested in isolation; socket logic is abstracted behind hooks
6. **Scalability** — Feature-based folder structure supports adding features without touching existing code
7. **Strict TypeScript** — No `any` types; interfaces define all data shapes
8. **Shared contract** — All socket event names and payloads are defined in `shared/socket/` and imported by both frontend and backend

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
