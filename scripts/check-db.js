/**
 * Test database connection. Run: node scripts/check-db.js
 * Loads .env from project root. Needs DATABASE_URL or DIRECT_URL.
 */
const path = require("path");
const fs = require("fs");

// Load .env
const envPath = path.join(__dirname, "..", ".env");
if (fs.existsSync(envPath)) {
  const raw = fs.readFileSync(envPath, "utf8").replace(/^\uFEFF/, "");
  for (const line of raw.split(/\r?\n/)) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const i = t.indexOf("=");
    if (i <= 0) continue;
    const key = t.slice(0, i).trim();
    let val = t.slice(i + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'")))
      val = val.slice(1, -1);
    process.env[key] = val;
  }
}

const url = process.env.DIRECT_URL || process.env.DATABASE_URL;
if (!url) {
  console.error("No DIRECT_URL or DATABASE_URL in .env");
  process.exit(1);
}

// Hide password in log
const safeUrl = url.replace(/:[^:@]+@/, ":****@");
console.log("Connecting to:", safeUrl);

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

prisma
  .$connect()
  .then(() => {
    console.log("OK – database reachable.");
    return prisma.$disconnect();
  })
  .catch((e) => {
    console.error("Failed:", e.message);
    process.exit(1);
  });
