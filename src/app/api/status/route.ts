import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const items = await prisma.statusItem.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true, slug: true, status: true },
  });
  return NextResponse.json(items);
}
