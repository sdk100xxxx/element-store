/**
 * One-time wipe of test data before launch.
 * Removes: all orders (and their items/licenses), all product serials (stock/keys),
 * audit log, and visitor sessions (total visitors). Products, users, groups, coupons stay.
 * Run: npm run db:wipe-test
 */
import path from "path";
import fs from "fs";

const envPath = path.resolve(__dirname, "..", ".env");
if (fs.existsSync(envPath)) {
  let raw = fs.readFileSync(envPath, "utf8");
  if (raw.charCodeAt(0) === 0xfeff) raw = raw.slice(1);
  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq <= 0) continue;
    const key = trimmed.slice(0, eq).trim();
    let val = trimmed.slice(eq + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'")))
      val = val.slice(1, -1);
    process.env[key] = val;
  }
}

if (!process.env.DIRECT_URL && process.env.DATABASE_URL) {
  process.env.DIRECT_URL = process.env.DATABASE_URL;
}

import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  console.log("Wiping test data...");

  const licenseKeys = await prisma.licenseKey.deleteMany({});
  console.log("  Deleted LicenseKey:", licenseKeys.count);

  const orderItems = await prisma.orderItem.deleteMany({});
  console.log("  Deleted OrderItem:", orderItems.count);

  const orders = await prisma.order.deleteMany({});
  console.log("  Deleted Order:", orders.count);

  const serials = await prisma.productSerial.deleteMany({});
  console.log("  Deleted ProductSerial (stock/keys):", serials.count);

  const auditLogs = await prisma.auditLog.deleteMany({});
  console.log("  Deleted AuditLog:", auditLogs.count);

  const visitorSessions = await prisma.visitorSession.deleteMany({});
  console.log("  Deleted VisitorSession (total visitors):", visitorSessions.count);

  console.log("Done. Orders, keys, stock, audit log, and visitors are reset. Products, users, groups, coupons unchanged.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
