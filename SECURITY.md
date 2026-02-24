# Security checklist

Use this to keep the app and data safe.

## Already in place

- **Admin area** – Only users with role `ADMIN` or `PARTNER` can access `/admin/*` (enforced by middleware).
- **Admin API routes** – All `/api/admin/*` endpoints check session and role before doing anything.
- **Security headers** – `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy` are set in `next.config.js`.
- **Sign-in rate limiting** – Login attempts are rate-limited per email to slow brute force.
- **Checkout rate limiting** – Checkout requests are rate-limited per IP.
- **Secrets in env** – Stripe keys, `NEXTAUTH_SECRET`, and `DATABASE_URL` are read from environment variables, not from code. Never commit `.env` or `.env.stripe`.

## You should do

1. **Change the default admin password**  
   After first sign-in (e.g. `admin@element.local` / `admin123456`), change the password or create a new admin user and remove the default one.

2. **Strong `NEXTAUTH_SECRET` in production**  
   Generate a new secret, e.g. `openssl rand -base64 32`, and set it in your host’s env. Do not use the dev value in production.

3. **Stripe live keys**  
   In production use live Stripe keys and a new webhook secret for your live URL. Keep test keys only for local/preview.

4. **Database**  
   Use a managed PostgreSQL (e.g. Supabase) with SSL. Set `DATABASE_URL` only in the host’s env. Restrict DB access by IP if your provider supports it.

5. **HTTPS**  
   Use HTTPS in production (Vercel and similar provide it). Set `NEXTAUTH_URL` to your `https://` URL.

## Optional (production)

- **Stricter rate limits** – Reduce `RATE_LIMIT_MAX` or use Redis for limits across instances.
- **CSP** – Add a Content-Security-Policy header if you want to restrict scripts and sources (test carefully so the app still works).
