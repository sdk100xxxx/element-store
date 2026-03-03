import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { randomUUID } from "crypto";
import { rateLimitTraction, getClientIp } from "@/lib/security";

const COOKIE_NAME = "vid";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // 1 year

export async function POST() {
  const ip = getClientIp();
  const { allowed } = rateLimitTraction(ip);
  if (!allowed) {
    return NextResponse.json({ ok: true }, { status: 200 });
  }

  const cookieStore = await cookies();
  let visitorId = cookieStore.get(COOKIE_NAME)?.value;
  if (!visitorId || visitorId.length < 10) {
    visitorId = randomUUID();
    cookieStore.set(COOKIE_NAME, visitorId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: COOKIE_MAX_AGE,
      path: "/",
    });
  }

  try {
    await prisma.visitorSession.upsert({
      where: { visitorId },
      create: { visitorId, lastSeenAt: new Date() },
      update: { lastSeenAt: new Date() },
    });
  } catch {
    // ignore
  }
  return NextResponse.json({ ok: true });
}
