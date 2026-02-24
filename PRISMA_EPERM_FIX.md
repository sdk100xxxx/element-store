# Fix Prisma EPERM (Windows)

When you see:
`EPERM: operation not permitted, rename ... query_engine-windows.dll.node`

Something is locking the Prisma engine file. Do this **in order**:

## Step 1: Free the file

1. **Stop the dev server** – In the terminal where `npm run dev` is running, press **Ctrl+C** and wait until it stops.
2. **Close Cursor** – Fully quit Cursor (File → Exit or close the app). This releases any lock on `node_modules`.

## Step 2: Delete the Prisma client folder

3. Open **File Explorer** and go to:
   ```
   C:\Users\charl\Desktop\cursor\element-store\node_modules\.prisma
   ```
4. **Delete the `client` folder** (right‑click → Delete). If Windows says “in use”, restart the PC and try again, or close any other app that might be using the project folder.

## Step 3: Regenerate

5. Open a **new** **Command Prompt** or **PowerShell** (don’t use Cursor yet).
6. Run:
   ```bash
   cd C:\Users\charl\Desktop\cursor\element-store
   npx prisma generate
   npx prisma db push
   npm run db:seed
   ```
7. Reopen Cursor and run `npm run dev` again.

---

**One-liner (after Step 1 and 2):**  
In a new CMD/PowerShell:  
`cd C:\Users\charl\Desktop\cursor\element-store && npx prisma generate && npx prisma db push && npm run db:seed`
