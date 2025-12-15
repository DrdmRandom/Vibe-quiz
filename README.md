# VibeQuiz

VibeQuiz is a lightweight Kahoot-style live quiz platform built with a pnpm monorepo.

## Structure
- `apps/server` – NestJS API + Socket.IO real-time gateway (Prisma/PostgreSQL)
- `apps/web` – React + Vite frontend with Tailwind and shadcn/ui primitives
- `packages/shared` – Shared TypeScript DTOs and scoring helpers

## Getting started
1. Copy `.env.example` to `.env` and set secrets (not committed). Database must point to the provided PostgreSQL server.
2. Install dependencies:
   ```bash
   pnpm install
   ```
3. Run database migrations and seed the sample host + quiz:
   ```bash
   pnpm db:migrate
   pnpm db:seed
   ```
4. Start both frontend and backend:
   ```bash
   pnpm dev
   ```

The API listens on `PORT` (default 3000) and the web app on `WEB_PORT` (default 5173). Socket.IO namespace `/session` handles live play.

## Testing
Run server unit tests:
```bash
pnpm --filter @vibequiz/server test
```

## Notes
- JWT-secured host/admin auth (email/password) with REST endpoints under `/api`.
- Socket events under `/session` cover host controls and player answers, including reconnection tokens.
- Prisma schema matches the requested live session models; seed creates `host@example.com` / `password123` with a published quiz.
- Podman-friendly: no platform-specific tooling required; run `pnpm dev` to start processes separately or within containers.
