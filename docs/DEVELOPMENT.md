# Development Diary

---

## Project Status

| Metric             | Value                                      |
| ------------------ | ------------------------------------------ |
| **Current Milestone** | Batch 2 — Multiplayer Lobby & WebSocket Foundation ✅ |
| **Overall Progress** | ~35%                                      |
| **Current Phase**    | Lobby complete. Gameplay implementation begins in Batch 3. |

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

### Frontend (`src/`)

| Path                        | Lines | Purpose                                   |
| --------------------------- | ----- | ----------------------------------------- |
| `src/main.tsx`              | 10    | React entry point, renders App            |
| `src/App.tsx`               | 22    | BrowserRouter + Routes with AppLayout     |
| `src/index.css`             | 85    | Tailwind v4 + `@theme` tokens + utilities |
| `src/vite-env.d.ts`         | 1     | Vite type reference                       |
| `src/types/index.ts`        | 70    | GameRole, GamePhase, Player, Room, etc.   |
| `src/constants/game.ts`     | 49    | Role points, scoring, phase durations     |
| `src/store/socketStore.ts`  | 23    | Socket connection state                   |
| `src/store/roomStore.ts`    | 31    | Room + player state                       |
| `src/hooks/useSocket.ts`    | 58    | Socket connection lifecycle               |
| `src/hooks/useRoom.ts`      | 82    | Room CRUD operations                      |
| `src/components/ui/Button.tsx` | 40 | Reusable button with 4 variants           |
| `src/components/ui/Card.tsx` | 16    | Glassmorphism container                   |
| `src/components/ui/Input.tsx` | 36  | Form input with validation                |
| `src/components/layout/AppLayout.tsx` | 20 | Layout wrapper + socket init     |
| `src/pages/Home.tsx`        | 58    | Landing page                              |
| `src/pages/CreateRoom.tsx`  | 95    | Room creation form                        |
| `src/pages/JoinRoom.tsx`    | 108   | Room joining form                         |
| `src/pages/Room.tsx`        | 175   | Real-time waiting lobby                   |
| `src/pages/Game.tsx`        | 32    | Game placeholder                          |
| `src/game/types.ts`              | 86    | Game engine type definitions              |
| `src/game/gameEngine.ts`         | 51    | Game orchestrator                         |
| `src/game/gameStateMachine.ts`   | 68    | Phase definitions and transitions         |
| `src/game/roleDistributor.ts`    | 74    | Role rotation algorithm design + stubs    |
| `src/game/scoreCalculator.ts`    | 38    | Score calculator stubs                    |
| `src/game/roundManager.ts`       | 53    | Round tracking stubs                      |
| `src/game/winnerCalculator.ts`   | 56    | Winner and leaderboard stubs              |
| `src/game/statisticsManager.ts`  | 63    | Player statistics stubs                   |
| `src/game/validators.ts`         | 73    | Game action validation stubs              |
| `src/game/index.ts`              | 10    | Barrel export                             |

### Backend (`server/src/`)

| Path                          | Lines | Purpose                               |
| ----------------------------- | ----- | ------------------------------------- |
| `server/src/index.ts`         | 174   | Express + Socket.IO server + handlers |
| `server/src/roomManager.ts`   | 237   | Room CRUD, code generation, players   |
| `server/src/types.ts`         | 49    | Shared type definitions               |

---

## Pending Features

### Batch 3 — Game Logic & Card System
- [ ] Implement `roleDistributor.ts` — deficit-based fair rotation algorithm
- [ ] Implement `gameEngine.ts` — wire up phase transitions with actual game flow
- [ ] Implement `validators.ts` — game start validation
- [ ] Card component with 3D flip animation (face-down → face-up → face-down)
- [ ] Socket events for role distribution and card reveal/hide phases
- [ ] Client-side game store and game-specific hooks
- [ ] Game page real-time UI with player cards

### Batch 4 — Game Flow (Raja → Mantri → Chor)
- [ ] Raja calls Mantri phase
- [ ] Mantri reveal animation
- [ ] Mantri chooses Chor (player selection UI)
- [ ] Result calculation and scoring
- [ ] Result animation + confetti
- [ ] Score update + leaderboard
- [ ] Next round / end game flow

### Batch 5 — Polish & Persistence
- [ ] Local storage for game history
- [ ] Player statistics page
- [ ] End game screen with winner
- [ ] Round history view
- [ ] Error boundaries on all pages
- [ ] Loading skeletons
- [ ] Mobile responsiveness polish
- [ ] Sound effects

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
- `Game.tsx` is a placeholder — no game logic yet
- `utils/` directory is empty (no utility functions extracted yet)
- No client-side error boundary — errors in one component can crash the entire page
- Server has no persistence — all rooms are lost on server restart
- No rate limiting on room creation — a client could spam `create-room`
- `start-game` handler transitions the phase but no actual game logic follows
- `getRoomBySocketId` and `updatePlayerSocket` in roomManager are exported but unused (kept for future reconnect logic)
- `destroyRoom` in roomManager is unused (rooms are cleaned up when all players leave via `leaveRoom`)
- Room code is passed via URL search params — not secure, should use socket state in production

### Tooling Issues
- ESLint config uses `typescript-eslint` which has a peer-dependency conflict with TypeScript 7; project is pinned to TypeScript ~5.7.0
- Tailwind v4 is relatively new — some advanced patterns may not work as documented; using utility classes directly instead of `@apply`
- React Router v7 API differs from v6; using the newer route element syntax (`<Route element={...}>` instead of `component={...}`)

---

## Next Milestone

### Batch 3 — Game Logic & Card System

**Objective:** Implement the core game loop mechanics — role distribution, card system, and game phase state machine. The Game Engine architecture (created in Pre-Batch 3) provides the scaffolding.

**Key deliverables:**
1. Implement `roleDistributor.ts` — deficit-based fair rotation algorithm
2. Implement `gameEngine.ts` — wire up phase transitions with actual game flow
3. Implement `validators.ts` — game start validation
4. Card component with 3D flip animation (face-down → face-up → face-down)
5. Socket events for role distribution and card reveal/hide phases
6. Client-side game store and hooks
7. Real-time game UI showing cards and phase state

**Entry criteria:** Four players can start a game from the waiting lobby.

**Exit criteria:** Four players can receive cards, flip them to reveal roles, and hide them again, all synchronized in real-time.

---

## Changelog

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
