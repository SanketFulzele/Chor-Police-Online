# Chor Police Online

A modern multiplayer version of the classic Indian game **Chor Police** (Raja Mantri Chor Sipahi). Play with friends in real-time — no accounts required.

---

## Prerequisites

- **Node.js** >= 20
- **npm** >= 10

---

## Setup

```bash
# Clone the repository
git clone <repo-url>
cd chor-police-online

# Install frontend dependencies
npm install

# Install backend dependencies
cd server
npm install
cd ..
```

---

## Run Locally

You need **two terminals** — one for the frontend, one for the backend.

### Terminal 1 — Frontend (Vite dev server)

```bash
npm run dev
```

Opens at **http://localhost:5173**

### Terminal 2 — Backend (Express + Socket.IO)

```bash
cd server
npm run dev
```

Runs on **http://localhost:3001**

---

## Scripts

| Command              | Description                     |
| -------------------- | ------------------------------- |
| `npm run dev`        | Start Vite dev server           |
| `npm run build`      | Production build to `dist/`     |
| `npm run preview`    | Preview production build        |
| `npm run lint`       | Run ESLint across the project   |
| `npx tsc -b`         | Run TypeScript type checking    |

---

## Project Structure

```
chor-police-online/
├── src/                    # Frontend (React + Vite)
│   ├── components/         # Reusable UI & layout components
│   ├── pages/              # Route-level page components
│   ├── hooks/              # Custom React hooks
│   ├── store/              # Zustand state stores
│   ├── utils/              # Utility functions
│   ├── types/              # TypeScript type definitions
│   ├── constants/          # Game constants and configuration
│   ├── App.tsx             # Router setup
│   ├── main.tsx            # Entry point
│   └── index.css           # Tailwind CSS v4 + custom theme
├── server/                 # Backend (Express + Socket.IO)
│   └── src/
│       ├── index.ts        # Server entry point
│       ├── roomManager.ts  # Room lifecycle management
│       └── gameManager.ts  # Game phase logic
├── docs/                   # Documentation
│   ├── PRODUCT.md          # Product specification & rules
│   └── DEVELOPMENT.md      # Development diary & changelog
└── public/                 # Static assets
```

---

## Tech Stack

| Frontend       | Backend        |
| -------------- | -------------- |
| React 19       | Node.js        |
| TypeScript     | Express        |
| Vite 8         | Socket.IO      |
| Tailwind CSS 4 |                |
| Zustand        |                |
| React Router   |                |
| Framer Motion  |                |
| React Hook Form|                |

---

## Documentation

- **[PRODUCT.md](docs/PRODUCT.md)** — Complete game rules, UI/UX guidelines, architecture overview
- **[DEVELOPMENT.md](docs/DEVELOPMENT.md)** — Development diary, milestone tracking, technical decisions
