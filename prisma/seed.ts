import path from "path";
import fs from "fs";

// Load .env manually so BOM/encoding never break DATABASE_URL
const envPath = path.resolve(__dirname, "..", ".env");
if (fs.existsSync(envPath)) {
  let raw = fs.readFileSync(envPath, "utf8");
  if (raw.charCodeAt(0) === 0xfeff) raw = raw.slice(1); // strip BOM
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

const dbUrl = process.env.DATABASE_URL?.trim() ?? "";
if (!dbUrl.startsWith("postgresql://") && !dbUrl.startsWith("postgres://")) {
  console.error("DATABASE_URL must be set and start with postgresql:// or postgres://");
  console.error("Loaded .env from:", envPath);
  process.exit(1);
}

import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL || "admin@element.local";
  const adminPassword = process.env.ADMIN_PASSWORD || "admin123456";

  const passwordHash = await hash(adminPassword, 12);

  await prisma.user.upsert({
    where: { email: adminEmail },
    create: {
      email: adminEmail,
      name: "Admin",
      passwordHash,
      role: "ADMIN",
    },
    update: {
      passwordHash,
      role: "ADMIN",
      name: "Admin",
    },
  });

  // Replace old "8 Ball Pool" with "Temp HWID" if present
  const oldEightBall = await prisma.downloadItem.findUnique({ where: { slug: "8-ball-pool" } });
  if (oldEightBall) {
    await prisma.downloadItem.update({
      where: { id: oldEightBall.id },
      data: { name: "Temp HWID", slug: "temp-hwid" },
    });
    console.log("Renamed 8 Ball Pool to Temp HWID");
  }

  const downloadItems = [
    { name: "Ancient Arc Raiders", slug: "ancient-arc-raiders" },
    { name: "Arcane Fortnite", slug: "arcane-fortnite" },
    { name: "Akuma Rust", slug: "akuma-rust" },
    { name: "Temp HWID", slug: "temp-hwid" },
    { name: "Noah Cod", slug: "noah-cod" },
    { name: "Ancient R6", slug: "ancient-r6" },
  ];
  for (const item of downloadItems) {
    await prisma.downloadItem.upsert({
      where: { slug: item.slug },
      create: item,
      update: {},
    });
  }
  console.log("Download items ready:", downloadItems.length);

  const statusItems = [
    { name: "Ancient Arc Raiders", slug: "ancient-arc-raiders" },
    { name: "Arcane Fortnite", slug: "arcane-fortnite" },
    { name: "Akuma Rust", slug: "akuma-rust" },
    { name: "Noah Cod", slug: "noah-cod" },
    { name: "Ancient Rainbow Six", slug: "ancient-rainbow-six" },
    { name: "Temp HWID", slug: "temp-hwid" },
  ];
  for (const item of statusItems) {
    await prisma.statusItem.upsert({
      where: { slug: item.slug },
      create: item,
      update: {},
    });
  }
  console.log("Status items ready:", statusItems.length);

  // Store layout: groups = game names (left); products = Day / Week / Month / Lifetime (right).
  // Remove old "Keys" and "Game keys" so DB matches this layout (products in those groups become uncategorized).
  await prisma.productGroup.deleteMany({ where: { slug: { in: ["keys", "game-keys"] } } });

  // Groups in display order: Ancient Arc Raiders, Noah COD, Arcane Fortnite, Ancient Rainbow Six, Akuma Rust, Temp HWID
  const groupDefs: { name: string; slug: string; sortOrder: number }[] = [
    { name: "Ancient Arc Raiders", slug: "ancient-arc-raiders", sortOrder: 0 },
    { name: "Noah COD", slug: "noah-cod", sortOrder: 1 },
    { name: "Arcane Fortnite", slug: "arcane-fortnite", sortOrder: 2 },
    { name: "Ancient Rainbow Six", slug: "ancient-rainbow-six", sortOrder: 3 },
    { name: "Akuma Rust", slug: "akuma-rust", sortOrder: 4 },
    { name: "Temp HWID", slug: "temp-hwid", sortOrder: 5 },
  ];
  for (const g of groupDefs) {
    await prisma.productGroup.upsert({
      where: { slug: g.slug },
      create: { name: g.name, slug: g.slug, sortOrder: g.sortOrder },
      update: { name: g.name, sortOrder: g.sortOrder },
    });
  }

  const getGroupId = async (slug: string) => (await prisma.productGroup.findUnique({ where: { slug }, select: { id: true } }))!.id;

  const upsertProduct = async (opts: {
    slug: string;
    name: string;
    description: string | null;
    price: number;
    groupId: string;
  }) => {
    await prisma.product.upsert({
      where: { slug: opts.slug },
      create: {
        name: opts.name,
        slug: opts.slug,
        description: opts.description,
        price: opts.price,
        groupId: opts.groupId,
        isActive: true,
        deliveryType: "SERIAL",
      },
      update: { name: opts.name, description: opts.description, price: opts.price, groupId: opts.groupId },
    });
  };

  // Ancient Arc Raiders: Day, Week, Month ($5.60, $24, $48)
  // Update existing single product to Day (so orders keep working), then add Week and Month
  const ancientArcRaidersId = await getGroupId("ancient-arc-raiders");
  const existingArc = await prisma.product.findUnique({ where: { slug: "ancient-arc-raiders" } });
  if (existingArc) {
    await prisma.product.update({
      where: { id: existingArc.id },
      data: {
        name: "Ancient Arc Raiders: 1 Day Key",
        description: "Ancient Arc Raiders: 1 Day Key.",
        price: 560,
        groupId: ancientArcRaidersId,
      },
    });
  } else {
    await upsertProduct({
      slug: "ancient-arc-raiders-day",
      name: "Ancient Arc Raiders: 1 Day Key",
      description: "Ancient Arc Raiders: 1 Day Key.",
      price: 560,
      groupId: ancientArcRaidersId,
    });
  }
  for (const v of [
    { slug: "ancient-arc-raiders-week", name: "Ancient Arc Raiders: 1 Week Key", price: 2400 },
    { slug: "ancient-arc-raiders-month", name: "Ancient Arc Raiders: 1 Month Key", price: 4800 },
  ]) {
    await upsertProduct({
      slug: v.slug,
      name: v.name,
      description: `${v.name}.`,
      price: v.price,
      groupId: ancientArcRaidersId,
    });
  }

  // Noah COD: Day, Week, Month ($5, $17, $40)
  const noahCodId = await getGroupId("noah-cod");
  for (const v of [
    { slug: "noah-cod-day", name: "Noah Cod: 1 Day Key", price: 500 },
    { slug: "noah-cod-week", name: "Noah Cod: 1 Week Key", price: 1700 },
    { slug: "noah-cod-month", name: "Noah Cod: 1 Month Key", price: 4000 },
  ]) {
    await upsertProduct({
      slug: v.slug,
      name: v.name,
      description: `${v.name}.`,
      price: v.price,
      groupId: noahCodId,
    });
  }

  // Arcane Fortnite: Day, Week, Month ($9, $44, $76)
  const arcaneFortniteId = await getGroupId("arcane-fortnite");
  for (const v of [
    { slug: "arcane-fortnite-day", name: "Arcane Fortnite: 1 Day Key", price: 900 },
    { slug: "arcane-fortnite-week", name: "Arcane Fortnite: 1 Week Key", price: 4400 },
    { slug: "arcane-fortnite-month", name: "Arcane Fortnite: 1 Month Key", price: 7600 },
  ]) {
    await upsertProduct({
      slug: v.slug,
      name: v.name,
      description: `${v.name}.`,
      price: v.price,
      groupId: arcaneFortniteId,
    });
  }

  // Ancient Rainbow Six: Day, Week, Month ($4, $15, $30)
  const ancientRainbowSixId = await getGroupId("ancient-rainbow-six");
  for (const v of [
    { slug: "ancient-rainbow-six-day", name: "Ancient Rainbow Six: 1 Day Key", price: 400 },
    { slug: "ancient-rainbow-six-week", name: "Ancient Rainbow Six: 1 Week Key", price: 1500 },
    { slug: "ancient-rainbow-six-month", name: "Ancient Rainbow Six: 1 Month Key", price: 3000 },
  ]) {
    await upsertProduct({
      slug: v.slug,
      name: v.name,
      description: `${v.name}.`,
      price: v.price,
      groupId: ancientRainbowSixId,
    });
  }

  // Akuma Rust: Day, Week, Month ($8, $20, $50)
  const akumaRustId = await getGroupId("akuma-rust");
  for (const v of [
    { slug: "akuma-rust-day", name: "Akuma Rust: 1 Day Key", price: 800 },
    { slug: "akuma-rust-week", name: "Akuma Rust: 1 Week Key", price: 2000 },
    { slug: "akuma-rust-month", name: "Akuma Rust: 1 Month Key", price: 5000 },
  ]) {
    await upsertProduct({
      slug: v.slug,
      name: v.name,
      description: `${v.name}.`,
      price: v.price,
      groupId: akumaRustId,
    });
  }

  // Temp HWID: Day, Week, Month, Lifetime ($3, $10, $20, $50)
  const tempHwidId = await getGroupId("temp-hwid");
  for (const v of [
    { slug: "temp-hwid-day", name: "Temp HWID: 1 Day Key", price: 300 },
    { slug: "temp-hwid-week", name: "Temp HWID: 1 Week Key", price: 1000 },
    { slug: "temp-hwid-month", name: "Temp HWID: 1 Month Key", price: 2000 },
    { slug: "temp-hwid-lifetime", name: "Temp HWID: Lifetime Key", price: 5000 },
  ]) {
    await upsertProduct({
      slug: v.slug,
      name: v.name,
      description: `${v.name}.`,
      price: v.price,
      groupId: tempHwidId,
    });
  }

  console.log("Store: 6 groups (games), products = Day/Week/Month/Lifetime per group");

  console.log("Admin user ready:", adminEmail);
  console.log("Password: admin123456 (change immediately in production!)");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
