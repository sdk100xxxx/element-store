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

  // Ancient Arc Raiders: single product (no Day/Week/Month)
  const ancientArcRaidersId = await getGroupId("ancient-arc-raiders");
  await upsertProduct({
    slug: "ancient-arc-raiders",
    name: "Ancient Arc Raiders",
    description: "Ancient Arc Raiders key.",
    price: 500,
    groupId: ancientArcRaidersId,
  });

  // Noah COD: Day, Week, Month
  const noahCodId = await getGroupId("noah-cod");
  for (const variant of [
    { slug: "noah-cod-day", name: "Noah COD Day" },
    { slug: "noah-cod-week", name: "Noah COD Week" },
    { slug: "noah-cod-month", name: "Noah COD Month" },
  ]) {
    await upsertProduct({
      slug: variant.slug,
      name: variant.name,
      description: `${variant.name} key.`,
      price: 500,
      groupId: noahCodId,
    });
  }

  // Arcane Fortnite: Day, Week, Month
  const arcaneFortniteId = await getGroupId("arcane-fortnite");
  for (const variant of [
    { slug: "arcane-fortnite-day", name: "Arcane Fortnite Day" },
    { slug: "arcane-fortnite-week", name: "Arcane Fortnite Week" },
    { slug: "arcane-fortnite-month", name: "Arcane Fortnite Month" },
  ]) {
    await upsertProduct({
      slug: variant.slug,
      name: variant.name,
      description: `${variant.name} key.`,
      price: 500,
      groupId: arcaneFortniteId,
    });
  }

  // Ancient Rainbow Six: Day, Week, Month
  const ancientRainbowSixId = await getGroupId("ancient-rainbow-six");
  for (const variant of [
    { slug: "ancient-rainbow-six-day", name: "Ancient Rainbow Six Day" },
    { slug: "ancient-rainbow-six-week", name: "Ancient Rainbow Six Week" },
    { slug: "ancient-rainbow-six-month", name: "Ancient Rainbow Six Month" },
  ]) {
    await upsertProduct({
      slug: variant.slug,
      name: variant.name,
      description: `${variant.name} key.`,
      price: 500,
      groupId: ancientRainbowSixId,
    });
  }

  // Akuma Rust: Day, Week, Month
  const akumaRustId = await getGroupId("akuma-rust");
  for (const variant of [
    { slug: "akuma-rust-day", name: "Akuma Rust Day" },
    { slug: "akuma-rust-week", name: "Akuma Rust Week" },
    { slug: "akuma-rust-month", name: "Akuma Rust Month" },
  ]) {
    await upsertProduct({
      slug: variant.slug,
      name: variant.name,
      description: `${variant.name} key.`,
      price: 500,
      groupId: akumaRustId,
    });
  }

  // Temp HWID: Day, Week, Month, Lifetime
  const tempHwidId = await getGroupId("temp-hwid");
  for (const variant of [
    { slug: "temp-hwid-day", name: "Temp HWID Day" },
    { slug: "temp-hwid-week", name: "Temp HWID Week" },
    { slug: "temp-hwid-month", name: "Temp HWID Month" },
    { slug: "temp-hwid-lifetime", name: "Temp HWID Lifetime" },
  ]) {
    await upsertProduct({
      slug: variant.slug,
      name: variant.name,
      description: `${variant.name} key.`,
      price: 500,
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
