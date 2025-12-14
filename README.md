# Vibe Quiz Frontend

A responsive Next.js App Router frontend for a Kahoot-like quiz experience. Hosts can create rooms, players join with a PIN, and sockets keep everyone synced.

## Stack
- Next.js 14 (App Router) + TypeScript
- Tailwind CSS for styling
- `socket.io-client` for realtime events
- `react-hot-toast` for feedback

## Getting started
1. Install dependencies:
   ```bash
   npm install
   ```
2. Copy the sample environment into `.env.local` (already provided):
   ```bash
   NEXT_PUBLIC_API_URL=http://localhost:4000
   NEXT_PUBLIC_ADMIN_TOKEN=devtoken
   ```
3. Run the dev server:
   ```bash
   npm run dev
   ```
4. Open http://localhost:3000 to use the app.

## Pages
- `/` Home: quick join form and links to host/admin.
- `/admin` Admin UI: create quizzes with questions, four choices, time limits, and correct answers. Uses `x-admin-token` header.
- `/host` Host UI: pick a quiz, create a room via sockets, manage game flow, view players, reveals, and scoreboard.
- `/play` Player UI: join via PIN + name, answer with big mobile-friendly buttons, see reveals and leaderboard.

## Realtime events
Each page establishes one socket connection and listens for:
- `room:update`
- `game:question`
- `game:reveal`
- `game:scoreboard`
- `game:ended`

Host emits: `host:create_room`, `host:start`, `host:next_question`, `host:end`.
Players emit: `player:join`, `player:answer`.

## Notes
- Styling is dark, glassy, and mobile-first. Answer buttons avoid layout shift when disabled.
- Toasts surface errors such as invalid PINs, room full, host disconnect, or game ended signals.
- Adjust `NEXT_PUBLIC_API_URL` to point at your backend (REST + sockets) before running.
