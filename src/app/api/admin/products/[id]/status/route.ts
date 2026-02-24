import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { productStatusSchema } from "@/lib/validators";

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  const role = (session?.user as { role?: string })?.role;
  if (role !== "ADMIN" && role !== "PARTNER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }
  return null;
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const authErr = await requireAdmin();
  if (authErr) return authErr;

  const { id } = await params;
  try {
    const body = await req.json();
    const parsed = productStatusSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0]?.message || "Invalid status" },
        { status: 400 }
      );
    }
    const product = await prisma.product.update({
      where: { id },
      data: { status: parsed.data.status },
    });
    return NextResponse.json(product);
  } catch (e) {
    console.error("Update status error:", e);
    return NextResponse.json({ error: "Failed to update status." }, { status: 500 });
  }
}
