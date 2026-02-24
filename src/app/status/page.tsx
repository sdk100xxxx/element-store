import { prisma } from "@/lib/prisma";
import { StatusContent } from "./StatusContent";

export const dynamic = "force-dynamic";

const FALLBACK_ITEMS = [
  { id: "ancient-arc-raiders", name: "Ancient Arc Raiders", slug: "ancient-arc-raiders", status: "UNDETECTED" },
  { id: "arcane-fortnite", name: "Arcane Fortnite", slug: "arcane-fortnite", status: "UNDETECTED" },
  { id: "akuma-rust", name: "Akuma Rust", slug: "akuma-rust", status: "UNDETECTED" },
  { id: "noah-cod", name: "Noah Cod", slug: "noah-cod", status: "UNDETECTED" },
  { id: "ancient-rainbow-six", name: "Ancient Rainbow Six", slug: "ancient-rainbow-six", status: "UNDETECTED" },
  { id: "temp-hwid", name: "Temp HWID", slug: "temp-hwid", status: "UNDETECTED" },
];

export default async function StatusPage() {
  let items: { id: string; name: string; slug: string; status: string }[];
  try {
    const client = prisma as { statusItem?: { findMany: (args: object) => Promise<typeof FALLBACK_ITEMS> } };
    if (client.statusItem) {
      items = await client.statusItem.findMany({
        orderBy: { name: "asc" },
        select: { id: true, name: true, slug: true, status: true },
      });
    } else {
      items = FALLBACK_ITEMS;
    }
  } catch {
    items = FALLBACK_ITEMS;
  }
  return <StatusContent items={items} />;
}
