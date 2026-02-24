import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const sessionId = searchParams.get("session_id");
  if (!sessionId) {
    return NextResponse.json({ keys: [], serviceItems: false });
  }

  const order = await prisma.order.findFirst({
    where: { stripeSessionId: sessionId },
    include: { licenses: true, items: { include: { product: true } } },
  });

  if (!order) {
    return NextResponse.json({ keys: [], serviceItems: false });
  }

  // Never return keys until payment is fully complete (Stripe webhook sets status to "paid")
  if (order.status !== "paid") {
    return NextResponse.json({ keys: [], serviceItems: false });
  }

  const session = await getServerSession(authOptions);
  const orderEmail = (order.email || "").toLowerCase();
  const isOwner =
    session?.user?.id === order.userId ||
    (!!session?.user?.email && orderEmail === session.user.email.toLowerCase());
  if (!isOwner) {
    return NextResponse.json({ keys: [], serviceItems: false });
  }

  const keys = order.licenses.filter((l) => l.isActive).map((l) => l.key);
  const serviceItems = order.items.some(
    (i) => (i.product as { deliveryType?: string }).deliveryType === "SERVICE"
  );
  return NextResponse.json({ keys, serviceItems });
}
