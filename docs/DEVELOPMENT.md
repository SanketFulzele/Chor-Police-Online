# Development Diary

---

## Project Status

| Metric             | Value                                      |
| ------------------ | ------------------------------------------ |
| **Current Milestone** | Batch 5 — End Game, Persistence & Production Polish ✅ |
| **Overall Progress** | ~90%                                      |
| **Current Phase**    | Complete game lifecycle with end-game flow, winner announcement, persistent history, player statistics, error boundaries, reconnect handling, sound system. |

---

## Completed Milestones

### Batch 1 — Project Scaffolding (2026-07-30)

- Initialize React 19 + TypeScript + Vite 8 project
- Install all dependencies: Zustand, Framer Motion, React Router, React Hook Form, Tailwind CSS v4
- Configure Tailwind CSS v4 with dark theme, glassmorphism, and custom design tokens
- Build reusable UI components: Button (4 variants), Card, Input
- Create AppLayout with ambient particle background
- Set up React Router with 5 routes: Home, CreateRoom, JoinRoom, Room, Game
- Create TypeScript types for all game entities (Player, Room, GameRole, GamePhase, etc.)
- Define game constants (role points, scoring rules, phase durations)
- Initialize Express + Socket.IO backend server skeleton
- Set up ESLint with TypeScript rules
- Create documentation (PRODUCT.md, DEVELOPMENT.md, ARCHITECTURE.md, ROADMAP.md)

### Batch 2 — Multiplayer Lobby & WebSocket Foundation (2026-07-30)

- Build server-side room manager with full CRUD lifecycle
- Implement Socket.IO event handlers for all lobby events
- Generate 6-character room codes (ambiguous characters excluded)
- Define Player interface with statistics tracking
- Implement host transfer on disconnect
- Enable reconnect support via Socket.IO built-in reconnection
- Create client Zustand stores: socketStore (connection), roomStore (room + players)
- Build custom hooks: useSocket (connection lifecycle), useRoom (room operations)
- Connect CreateRoom page to real socket-based room creation
- Connect JoinRoom page to real socket-based joining with validation
- Build full-featured WaitingRoom: player cards, ready toggles, host controls, copy code
- Add connection status indicator (Connected/Connecting/Disconnected)
- Handle leave room with server cleanup
- Handle disconnect with visual indicators
- Add server shared types in `server/src/types.ts`
- Restructure documentation: PRODUCT.md, DEVELOPMENT.md, README.md only

---

## Features Completed

### Infrastructure & Tooling
- React 19 + Vite 8 + TypeScript strict mode
- Tailwind CSS v4 with `@tailwindcss/vite` plugin
- Design token system via `@theme` in `index.css`
- ESLint with TypeScript + React hooks rules
- Express + Socket.IO backend with CORS
- Server-side TypeScript compilation with tsx

### UI Components
- **Button** — 4 variants (primary, secondary, ghost, gold), 3 sizes, disabled state, fullWidth, Framer Motion hover/tap animations
- **Card** — Glassmorphism container with optional hover effect
- **Input** — Label + error state + focus styling, forwarded ref for React Hook Form

### Layout
- Dark background with radial gradient glows (purple top, gold bottom-right)
- Fixed particle background layer (z-index: -1)
- Content layer above background

### Pages
- **Home** — Animated title with gold gradient + text glow, Create/Join buttons, role emoji display
- **CreateRoom** — Name input with validation (2–16 chars), server connection check, loading state, error display
- **JoinRoom** — Name + room code inputs with validation, server connection check, loading state, error display
- **Room** (Waiting Lobby) — Real-time synchronized player list, animated player cards with avatars, Host badge, ready/connection indicators, empty slot placeholders, copy room code button, ready toggle, host Start Game button with dynamic messaging, leave room, connection status
- **Game** — Placeholder showing room info and "Game Starting..." state

### Server
- **`server/src/roomManager.ts`** — Room CRUD functions:
  - `createRoom(socketId, name, playerId)` → Room with unique code
  - `joinRoom(code, socketId, name, playerId)` → Room or error string
  - `leaveRoom(code, playerId)` → Updated Room or null (destroyed)
  - `getRoom(code)` → Room lookup
  - `getPlayerBySocketId(socketId)` → Player lookup
  - `togglePlayerReady(code, playerId)` → Toggled Room
  - `setPlayerDisconnected(code, playerId)` → Updated Room with host transfer
  - `canStartGame(room)` → boolean
  - `destroyRoom(code)`
  - Room code generation: 6 chars, `ABCDEFGHJKLMNPQRSTUVWXYZ23456789` (no ambiguous 0/O, 1/I)
  - Player ID: UUID v4 (stable across reconnects)
- **`server/src/index.ts`** — Socket.IO event handlers:
  - `create-room` → validate name, create room, join socket room, emit `room-created`, broadcast `room-updated`
  - `join-room` → validate name + code, validate room state, join socket room, emit `room-joined`, broadcast `room-updated`
  - `leave-room` → find player by socket, remove from room, handle host transfer, broadcast `room-updated`
  - `player-ready` / `player-unready` → toggle ready state, broadcast `room-updated`
  - `start-game` → validate host + conditions, set phase to "shuffling", emit `game-starting`, broadcast `room-updated`
  - `disconnecting` → mark player disconnected, handle host transfer, broadcast `room-updated`

### Socket Event Map

**Client → Server:**
| Event             | Payload                      | When                      |
| ----------------- | ---------------------------- | ------------------------- |
| `create-room`     | `{ playerName }`             | Host clicks Create        |
| `join-room`       | `{ roomCode, playerName }`   | Player clicks Join        |
| `leave-room`      | `{}`                         | Player clicks Leave       |
| `player-ready`    | `{}`                         | Player clicks Ready       |
| `player-unready`  | `{}`                         | Player clicks Not Ready   |
| `start-game`      | `{}`                         | Host clicks Start Game    |

**Server → Client:**
| Event             | Payload                          | When                             |
| ----------------- | -------------------------------- | -------------------------------- |
| `room-created`    | `{ roomCode, playerId, room }`   | Room created successfully        |
| `room-joined`     | `{ room, playerId }`             | Joined room successfully         |
| `room-updated`    | `{ room }`                       | Any room state change (broadcast)|
| `room-destroyed`  | `{}`                             | Last player left                 |
| `host-changed`    | `{ newHostId }`                  | Host transferred on disconnect   |
| `game-starting`   | `{ room }`                       | Host started the game            |
| `error-message`   | `{ message, code }`              | Validation failure               |

### Current UI Screens
- `/` — Home (landing)
- `/create` — Create Room (form → waiting room)
- `/join` — Join Room (form → waiting room)
- `/room?code=XYZ123` — Waiting Lobby (real-time)
- `/game` — Game (placeholder)

---

## Architecture Decisions

### Why React
React's component model maps naturally to game UI elements (cards, buttons, player lists). Its declarative rendering ensures the UI is always a function of state. The ecosystem (React Router, Framer Motion, React Hook Form) provides everything needed without reinventing wheels. React 19's improvements (refs, metatags) are nice-to-haves for future features.

### Why Vite
Vite provides near-instant HMR, native ESM, and TypeScript support out of the box. The `@tailwindcss/vite` plugin integrates Tailwind v4 without configuration files. Build times are sub-second for this project's scale. Alternatives like Webpack or CRA would add configuration overhead with no benefit.

### Why TypeScript (strict mode)
Game logic has many interacting pieces: roles, phases, scores, players, socket events. TypeScript catches mismatched payloads, undefined accesses, and incorrect type assumptions at compile time. Strict mode eliminates entire categories of runtime bugs (null references, implicit anys). Every socket event payload has a defined interface, making the code self-documenting.

### Why Zustand over Redux or Context
Zustand was chosen over Redux (too much boilerplate for this scope — action types, reducers, dispatch) and React Context (re-renders all consumers on any change, which is expensive for frequent socket updates). Zustand provides granular subscriptions — only components consuming specific slices re-render. It's TypeScript-native with no extra type plumbing. The API surface is minimal: `create()`, `useStore()`, `set()`.

### Why Socket.IO over raw WebSocket
Socket.IO provides automatic reconnection, room abstractions, fallback transports (WebSocket → polling), and a clean event-based API out of the box. Raw WebSocket would require implementing reconnection logic with exponential backoff, message routing, and room management from scratch. Socket.IO's `socket.join()` / `io.to(room).emit()` maps directly to game rooms. The reconnection support alone justifies the dependency — losing connection during a game round would otherwise require a complex state recovery protocol.

### Why Tailwind CSS v4 over CSS Modules or styled-components
Tailwind v4 with `@tailwindcss/vite` provides zero-config setup, a design token system via `@theme`, and eliminates the need for separate CSS files. The utility-first approach keeps component files self-contained — you never have to context-switch between a `.tsx` and a `.css` file. The new CSS-based configuration (`@theme` in `index.css`) is simpler than the old `tailwind.config.js` and integrates naturally with the dark theme. For a game UI with many micro-interactions, having styles inline with markup is faster to iterate.

### Why feature-based architecture (not file-type-based)
Grouping by feature (pages/, hooks/, store/, etc. at the top level, then subdirectories as needed) keeps related code close together. When adding "spectator mode," you add files in 2–3 directories rather than scattering code across 10+ folders. This scales better than a pure file-type structure (e.g., `components/`, `containers/`, `services/`) where a single feature touches many folders. The current structure also makes it easy to extract features into separate packages later if needed.

### Why the server is the source of truth for game state
In a real-time multiplayer game, trusting client state leads to desyncs, cheating, and race conditions. By making the server authoritative, all players always see the same state. Clients are views that render server events. This simplifies debugging (inspect server state), ensures fairness (no client can lie about their role or score), and makes game logic testable independently of UI.

### Why Zustand stores are split (socketStore vs roomStore)
The socket connection is a cross-cutting concern that should connect once and persist across page navigation. Room state (players, room code, phase) changes frequently during gameplay. Separating them prevents unnecessary re-renders — the socket status can change (e.g., reconnecting) without triggering room subscribers. It also makes it possible to test or mock each store independently. The socket store is the single source of truth for connection status; the room store is the single source of truth for game state.

### Why named socket events instead of a single generic event
Each action has a distinct name: `create-room`, `join-room`, `player-ready`, etc. This makes server-side routing trivial (`socket.on("create-room", handler)`), improves network debugging (Chrome DevTools shows exactly which events fire), and keeps the codebase searchable (`grep "create-room"` finds all references). A single `"action"` event with a type discriminator would require switch statements everywhere, making the flow harder to trace and debug.

### Why the room manager is a separate module from the server entry
The `roomManager.ts` module contains pure room logic with no Socket.IO dependency. This means it can be unit tested independently without mocking socket connections. If the transport layer ever changes (e.g., WebTransport), the room manager is reused unchanged. It also makes the code easier to understand — you can read the room lifecycle without wading through socket event wiring.

### Why UUID for player IDs instead of socket IDs
Socket IDs change on reconnection. Player IDs need to be stable across reconnects so the server can match a reconnecting player to their existing player object. UUIDs generated on the server during room creation/joining are stored in the player object and sent to the client. When a client reconnects, they can send their player ID to rejoin their existing session.

---

## Files & Structure

### Shared (`shared/`)

| Path                          | Lines | Purpose                               |
| ----------------------------- | ----- | ------------------------------------- |
| `shared/socket/events.ts`     | 41    | SocketEvents constants (all event names) |
| `shared/socket/payloads.ts`   | 88    | Typed payload interfaces for all events |
| `shared/socket/types.ts`      | 56    | GameRole, GamePhase, Player, Room types |
| `shared/socket/index.ts`      | 24    | Barrel re-export                       |

### Frontend (`src/`)

| Path                               | Lines | Purpose                                   |
| ---------------------------------- | ----- | ----------------------------------------- |
| `src/main.tsx`                     | 10    | React entry point, renders App            |
| `src/App.tsx`                      | 22    | BrowserRouter + Routes with AppLayout     |
| `src/index.css`                    | 85    | Tailwind v4 + `@theme` tokens + utilities |
| `src/vite-env.d.ts`                | 1     | Vite type reference                       |
| `src/types/index.ts`               | 10    | Re-exports from shared + local types      |
| `src/constants/game.ts`            | 52    | Role points, scoring, phase durations     |
| `src/store/socketStore.ts`         | 23    | Socket connection state                   |
| `src/store/roomStore.ts`           | 31    | Room + player state                       |
| `src/store/gameStore.ts`           | 55    | Game phase, role, card state              |
| `src/hooks/useSocket.ts`           | 53    | Socket connection lifecycle               |
| `src/hooks/useRoom.ts`             | 79    | Room CRUD operations                      |
| `src/hooks/useGame.ts`             | 175   | Game socket event listeners + actions     |
| `src/hooks/usePersistence.ts`      | 28    | LocalStorage game history persistence     |
| `src/hooks/useSound.ts`            | 48    | AudioContext-based sound effects          |
| `src/components/ui/Button.tsx`     | 40    | Reusable button with 4 variants           |
| `src/components/ui/Card.tsx`       | 16    | Glassmorphism container                   |
| `src/components/ui/Input.tsx`      | 36    | Form input with validation                |
| `src/components/layout/AppLayout.tsx` | 20 | Layout wrapper + socket init            |
| `src/components/game/Card.tsx`     | 72    | 3D flip card with role display            |
| `src/components/game/ShuffleAnimation.tsx` | 30 | Card shuffle animation          |
| `src/components/game/WaitingProgress.tsx` | 28 | Player reveal/hide status         |
| `src/pages/Home.tsx`               | 58    | Landing page                              |
| `src/pages/CreateRoom.tsx`         | 96    | Room creation form                        |
| `src/pages/JoinRoom.tsx`           | 112   | Room joining form                         |
| `src/pages/Room.tsx`               | 248   | Real-time waiting lobby                   |
| `src/pages/Game.tsx`               | 650   | Game page with phase-based rendering      |
| `src/pages/History.tsx`            | 180   | Game history page                         |
| `src/game/types.ts`                | 86    | Game engine type definitions              |
| `src/game/gameEngine.ts`           | 540   | Game orchestrator                         |
| `src/game/gameStateMachine.ts`     | 68    | Phase definitions and transitions         |
| `src/game/roleDistributor.ts`      | 74    | Role rotation algorithm                   |
| `src/game/scoreCalculator.ts`      | 38    | Score calculator stubs                    |
| `src/game/roundManager.ts`         | 53    | Round tracking                            |
| `src/game/winnerCalculator.ts`     | 72    | Winner and leaderboard implementation     |
| `src/game/statisticsManager.ts`    | 73    | Player statistics implementation          |
| `src/game/validators.ts`           | 73    | Game action validation stubs              |
| `src/game/index.ts`                | 10    | Barrel export                             |
| `src/components/ErrorBoundary.tsx` | 41    | Global error boundary component           |
| `src/game/validators.ts`           | 73    | Game action validation stubs              |
| `src/game/index.ts`                | 10    | Barrel export                             |

### Backend (`server/src/`)

| Path                          | Lines | Purpose                               |
| ----------------------------- | ----- | ------------------------------------- |
| `server/src/index.ts`         | 190   | Express + Socket.IO server + handlers |
| `server/src/gameHandler.ts`   | 145   | Game-phase socket event handlers      |
| `server/src/roomManager.ts`   | 245   | Room CRUD, code generation, players   |
| `server/src/types.ts`         | 10    | Re-exports from shared/socket/types   |

---

## Pending Features

### Batch 3 — Game Logic & Card System ✅
- [x] Implement `roleDistributor.ts` — deficit-based fair rotation algorithm
- [x] Implement `gameEngine.ts` — wire up phase transitions with actual game flow
- [x] Card component with 3D flip animation (face-down → face-up → face-down)
- [x] Socket events for role distribution and card reveal/hide phases
- [x] Client-side game store and game-specific hooks
- [x] Game page real-time UI with player cards

### Batch 4 — Game Flow (Raja → Mantri → Chor) ✅
- [x] Raja calls Mantri phase
- [x] Mantri reveal animation
- [x] Mantri chooses Chor (player selection UI with confirm)
- [x] Result calculation and scoring
- [x] Score update + leaderboard
- [x] Next round

### Batch 5 — End Game, Persistence & Production Polish ✅
- [x] End game flow — host ends session, final results displayed with podium
- [x] `endGame()` in game engine — validates host + leaderboard phase, sets phase to finished, computes winner + statistics
- [x] `winnerCalculator.ts` — fully implemented: `calculateLeaderboard()`, `determineWinner()`, `buildGameResult()`, `hasTie()`
- [x] `statisticsManager.ts` — fully implemented: `calculatePlayerStats()` (games played, wins, highestScore, totalScore, role counts, correct/wrong guesses)
- [x] `GAME_OVER` event — broadcasts winner, final leaderboard, per-player statistics, and round history
- [x] `END_GAME` socket event — server handler added
- [x] Game over screen — trophy animation, podium with medals, player statistics grid
- [x] Local storage persistence — `usePersistence` hook, auto-saves on game end
- [x] History page (`/history`) — game list view + detail view with round-by-round breakdown
- [x] Round history saved to Room type (`roundHistory` array)
- [x] Reconnect handling — `RECONNECT` event, `updatePlayerSocket`, `RECONNECT_STATE` payload, `PLAYER_RECONNECTED` broadcast
- [x] Disconnect handling — `PLAYER_DISCONNECTED` event broadcast
- [x] Error boundary — `ErrorBoundary` component wrapping entire app
- [x] Sound system — `useSound` hook with AudioContext-based tones (flip, reveal, correct, wrong, victory) with mute toggle and localStorage persistence
- [x] All socket event contracts updated with new payloads
- [x] Zero lint errors, zero tsc errors, successful vite build + server tsc build

### Future
- Spectator mode
- Online friends system
- Voice chat
- AI player
- Achievements
- Player avatars
- Themes
- Database sync
- Authentication

---

## Known Issues

### Technical Debt
- `utils/` directory is empty (no utility functions extracted yet)
- Server has no persistence — all rooms are lost on server restart
- No rate limiting on room creation — a client could spam `create-room`
- No guess timeout — Mantri can take unlimited time to guess
- `destroyRoom` in roomManager is unused (rooms are cleaned up when all players leave via `leaveRoom`)
- Room code is passed via URL search params — not secure, should use socket state in production

### Tooling Issues
- ESLint config uses `typescript-eslint` which has a peer-dependency conflict with TypeScript 7; project is pinned to TypeScript ~5.7.0
- Tailwind v4 is relatively new — some advanced patterns may not work as documented; using utility classes directly instead of `@apply`
- React Router v7 API differs from v6; using the newer route element syntax (`<Route element={...}>` instead of `component={...}`)

---

## Next Milestone

### Batch 6 — Polish & Production Readiness

**Objective:** Final visual polish, mobile responsiveness, performance optimization, and production deployment readiness.

**Key deliverables:**
1. Result animation — confetti, role reveals, score popups
2. Mobile responsiveness polish across all screens
3. Loading skeletons for all async states
4. Performance optimization (memo, lazy loading)
5. Accessibility improvements (ARIA labels, keyboard nav)
6. Production Docker configuration
7. End-to-end testing
8. Final code cleanup and documentation review

---

## Changelog

### Architecture Refactor — 2026-07-30 — Game Engine as Single Execution Layer

**Goal:** Make the Game Engine (`src/game/gameEngine.ts`) the single owner of all gameplay rules. Socket handlers become thin controllers that only receive events, validate auth, call the engine, and broadcast results.

**Changed**
- `src/game/gameEngine.ts` — Complete rewrite from 72 lines to 377 lines. Now contains ALL gameplay logic:
  - Validation: `revealCard`, `hideCard`, `callMantri`, `submitGuess`, `startGame`, `nextRound` all self-validate
  - Execution: each action mutates the `Room`/`Player` objects directly and returns typed events to emit
  - Scheduling: returns `ScheduledEvent[]` for timed phase transitions (shuffling → card-distribution, reveal-roles → score-update → leaderboard)
  - Phase advancement: `advanceToPhase(room, phase)` uses `canTransition()` from `gameStateMachine.ts` and auto-handles role distribution when leaving shuffling
  - Scoring: calls `calculateScores()` from `scoreCalculator.ts` — single source of truth
  - All gameplay validation (phase checks, role checks, target validity, host checks, duplicate actions) lives exclusively in the engine
  - No socket.io, no express, no react imports — pure TypeScript logic
- `server/src/gameHandler.ts` — Complete rewrite from 237 lines to 108 lines as thin controller:
  - Each handler: `getPlayerBySocketId` (auth) → call engine → `emitResult()` (generic broadcast helper)
  - `emitResult()` handles: ROOM_UPDATED broadcast, event emission, targeted per-player events, and scheduled transitions
  - `scheduleOrApply()` handles timed auto-advancement (setTimeout) and 0-delay immediate transitions with phase guards
  - No gameplay logic — no validation, no phase transitions, no score calculation, no role distribution
- `server/tsconfig.json` — Added `"../src/game"` to includes so server can import the game engine
- `src/types/index.ts` — Fixed type import: `GameRole` now properly imported locally (not just re-exported) to support server-side compilation

**Removed**
- All duplicate gameplay logic from `server/src/gameHandler.ts`:
  - `distributeRoles()` — server-side role distribution (was duplicate of `roleDistributor.ts`)
  - `calculateScores()` — server-side scoring (was duplicate of `scoreCalculator.ts`)
  - `accumulateScores()` — server-side score accumulation (was duplicate of `scoreCalculator.ts`)
  - All inline validation for phase, role, target, host checks
  - All inline phase transition code (`room.phase = "..."`)
  - All inline setTimeout scheduling
- Resolved technical debt items:
  - "Score calculation logic is duplicated between server and engine" — now single source in `scoreCalculator.ts`
  - "Phase transitions are hardcoded in event handlers" — now centralized through `advanceToPhase()` + `gameStateMachine.ts`

**Execution flow (new):**
```
Client → Socket Event → Server Handler (auth) → Game Engine (validate + mutate + return events)
                                                  ↓
                                            emitResult() → ROOM_UPDATED + specific events
                                                  ↓
                                            scheduleOrApply() → setTimeout → advanceToPhase()
```

**Server handler pattern (every action follows this):**
```
socket.on(EVENT, (payload) => {
  const ctx = getPlayerBySocketId(socket.id);
  if (!ctx) return;
  const result = engine.action(ctx.room, ctx.player, payload);
  emitResult(ctx.room, result, io, socket);
});
```

### Batch 5 — 2026-07-30 — End Game, Persistence & Production Polish

**Added**
- `src/game/winnerCalculator.ts` — Fully implemented `calculateLeaderboard()`, `determineWinner()`, `buildGameResult()`, `hasTie()`. Leaderboard sorts by total score descending. Role counts tracked per player. `buildGameResult()` returns full `GameResult` with winner, leaderboard, round history, and timestamp.
- `src/game/statisticsManager.ts` — Fully implemented `calculatePlayerStats()` and `countRoles()`. Tracks: games played, wins, highest score, total score, per-role counts, correct/wrong guesses as Mantri. Used by `endGame()` to update per-player lifetime statistics.
- `src/game/gameEngine.ts` — Added `endGame()` function: validates host + leaderboard phase, sets phase to `finished`, pushes `GAME_OVER` event with winner, leaderboard, player statistics, and round history. Push to `room.roundHistory` added in `submitGuess()`. `validateAction()` updated with new action types.
- `shared/socket/events.ts` — Added `GAME_OVER`, `RECONNECT`, `PLAYER_RECONNECTED`, `RECONNECT_STATE`, `PLAYER_DISCONNECTED` events.
- `shared/socket/payloads.ts` — Added `GameOverPayload`, `ReconnectPayload`, `ReconnectStatePayload`, `PlayerReconnectedPayload`, `PlayerDisconnectedPayload`. Updated `SocketPayloadMap` with all new event → payload mappings. Added import for `PlayerStatistics`.
- `shared/socket/types.ts` — Added `RoundHistoryEntry` interface. Added `roundHistory`, `winnerId`, `winnerName`, `finishedAt` fields to `Room` interface.
- `server/src/gameHandler.ts` — Added `END_GAME` handler (thin pattern).
- `server/src/index.ts` — Added `RECONNECT` handler that validates room + player, updates socket, emits `RECONNECT_STATE` + `PLAYER_RECONNECTED`. Added `PLAYER_DISCONNECTED` broadcast on disconnect. Imported `updatePlayerSocket`.
- `src/store/gameStore.ts` — Added `winnerId`, `winnerName`, `playerStatistics`, `roundHistory` fields. Added `setGameOver()` setter that populates all end-game state and sets phase to "finished".
- `src/hooks/useGame.ts` — Added `GAME_OVER` listener calling `setGameOver()`. Added `endGame()` action emitting `END_GAME`.
- `src/pages/Game.tsx` — Added **finished phase rendering**: trophy animation, winner avatar with gold border, podium with medals, per-player statistics grid (role counts, guess accuracy). Added **leaderboard phase update**: "End Game" button for host alongside "Next Round". Added auto-save to localStorage on `GAME_OVER`. Auto-save effect deps fixed.
- `src/hooks/usePersistence.ts` — New hook: `loadHistory()`, `saveGame()`, `clearHistory()`. Stores up to 50 games in `localStorage` under `chor-police-history` key.
- `src/pages/History.tsx` — New route `/history`. Two views: list view (game summaries with winner, date, rounds, player scores) and detail view (podium + round-by-round role breakdown). Toggle via `selectedGame` state. Framer Motion `AnimatePresence` transitions.
- `src/components/ErrorBoundary.tsx` — Global error boundary component. Catches rendering errors, displays error message + "Back to Home" button, logs to console. Wraps entire app in `App.tsx`.
- `src/hooks/useSound.ts` — New hook: `play()`, `isMuted`, `toggleMute()`. Uses `AudioContext` to play synthesized tones. Five sound types: flip (800Hz), reveal (1200Hz), correct (1400Hz), wrong (300Hz), victory (1800Hz). Mute state persisted to `localStorage`.
- `server/src/roomManager.ts` — Initialize `roundHistory: []` on room creation.

**Changed**
- `src/pages/Game.tsx` — Major expansion of finished phase UI. Uses `winnerId`, `winnerName`, `leaderboard`, `playerStatistics`, `roundHistory` from gameStore. Calls `endGame()` from useGame hook. Auto-saves to persistence store.
- `src/App.tsx` — Added `/history` route. Wrapped Routes with `ErrorBoundary`.
- `shared/socket/types.ts` — Room interface extended with `roundHistory`, `winnerId`, `winnerName`, `finishedAt`.
- `docs/PRODUCT.md` — Updated game flow step 10 with End Game button, added step 11 Game Over section. Updated File Responsibilities table. Moved end game, history, statistics, error boundaries from "Not Yet Implemented" to completed. Updated WebSocket event tables with new events.
- `docs/DEVELOPMENT.md` — Updated milestone to Batch 5 (90% progress). Updated Batch 5 checklist to completed. Added Batch 5 changelog entry.

**Removed**
- Technical debt entries from Known Issues: "No end-game flow", "No winner announcement or game history", "`getRoomBySocketId` and `updatePlayerSocket` exported but unused" (now in use), "No error boundary".

### Batch 4 — 2026-07-30 — Raja → Mantri → Guess → Round Result

**Added**
- Complete around game flow from card hide through leaderboard and next round
- Server auto-detects Raja when all cards hidden and transitions to `raja-calling`
- Raja selects Mantri via `call-mantri` event (validated: correct phase, is Raja, valid target)
- Mantri identity broadcast to all players via `mantri-revealed` event
- Mantri guesses Chor/Daku via `submit-guess` event with confirmation UI (tap → confirm)
- Server validates guess (correct phase, is Mantri, valid target, not Raja/Mantri)
- All roles revealed simultaneously via `roles-revealed` event
- `scoreCalculator.ts` — fully implemented scoring logic (Correct: Raja +1000, Mantri +500, Daku +300, Chor +0; Wrong: Raja +1000, Mantri +0, Daku +300, Chor +500)
- Server-side scoring (calculateScores, accumulateScores) called from gameHandler
- Round result screen with per-player scores and totals
- Leaderboard sorted by score with medal animations
- Host "Next Round" button triggers fair role redistribution via gameHandler
- Shared socket events for Batch 4: `CALL_MANTRI`, `MANTRI_REVEALED`, `SUBMIT_GUESS`, `GUESS_SUBMITTED`, `ROLES_REVEALED`, `ROUND_RESULT`, `SCORE_UPDATED`, `LEADERBOARD_UPDATED`, `NEXT_ROUND_STARTED`
- Shared payloads for all new events (CallMantriPayload, MantriRevealedPayload, SubmitGuessPayload, GuessSubmittedPayload, RolesRevealedPayload, RoundResultPayload, ScoreUpdatedPayload, LeaderboardUpdatedPayload, NextRoundStartedPayload)
- `mantriId` field added to shared Room type
- Client game store (`gameStore.ts`) — added mantriId, revealedRoles, lastRoundResult, currentScores, currentTotals, leaderboard with setters
- Client game hook (`useGame.ts`) — all new event listeners + `callMantri()`, `submitGuess()`, `nextRound()` actions
- Game.tsx — complete phase-based rendering for all 7 new phases:
  - `waiting-raja` / `raja-calling`: Raja sees player list to choose Mantri; others see waiting
  - `mantri-reveal`: Scale-in spotlight animation of Mantri identity
  - `guessing`: Mantri sees Chor/Daku selection with confirm flow; others see waiting
  - `reveal-roles`: All roles shown with flip animation
  - `score-update`: Correct/Wrong badge + per-player score breakdown
  - `leaderboard`: Sorted leaderboard with medal emojis + Next Round button for host

**Changed**
- `server/src/gameHandler.ts` — Complete rewrite of all game phase transitions. Now handles `call-mantri`, `submit-guess`, `next-round` events. Auto-advances through reveal-roles → score-update → leaderboard with timed transitions. Removed unused `_canTransition`, `_getNextPhase`, and `_TRANSITIONS` (transition logic is now hardcoded in event handlers).
- `shared/socket/events.ts` — Added 10 new event constants for Batch 4 game phases
- `shared/socket/payloads.ts` — Added 10 new typed payload interfaces
- `shared/socket/types.ts` — Added `mantriId` to Room interface
- `shared/socket/index.ts` — Re-exported all new payload types
- `src/pages/Game.tsx` — Replaced placeholder phase renderers with full game UI for all phases. Added `GuessButton` component with tap → confirm flow.
- `src/store/gameStore.ts` — Expanded with RoundResultData interface and leaderboard/result state
- `src/hooks/useGame.ts` — Registered 6 new socket event listeners and 3 new actions
- `src/game/scoreCalculator.ts` — Fully implemented `calculateScores()` and `accumulateScores()`
- `docs/PRODUCT.md` — Updated game flow (steps 5-10), scoring rules, WebSocket event tables, Game Engine Architecture status
- `docs/DEVELOPMENT.md` — Updated milestone status to Batch 4, progress to ~65%

**Architecture decisions**
- Raja is identified automatically by the server from `currentRole` — no extra "you are raja" event is needed since the client already knows their role from `cards-distributed`.
- The guess confirmation UI (tap → confirm) prevents misclicks without requiring complex undo logic.

**Known limitations**
- No disconnect handling during active game phases (raja disconnect, mantri disconnect)
- No guess timeout — mantri can take unlimited time
- No end-game flow — the game continues indefinitely with Next Round
- No winner announcement or game history

**Added**
- `shared/socket/events.ts` — `SocketEvents` constant object: all event names as typed constants. No raw strings anywhere in the project for socket events.
- `shared/socket/payloads.ts` — Strongly typed payload interfaces for every event (`CreateRoomPayload`, `JoinRoomPayload`, `RoomUpdatedPayload`, `CardsDistributedPayload`, etc.) with a `SocketPayloadMap` mapping each event to its payload type.
- `shared/socket/types.ts` — Core domain types shared across the wire: `GameRole`, `GamePhase`, `Player`, `Room`, `PlayerStatistics`. Includes `currentRole`, `hasRevealed`, `hasHidden` fields used by both server and client during gameplay.
- `shared/socket/index.ts` — Barrel re-export of all constants, types, and payloads.

**Changed**
- `server/src/types.ts` — Now re-exports from `shared/socket/types` instead of defining types independently.
- `server/src/index.ts` — All socket event strings replaced with `SocketEvents` constants. Imports from `../../shared/socket/events`.
- `server/src/gameHandler.ts` — All socket event strings replaced with `SocketEvents` constants. Imports from `../../shared/socket/events`.
- `server/tsconfig.json` — Updated `rootDir` to `..` and `include` to `["src", "../shared"]` to compile shared files.
- `server/package.json` — Updated `start` script to `node dist/server/src/index.js` (new output structure with shared files).
- `src/types/index.ts` — Core types (`GameRole`, `GamePhase`, `Player`, `Room`, `PlayerStatistics`) now re-exported from `shared/socket/types`. Local types (`RoundRecord`, `StoredGame`, `ConnectionStatus`) remain.
- `src/hooks/useSocket.ts` — `room-updated` and `room-destroyed` event strings replaced with `SocketEvents` constants.
- `src/hooks/useRoom.ts` — All socket event strings replaced with `SocketEvents` constants.
- `src/hooks/useGame.ts` — All socket event strings replaced with `SocketEvents` constants.
- `src/pages/CreateRoom.tsx` — `create-room`, `room-created`, `error-message` replaced with `SocketEvents` constants.
- `src/pages/JoinRoom.tsx` — `join-room`, `room-joined`, `error-message` replaced with `SocketEvents` constants.
- `src/pages/Room.tsx` — `game-starting` replaced with `SocketEvents` constant.
- `shared/socket/types.ts` — Added `currentRole`, `hasRevealed`, `hasHidden` fields to `Player` type (needed by both server and client).
- `server/src/roomManager.ts` — Player creation now includes `hasRevealed: false` and `hasHidden: false`.
- `shared/socket/types.ts` — `GamePhase` enum now includes all 13 game phases including `waiting-raja`, `card-hidden`, etc.

**Removed**
- Raw socket event name strings from all `.ts` and `.tsx` files (except native Socket.IO events `connect`, `disconnect`, `connect_error`).

**Architecture decisions**
- Shared contract is a plain TypeScript directory imported via relative paths. This avoids build-tool complexity (no npm link, no workspace setup) while providing compile-time safety to both sides.
- Event names are **constants**, not enums, to compile to plain strings at runtime (enum values are inlined and can cause issues with module resolution).
- Types are kept minimal in `shared/socket/types.ts` — only the domain types that travel over the wire. Internal types (e.g. `RoundRecord`, `StoredGame`) remain in their respective packages.

### Pre-Batch 3 — 2026-07-30 — Game Engine Architecture

**Added**
- `src/game/` directory with 10 files: the complete Game Engine layer
- `src/game/types.ts` — Game-specific types: `GamePhase` (12 phases), `GameState`, `RoundResult`, `RoleDistribution`, `ScoreInput`/`ScoreOutput`, `GameResult`, `LeaderboardEntry`, `ValidationResult`
- `src/game/gameEngine.ts` — Orchestrator with `createGameState()`, `advancePhase()`, `startNextRound()`, `recordRoundResult()`
- `src/game/gameStateMachine.ts` — All 12 game phases in order with legal transition rules; exports `canTransition()`, `getNextPhase()`, `getLegalTransitions()`
- `src/game/roleDistributor.ts` — Deficit-based fair rotation algorithm design (documented in comments), typed function stubs
- `src/game/scoreCalculator.ts` — Typed `calculateScores()` and `accumulateScores()` stubs
- `src/game/roundManager.ts` — `RoundState` interface with `createRoundState()`, `nextRound()`, `completeRound()`
- `src/game/winnerCalculator.ts` — `calculateLeaderboard()`, `determineWinner()`, `buildGameResult()`, `hasTie()` stubs with tie-breaking design notes
- `src/game/statisticsManager.ts` — `PlayerStats` interface with `calculatePlayerStats()`, `countRoles()` stubs
- `src/game/validators.ts` — 7 validation stubs: `canStartGame`, `canRevealCard`, `canHideCard`, `canProceedFromReveal`, `canGuess`, `canEndRound`, `canTransitionPhase`
- `src/game/index.ts` — Barrel re-export of all game modules

**Changed**
- `eslint.config.js` — Added `@typescript-eslint/no-unused-vars` rule with `argsIgnorePattern: "^_"` and `varsIgnorePattern: "^_"` to allow underscore-prefixed placeholder parameters
- `docs/PRODUCT.md` — Added "Game Engine Architecture" section explaining file responsibilities and architecture rules; updated folder structure to include `src/game/`
- `docs/DEVELOPMENT.md` — Updated Files & Structure table with all game engine files; updated Pending Features and Next Milestone to reference the engine

**Architecture decisions**
- Game Engine is pure TypeScript with zero dependencies on React, Socket.IO, or Express
- All game rules will live exclusively in `src/game/` — UI, stores, and socket handlers will call the engine, never implement rules
- Phase transitions are defined declaratively so the full game flow can be understood from one file
- Underscore prefix convention adopted for placeholder function parameters to pass strict linting

### Batch 2 — 2026-07-30

**Added**
- Server-side room manager (`roomManager.ts`) with full CRUD, code generation, player management
- Server types (`server/src/types.ts`) — Player, Room, GamePhase, PlayerStatistics
- Client Zustand stores: `socketStore` (connection state), `roomStore` (room + player state)
- Custom hooks: `useSocket` (connection lifecycle), `useRoom` (room operations)
- Full Socket.IO event map for lobby (create, join, leave, ready, unready, start-game)
- Real-time waiting room with player cards, host badge, ready status, connection indicators
- Room code copy button with confirmation feedback
- Connection status indicator (Connected/Connecting/Disconnected)
- Error handling for room full, not found, already started, name taken
- Host transfer on disconnect
- Reconnection support via Socket.IO's built-in reconnection

**Changed**
- `server/src/index.ts` — implemented all Socket.IO event handlers
- `src/pages/CreateRoom.tsx` — real socket-based room creation
- `src/pages/JoinRoom.tsx` — real socket-based room joining with validation
- `src/pages/Room.tsx` — full real-time waiting room replacing mock data
- `src/pages/Game.tsx` — reads from room store, shows game starting state
- `src/components/layout/AppLayout.tsx` — global socket connection via useSocket
- `src/types/index.ts` — updated Player interface to match server (avatarColor, statistics)
- `README.md` — full project documentation replacing Vite template

**Removed**
- `docs/ARCHITECTURE.md` — consolidated into PRODUCT.md
- `docs/ROADMAP.md` — consolidated into DEVELOPMENT.md

### Batch 1 — 2026-07-30

**Added**
- Full project scaffolding with React 19 + Vite 8 + TypeScript
- Tailwind CSS v4 dark theme with glassmorphism design system
- Reusable UI components: Button (4 variants), Card, Input
- AppLayout with ambient particle background
- Routing: Home, CreateRoom, JoinRoom, Room, Game pages
- Backend skeleton with Express + Socket.IO
- TypeScript interfaces for all game entities
- Game constants (roles, scoring, phases)

**Changed**
- Converted all `.jsx` files to `.tsx`
- Converted `vite.config.js` to `vite.config.ts`
- Updated `eslint.config.js` for TypeScript
- Updated `index.html` title and script reference

**Removed**
- Old Vite template boilerplate
- `App.css`, `src/assets/`, `public/icons.svg`
