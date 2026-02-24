import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { auditLog } from "@/lib/audit";

async function requireAdmin(): Promise<
  { error: NextResponse } | { session: { user: { id?: string }; [k: string]: unknown } }
> {
  const session = await getServerSession(authOptions);
  const role = (session?.user as { role?: string })?.role;
  if (role !== "ADMIN" && role !== "PARTNER") {
    return { error: NextResponse.json({ error: "Unauthorized" }, { status: 403 }) };
  }
  return { session: session! };
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;

  const { id: productId } = await params;
  const product = await prisma.product.findUnique({
    where: { id: productId },
    select: { id: true },
  });
  if (!product) {
    return NextResponse.json({ error: "Product not found." }, { status: 404 });
  }

  const serials = await prisma.productSerial.findMany({
    where: { productId },
    orderBy: { createdAt: "desc" },
  });
  const inStock = serials.filter((s) => !s.orderId).length;
  return NextResponse.json({ serials, inStock });
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;
  const session = auth.session;

  const { id: productId } = await params;
  const product = await prisma.product.findUnique({
    where: { id: productId },
    select: { id: true, name: true },
  });
  if (!product) {
    return NextResponse.json({ error: "Product not found." }, { status: 404 });
  }

  try {
    const body = await req.json();
    const serialsToAdd: string[] = body.serials
      ? Array.isArray(body.serials)
        ? body.serials.map((s: unknown) => String(s).trim()).filter(Boolean)
        : []
      : body.serial
        ? [String(body.serial).trim()].filter(Boolean)
        : [];

    if (serialsToAdd.length === 0) {
      return NextResponse.json(
        { error: "Provide 'serial' or 'serials' array." },
        { status: 400 }
      );
    }

    const created = await prisma.$transaction(
      serialsToAdd.map((serial) =>
        prisma.productSerial.create({
          data: { productId, serial },
        })
      )
    );

    await auditLog({
      action: "serial_added",
      userId: (session.user as { id?: string })?.id,
      entityType: "product",
      entityId: productId,
      details: { productName: product.name, count: created.length },
    });

    return NextResponse.json({ added: created.length, serials: created });
  } catch (e) {
    console.error("Add serials error:", e);
    return NextResponse.json({ error: "Failed to add serials." }, { status: 500 });
  }
}
