# Database (PostgreSQL)

The app uses **PostgreSQL**. For **hosting in production** (secure, managed DB), see **[HOSTING.md](./HOSTING.md)** — use Neon or Supabase and set `DATABASE_URL` in your host's environment variables.

Below is for **local** development only.

## Local: Docker

1. Start Postgres:
   ```bash
   docker compose up -d
   ```

2. In `.env`, set:
   ```env
   DATABASE_URL="postgresql://elementstore:elementstore@localhost:5432/elementstore"
   ```

3. Create tables (first time):
   ```bash
   npx prisma db push
   ```
   Or with migrations:
   ```bash
   npx prisma migrate dev --name init
   ```

4. (Optional) Seed admin user:
   ```bash
   npm run db:seed
   ```

5. Start the app:
   ```bash
   npm run dev
   ```

To stop the database: `docker compose down`.

## Hosted (production)

Use a **managed PostgreSQL** (Neon or Supabase) and set env vars on your host. Full steps: **[HOSTING.md](./HOSTING.md)**.

## Switching from SQLite

If you were using SQLite (`file:./dev.db`) before, your data stays in `prisma/dev.db`. PostgreSQL starts empty. Re-add products and run the seed if needed.
