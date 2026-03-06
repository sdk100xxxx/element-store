import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { compare, hash } from "bcryptjs";

export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || !["ADMIN", "PARTNER"].includes((session.user as { role?: string }).role ?? "")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const currentPassword = body.currentPassword?.toString?.()?.trim();
    const newEmail = body.newEmail?.toString?.()?.trim();
    const newPassword = body.newPassword?.toString?.()?.trim();

    if (!currentPassword) {
      return NextResponse.json({ error: "Current password is required." }, { status: 400 });
    }
    if (!newEmail && !newPassword) {
      return NextResponse.json({ error: "Provide new email and/or new password." }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, email: true, passwordHash: true },
    });
    if (!user?.passwordHash) {
      return NextResponse.json({ error: "User not found or cannot change password." }, { status: 400 });
    }

    const valid = await compare(currentPassword, user.passwordHash);
    if (!valid) {
      return NextResponse.json({ error: "Current password is incorrect." }, { status: 400 });
    }

    const updates: { email?: string; passwordHash?: string } = {};
    if (newEmail) {
      const emailLower = newEmail.toLowerCase();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailLower)) {
        return NextResponse.json({ error: "Invalid email address." }, { status: 400 });
      }
      const existing = await prisma.user.findUnique({ where: { email: emailLower } });
      if (existing && existing.id !== user.id) {
        return NextResponse.json({ error: "That email is already in use." }, { status: 400 });
      }
      updates.email = emailLower;
    }
    if (newPassword) {
      if (newPassword.length < 8) {
        return NextResponse.json({ error: "New password must be at least 8 characters." }, { status: 400 });
      }
      updates.passwordHash = await hash(newPassword, 12);
    }

    await prisma.user.update({
      where: { id: user.id },
      data: updates,
    });

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("Account update error:", e);
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}
