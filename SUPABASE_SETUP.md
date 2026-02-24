# Set up Supabase database (step-by-step)

You’ll create a free Supabase project, get a connection string, and connect your app to it.

---

## 1. Create a Supabase account and project

1. Go to **[supabase.com](https://supabase.com)** and click **Start your project**.
2. Sign up (GitHub or email).
3. Click **New project**.
4. Fill in:
   - **Name:** e.g. `element-store`
   - **Database password:** choose a strong password and **save it** (you need it for the connection string).
   - **Region:** pick one close to you (or your users).
5. Click **Create new project**. Wait 1–2 minutes until the project is ready.

---

## 2. Get your database connection string

1. In the Supabase dashboard, open your project (you should already be there).
2. In the **left sidebar**, scroll to the bottom and click the **⚙️ Settings** (gear) icon.
3. In the settings menu that appears, click **Database**.  
   You’re now on the Database settings page.
4. Scroll down until you see a section titled **Connection string**.  
   You’ll see one or more connection strings (URI, maybe “Session” or “Transaction”).
5. Click the **URI** tab (or use the **Transaction** / port **6543** one if you see pooler options—either is fine for this app).
6. **Copy the whole string** (e.g. click the copy icon next to it). It will look something like:
   ```text
   postgresql://postgres.xxxxx:[YOUR-PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres
   ```
   The `[YOUR-PASSWORD]` part is a **placeholder**—Supabase doesn’t put your real password in the copy for security.
7. **Paste the string somewhere** (e.g. Notepad), then **replace the literal text `[YOUR-PASSWORD]`** with the actual database password you chose when you created the project (in step 1.4).  
   - Example: if your password is `mypass123`, the middle part should become `:mypass123@` (no brackets).  
   - If your password contains **special characters** (`#`, `@`, `%`, `!`, etc.), you must “URL-encode” them or the connection may fail:
     - `#` → `%23`
     - `@` → `%40`
     - `%` → `%25`
     - `!` → `%21`  
   The final string is your **connection string**; you’ll use it in step 3 as `DATABASE_URL`.

---

## 3. Add the URL to your project

### For local development (right now)

1. Open your project’s **`.env`** file.
2. Find the line that says `DATABASE_URL=...`.
3. Replace it with your Supabase connection string (the one with the password filled in):
   ```env
   DATABASE_URL="postgresql://postgres.[project-ref]:YOUR_PASSWORD@aws-0-[region].pooler.supabase.com:6543/postgres?pgbouncer=true"
   ```
   Or, if you’re using the **direct** connection (port 5432):
   ```env
   DATABASE_URL="postgresql://postgres.[project-ref]:YOUR_PASSWORD@db.[project-ref].supabase.co:5432/postgres"
   ```
   Use one line, in quotes, no spaces around `=`.

### For production (when you deploy to Vercel)

You’ll paste the **same** connection string into Vercel’s **Environment Variables** as `DATABASE_URL` (see [HOSTING.md](./HOSTING.md)).

---

## 4. Create the tables in Supabase

From your project folder in a terminal (with the new `DATABASE_URL` in `.env`), run:

```bash
npx prisma db push
```

That creates all the tables (Users, Orders, Products, **AuditLog**, etc.) in your Supabase database.

**Backup & logging:** The app has an **audit log** that records when you add keys (serials) and when orders are paid (or declined/expired). You can view it under **Admin → Activity log**. Supabase also keeps database backups (see your project’s **Settings → Backups** in the Supabase dashboard), so you have a trail and recovery options.

Optional: seed an admin user:

```bash
npm run db:seed
```

---

## 5. Run the app

```bash
npm run dev
```

Your app now uses the Supabase database. You can confirm in the Supabase dashboard under **Table Editor** — you should see the tables after step 4.

---

## Quick checklist

- [ ] Supabase account created
- [ ] New project created (password saved)
- [ ] Connection string copied from **Settings → Database → Connection string (URI)**
- [ ] `[YOUR-PASSWORD]` replaced in the string
- [ ] `DATABASE_URL` in `.env` updated to that string
- [ ] `npx prisma db push` run successfully
- [ ] `npm run dev` works and app loads

If anything fails, double-check the password in the URL and that there are no extra spaces or line breaks in `.env`.
