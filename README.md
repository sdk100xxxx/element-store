# Element Store

A secure, full-featured digital product store built with Next.js, Stripe, and Prisma. Designed with a dark red theme and dragon branding.

## Features

- **Storefront**: Dark-themed homepage, product grid, product detail pages
- **Stripe Payments**: Full checkout flow with card payments
- **License Keys**: Auto-generated on successful payment (Sellauth-style)
- **Admin Panel**: Dashboard, products CRUD, orders view, settings
- **Authentication**: NextAuth with email/password, role-based access (USER, PARTNER, ADMIN)
- **Security**: Rate limiting, input validation (Zod), secure headers, protected admin routes

## Quick Start

### 1. Install dependencies

```bash
cd element-store
npm install
```

### 2. Set up the database

```bash
# Create .env with DATABASE_URL (SQLite by default)
# DATABASE_URL="file:./dev.db"

npm run db:push
npm run db:seed
```

Default admin: `admin@element.local` / `admin123456` (change immediately!)

### 3. Configure Stripe

Add to `.env`:

```
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

For webhooks (license key generation), add endpoint in Stripe Dashboard:
- URL: `https://yourdomain.com/api/webhooks/stripe`
- Events: `checkout.session.completed`

### 4. Run the app

```bash
npm run dev
```

Visit http://localhost:3000

## Admin Panel

- Go to `/admin` (requires ADMIN or PARTNER role)
- **Products**: Add, edit, delete products
- **Orders**: View all orders and status
- **Settings**: Stripe config, security info

## Creating Partners

Update a user's role in the database to `PARTNER` or `ADMIN`:

```bash
npm run db:studio
```

Then edit the user's `role` field in the User table.

## Production Checklist

1. Use PostgreSQL: `DATABASE_URL="postgresql://..."`
2. Set `NEXTAUTH_SECRET` to a secure random string
3. Use Stripe live keys
4. Consider Redis for rate limiting (multi-instance)
5. Add HTTPS (e.g. Vercel, Railway)
