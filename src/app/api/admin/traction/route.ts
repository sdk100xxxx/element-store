import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const ONLINE_WITHIN_MS = 2 * 60 * 1000; // 2 minutes

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user || !["ADMIN", "PARTNER"].includes((session.user as { role?: string }).role ?? "")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const since = new Date(Date.now() - ONLINE_WITHIN_MS);
  const [onlineCount, totalVisitors] = await Promise.all([
    prisma.visitorSession.count({
      where: { lastSeenAt: { gte: since } },
    }),
    prisma.visitorSession.count(),
  ]);

  return NextResponse.json({ onlineCount, totalVisitors });
}
