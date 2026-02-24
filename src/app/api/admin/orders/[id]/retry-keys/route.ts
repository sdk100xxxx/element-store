import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { assignOrderKeys } from "@/lib/assign-order-keys";
import { auditLog } from "@/lib/audit";

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  const role = (session?.user as { role?: string })?.role;
  if (role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { id: orderId } = await params;
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: { include: { product: true } } },
  });

  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }
  if (order.status !== "paid") {
    return NextResponse.json(
      { error: "Order is not paid; only paid orders can have keys assigned" },
      { status: 400 }
    );
  }

  const existingCount = await prisma.licenseKey.count({ where: { orderId } });
  if (existingCount > 0) {
    return NextResponse.json(
      { error: "Order already has license keys; no retry needed" },
      { status: 400 }
    );
  }

  try {
    await prisma.$transaction(async (tx) => {
      await assignOrderKeys(tx, order);
    });
    const assigned = await prisma.licenseKey.count({ where: { orderId } });
    await auditLog({
      action: "order_keys_retry",
      entityType: "order",
      entityId: orderId,
      userId: (session?.user as { id?: string })?.id,
      details: { assigned, source: "admin_retry" },
    });
    return NextResponse.json({ assigned });
  } catch (err) {
    console.error("Retry key assignment error:", err);
    return NextResponse.json(
      { error: "Failed to assign keys", message: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
}
