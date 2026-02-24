import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { groupSchema } from "@/lib/validators";

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  const role = (session?.user as { role?: string })?.role;
  if (role !== "ADMIN" && role !== "PARTNER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }
  return null;
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const authErr = await requireAdmin();
  if (authErr) return authErr;

  const { id } = await params;

  try {
    const body = await req.json();
    const parsed = groupSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0]?.message || "Invalid input" },
        { status: 400 }
      );
    }

    const { name, slug, image } = parsed.data;
    const existing = await prisma.productGroup.findFirst({
      where: { slug, NOT: { id } },
    });
    if (existing) {
      return NextResponse.json(
        { error: "A group with this slug already exists." },
        { status: 400 }
      );
    }

    const group = await prisma.productGroup.update({
      where: { id },
      data: { name, slug, image: image ?? undefined },
    });

    return NextResponse.json(group);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to update group.";
    console.error("Update group error:", e);
    return NextResponse.json(
      { error: process.env.NODE_ENV === "development" ? message : "Failed to update group." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const authErr = await requireAdmin();
  if (authErr) return authErr;

  const { id } = await params;

  try {
    await prisma.productGroup.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("Delete group error:", e);
    return NextResponse.json({ error: "Failed to delete group." }, { status: 500 });
  }
}
