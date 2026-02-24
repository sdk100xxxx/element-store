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

export async function GET() {
  const authErr = await requireAdmin();
  if (authErr) return authErr;

  const groups = await prisma.productGroup.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { products: true } } },
  });
  return NextResponse.json(groups);
}

export async function POST(req: Request) {
  const authErr = await requireAdmin();
  if (authErr) return authErr;

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
    const existing = await prisma.productGroup.findUnique({ where: { slug } });
    if (existing) {
      return NextResponse.json(
        { error: "A group with this slug already exists." },
        { status: 400 }
      );
    }

    const group = await prisma.productGroup.create({
      data: { name, slug, image: image || undefined },
    });

    return NextResponse.json(group);
  } catch (e) {
    console.error("Create group error:", e);
    return NextResponse.json({ error: "Failed to create group." }, { status: 500 });
  }
}
