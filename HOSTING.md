# Hosting & production setup

**Using Supabase?** See **[SUPABASE_SETUP.md](./SUPABASE_SETUP.md)** for step-by-step database setup (create project, get connection string, connect your app).

Recommended setup for a **secure, hosted** deployment:

- **App:** [Vercel](https://vercel.com) (Next.js, HTTPS, global CDN)
- **Database:** [Neon](https://neon.tech) or [Supabase](https://supabase.com) (managed PostgreSQL, no server to maintain)

Both have free tiers to start. All secrets stay in environment variables (never in code or in the repo).

---

## 1. Create the database (Neon or Supabase)

### Option A: Neon (simplest)

1. Go to [neon.tech](https://neon.tech) and sign up.
2. Create a new project (e.g. `element-store`).
3. Copy the **connection string** (looks like `postgresql://user:pass@ep-xxx.region.aws.neon.tech/neondb?sslmode=require`).
4. You’ll paste this as `DATABASE_URL` in Vercel later.

### Option B: Supabase

1. Go to [supabase.com](https://supabase.com) and create a project.
2. In **Project Settings → Database**, copy the **URI** (connection string). Use the “Transaction” pooler if you see pooler options (better for serverless).
3. Same as above: this is your `DATABASE_URL` for production.

---

## 2. Deploy the app on Vercel

1. Push your code to **GitHub** (if you haven’t already).
2. Go to [vercel.com](https://vercel.com), sign in with GitHub, and **Add New → Project**.
3. Import your `element-store` repo. Leave build settings as default (Vercel detects Next.js).
4. Before deploying, add **Environment Variables** (Settings → Environment Variables). Add every variable below for **Production** (and optionally Preview).

### Required environment variables (production)

| Variable | Where to get it | Notes |
|----------|-----------------|--------|
| `DATABASE_URL` | Neon or Supabase (step 1) | Full connection string; use **pooled** URL if they give one (e.g. Neon’s pooled endpoint). |
| `NEXTAUTH_URL` | Your live URL | e.g. `https://your-app.vercel.app` (no trailing slash). |
| `NEXTAUTH_SECRET` | Generate one | Run: `openssl rand -base64 32` (or use [generate-secret.vercel.app](https://generate-secret.vercel.app)). **Use a long random string; never the dev one.** |
| `STRIPE_SECRET_KEY` | [Stripe Dashboard → API keys](https://dashboard.stripe.com/apikeys) | Use **live** key (`sk_live_...`) for real payments. |
| `STRIPE_PUBLISHABLE_KEY` | Same | Use **live** key (`pk_live_...`). |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Same | Same as above (must be `NEXT_PUBLIC_` so the client can use it). |
| `STRIPE_WEBHOOK_SECRET` | Stripe Dashboard → Webhooks | Add endpoint `https://your-app.vercel.app/api/webhooks/stripe`, then copy the **Signing secret** (`whsec_...`). |
| `DIRECT_URL` | Supabase only | Same as SUPABASE_SETUP: direct Postgres URL (port 5432) for migrations. Optional on Vercel if you run `db push` from your machine. |

In production you **do not** use `.env` or `.env.stripe` files. Set all of the above in Vercel’s Environment Variables so they’re injected securely at build/runtime.

5. Deploy. After the first deploy, open your project’s **Settings → General → Build & Development Settings** and set:
   - **Build Command:** `prisma generate && next build` (or leave default if your `package.json` already has `prisma generate` in `build`).
6. Run migrations against the **production** database once (from your machine, with production `DATABASE_URL` set locally, or use Vercel’s run script if available):
   ```bash
   DATABASE_URL="your-neon-or-supabase-url" npx prisma migrate deploy
   ```
   If you don’t have migrations yet:
   ```bash
   DATABASE_URL="your-neon-or-supabase-url" npx prisma db push
   ```

---

## 3. Security checklist

- **Secrets only in env:** No `STRIPE_SECRET_KEY`, `NEXTAUTH_SECRET`, or DB URL in code or in Git. Vercel and Neon/Supabase keep them in env.
- **HTTPS:** Vercel gives you HTTPS and a proper domain.
- **Strong `NEXTAUTH_SECRET`:** Generate a new 32+ character random value for production; don’t reuse the dev secret.
- **Stripe live keys:** Use `sk_live_...` and `pk_live_...` in production; keep test keys only for local / preview.
- **Webhook secret:** Create a **new** webhook in Stripe for `https://your-app.vercel.app/api/webhooks/stripe` and use its signing secret in `STRIPE_WEBHOOK_SECRET`. Don’t reuse the Stripe CLI / test secret.
- **Database:** Use Neon or Supabase (managed Postgres, backups, SSL). Never commit `DATABASE_URL`.

---

## 4. After deploy

- Create your first admin user (e.g. run your seed once against production DB, or use sign-up + manual DB update to set `role = 'ADMIN'`).
- In Stripe Dashboard, add the production webhook URL and set `STRIPE_WEBHOOK_SECRET` in Vercel to the new secret.
- Optionally add a custom domain in Vercel and set `NEXTAUTH_URL` (and Stripe webhook URL) to that domain.

---

## Local development

- Use **Docker** Postgres (see [DATABASE.md](./DATABASE.md)) or a separate Neon/Supabase dev project.
- Use **test** Stripe keys and Stripe CLI for webhooks; keep `.env` and `.env.stripe` in `.gitignore` and never commit them.

This gives you a hosted app, a proper PostgreSQL database, and secrets handled securely via environment variables.
