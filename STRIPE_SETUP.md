# Stripe setup (safe API keys)

Licenses are **only** created after Stripe confirms payment via the webhook. Keys are never sent before payment is complete.

## Safest way: environment variables only

**Never put Stripe keys in code or commit them to git.** Use environment variables only.

### 1. Get your keys from Stripe

1. Go to [Stripe Dashboard → Developers → API keys](https://dashboard.stripe.com/apikeys).
2. Copy:
   - **Secret key** (starts with `sk_test_` or `sk_live_`)
   - **Publishable key** (starts with `pk_test_` or `pk_live_`)

### 2. Add keys to `.env` (local)

In your project root, edit `.env` (create it from `.env.example` if needed):

```env
# Stripe - from https://dashboard.stripe.com/apikeys
STRIPE_SECRET_KEY="sk_test_xxxxxxxx"
STRIPE_PUBLISHABLE_KEY="pk_test_xxxxxxxx"
STRIPE_WEBHOOK_SECRET="whsec_xxxxxxxx"
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_xxxxxxxx"
```

- **Do not commit `.env`** — it should be in `.gitignore` (Next.js does this by default).
- Use **test** keys (`sk_test_`, `pk_test_`) for local/dev; use **live** keys only in production.

### 3. Webhook secret (required for license delivery)

The app only creates and shows license keys **after** Stripe sends `checkout.session.completed`. That happens in the webhook. The webhook secret verifies that the request really came from Stripe.

**Local development:**

1. Install Stripe CLI: <https://stripe.com/docs/stripe-cli>
2. Run: `stripe login`
3. Run: `stripe listen --forward-to localhost:3000/api/webhooks/stripe`
4. The CLI will print a **webhook signing secret** (e.g. `whsec_...`). Put that in `.env` as `STRIPE_WEBHOOK_SECRET`.

**Production:**

1. In [Stripe Dashboard → Developers → Webhooks](https://dashboard.stripe.com/webhooks), click **Add endpoint**.
2. **Endpoint URL:** `https://yourdomain.com/api/webhooks/stripe`
3. **Events to send:** select `checkout.session.completed` (or “Checkout” → “Session completed”).
4. After creating, open the endpoint and reveal **Signing secret**. Put that in your production env as `STRIPE_WEBHOOK_SECRET`.

### 4. Production (Vercel / Railway / etc.)

Add the same variables in your host’s **Environment variables** (or “Secrets”):

- `STRIPE_SECRET_KEY`
- `STRIPE_PUBLISHABLE_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`

Use **live** keys and the **production** webhook signing secret for the live site. Never paste keys into code or into a repo.

### 5. Flow summary

1. Customer pays on Stripe Checkout.
2. Stripe sends `checkout.session.completed` to your webhook.
3. Webhook verifies the request with `STRIPE_WEBHOOK_SECRET`, then marks the order **paid** and creates license keys.
4. Only then does the success page and “Manage Orders” show keys. The `/api/order/keys` endpoint also only returns keys when the order status is `paid`.

So licenses are never delivered until payment is fully complete.
