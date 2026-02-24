import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const items = await prisma.downloadItem.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true, slug: true, fileUrl: true },
  });
  return NextResponse.json(items);
}
