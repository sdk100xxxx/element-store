import { NextResponse } from "next/server";
import Stripe from "stripe";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { generateLicenseKey } from "@/lib/license";
import { getStripe, getStripeWebhookSecret } from "@/lib/stripe";
import { auditLog } from "@/lib/audit";

export async function POST(req: Request) {
  const stripe = getStripe();
  const webhookSecret = getStripeWebhookSecret();
  if (!stripe || !webhookSecret) {
    return NextResponse.json({ error: "Webhook not configured" }, { status: 500 });
  }

  const body = await req.text();
  const headersList = headers();
  const signature = headersList.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("Webhook signature verification failed:", message);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  // Payment attempted but failed (e.g. card declined). Session metadata includes orderId.
  if (event.type === "payment_intent.payment_failed") {
    const paymentIntent = event.data.object as Stripe.PaymentIntent;
    const orderId = paymentIntent.metadata?.orderId;
    if (orderId) {
      await prisma.order.updateMany({
        where: { id: orderId, status: "pending" },
        data: { status: "declined" },
      });
      await auditLog({
        action: "order_declined",
        entityType: "order",
        entityId: orderId,
        details: { source: "stripe_webhook" },
      });
    }
  }

  // Checkout session expired (customer didn't complete in time).
  if (event.type === "checkout.session.expired") {
    const session = event.data.object as Stripe.Checkout.Session;
    if (session.id) {
      const updated = await prisma.order.updateMany({
        where: { stripeSessionId: session.id, status: "pending" },
        data: { status: "expired" },
      });
      if (updated.count > 0) {
        await auditLog({
          action: "order_expired",
          entityType: "order",
          entityId: session.id,
          details: { stripeSessionId: session.id },
        });
      }
    }
  }

  // Only deliver keys/serials after Stripe confirms payment (checkout.session.completed).
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const sessionId = session.id;
    const metadataOrderId = typeof session.metadata?.orderId === "string" ? session.metadata.orderId : null;

    let order = await prisma.order.findUnique({
      where: { stripeSessionId: sessionId },
      include: { items: { include: { product: true } } },
    });

    if (!order && metadataOrderId) {
      order = await prisma.order.findUnique({
        where: { id: metadataOrderId },
        include: { items: { include: { product: true } } },
      });
      if (order) {
        await prisma.order.update({
          where: { id: order.id },
          data: { stripeSessionId: sessionId },
        });
      }
    }

    if (!order) {
      console.error("Order not found for session:", sessionId, "metadata.orderId:", metadataOrderId);
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Idempotent: if already paid (e.g. Stripe retry), skip key assignment to avoid duplicate key errors
    if (order.status === "paid") {
      return NextResponse.json({ received: true });
    }

    const customerEmail = session.customer_email || session.customer_details?.email;
    try {
      await prisma.$transaction(async (tx) => {
        await tx.order.update({
          where: { id: order.id },
          data: {
            status: "paid",
            ...(customerEmail && { email: customerEmail }),
          },
        });

        for (const item of order.items) {
        const product = item.product as { deliveryType?: string };
        const deliveryType = product.deliveryType ?? "SERIAL";

        if (deliveryType === "SERIAL") {
          // Assign stocked serials to this order (one per quantity). Keys only after payment confirmed.
          const available = await tx.productSerial.findMany({
            where: { productId: item.productId, orderId: null },
            take: item.quantity,
            orderBy: { createdAt: "asc" },
          });
          for (const ps of available) {
            // Skip if this key already exists (retry/duplicate); otherwise transaction would abort on P2002
            const existingKey = await tx.licenseKey.findUnique({
              where: { key: ps.serial },
              select: { id: true },
            });
            if (existingKey) continue;

            await tx.productSerial.update({
              where: { id: ps.id },
              data: { orderId: order.id },
            });
            await tx.licenseKey.create({
              data: {
                key: ps.serial,
                orderId: order.id,
                productId: item.productId,
                isActive: true,
              },
            });
          }
          // If we had fewer serials than quantity (race), create generated keys for the rest so order is fulfilled
          const assigned = available.length;
          for (let i = assigned; i < item.quantity; i++) {
            let key: string;
            let attempts = 0;
            do {
              key = generateLicenseKey();
              const existing = await tx.licenseKey.findUnique({ where: { key }, select: { id: true } });
              if (!existing) break;
              attempts++;
              if (attempts > 10) throw new Error("Could not generate unique license key");
            } while (true);
            await tx.licenseKey.create({
              data: {
                key,
                orderId: order.id,
                productId: item.productId,
                isActive: true,
              },
            });
          }
        } else {
          // SERVICE: no key issued here; customer opens Discord ticket. No license key created.
        }
      }
    });

    const licenseCount = order.items.reduce((sum, item) => {
      const p = item.product as { deliveryType?: string };
      return p.deliveryType === "SERIAL" ? sum + item.quantity : sum;
    }, 0);
    await auditLog({
      action: "order_paid",
      entityType: "order",
      entityId: order.id,
      details: {
        email: customerEmail || order.email,
        totalCents: order.total,
        licenseCount,
        stripeSessionId: sessionId,
      },
    });
    } catch (err) {
      console.error("Webhook checkout.session.completed error:", err);
      return NextResponse.json(
        { error: "Processing failed", message: err instanceof Error ? err.message : "Unknown error" },
        { status: 500 }
      );
    }
  }

  return NextResponse.json({ received: true });
}
