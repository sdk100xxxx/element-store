import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { downloadItemSchema } from "@/lib/validators";

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  const role = (session?.user as { role?: string })?.role;
  if (role !== "ADMIN" && role !== "PARTNER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }
  return null;
}

export async function POST(req: Request) {
  const authErr = await requireAdmin();
  if (authErr) return authErr;

  try {
    const body = await req.json();
    const parsed = downloadItemSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0]?.message || "Invalid input" },
        { status: 400 }
      );
    }
    const { name, slug } = parsed.data;
    const existing = await prisma.downloadItem.findUnique({ where: { slug } });
    if (existing) {
      return NextResponse.json(
        { error: "A download item with this slug already exists." },
        { status: 400 }
      );
    }
    const item = await prisma.downloadItem.create({
      data: { name, slug },
    });
    return NextResponse.json(item);
  } catch (e) {
    console.error("Create download item error:", e);
    return NextResponse.json({ error: "Failed to create." }, { status: 500 });
  }
}
