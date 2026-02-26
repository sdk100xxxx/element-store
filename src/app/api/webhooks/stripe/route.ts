import { NextResponse } from "next/server";
import Stripe from "stripe";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { assignOrderKeys } from "@/lib/assign-order-keys";
import { getStripe, getStripeWebhookSecret } from "@/lib/stripe";
import { auditLog } from "@/lib/audit";
import { sendOrderConfirmationEmail } from "@/lib/send-order-email";

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

    const orderId = order.id;
    const itemCount = order.items.length;
    const expectedKeys = order.items.reduce((sum, item) => {
      const p = item.product as { deliveryType?: string; name?: string };
      const dt = p.deliveryType ?? "SERIAL";
      console.log("[webhook] item", item.productId, "deliveryType:", dt, "qty:", item.quantity, "name:", p.name);
      return dt === "SERIAL" ? sum + item.quantity : sum;
    }, 0);
    console.log("[webhook] checkout.session.completed orderId:", orderId, "items:", itemCount, "expectedKeys:", expectedKeys, "status:", order.status);

    // Idempotent: if already paid and has keys, skip. If paid but no keys (heal), run key assignment below.
    const existingLicenseCount = await prisma.licenseKey.count({ where: { orderId } });
    if (order.status === "paid" && existingLicenseCount > 0) {
      return NextResponse.json({ received: true });
    }

    const customerEmail = session.customer_email || session.customer_details?.email;
    try {
      await prisma.$transaction(async (tx) => {
        await tx.order.update({
          where: { id: orderId },
          data: {
            status: "paid",
            ...(customerEmail && { email: customerEmail }),
          },
        });
        await assignOrderKeys(tx, order);
      });

    const actualKeys = await prisma.licenseKey.count({ where: { orderId } });
    console.log("[webhook] order_paid orderId:", orderId, "expectedKeys:", expectedKeys, "actualKeys:", actualKeys);
    if (expectedKeys > 0 && actualKeys === 0) {
      console.warn("[webhook] WARNING: expected keys but created 0 — product must be SERIAL and have serials in stock (Admin → Product → Serials)");
    }
    if (expectedKeys === 0) {
      console.log("[webhook] No keys expected (all items are SERVICE or no items)");
    }
    await auditLog({
      action: "order_paid",
      entityType: "order",
      entityId: orderId,
      details: {
        email: customerEmail || order.email,
        totalCents: order.total,
        expectedKeys,
        actualKeys,
        stripeSessionId: sessionId,
      },
    });

    const emailTo = customerEmail || order.email;
    if (emailTo) {
      if (!process.env.RESEND_API_KEY) {
        console.warn("[webhook] Order confirmation email skipped: RESEND_API_KEY not set in Vercel env.");
      } else {
        try {
          const emailResult = await sendOrderConfirmationEmail(orderId, emailTo);
          if (emailResult.ok) {
            console.log("[webhook] Order confirmation email sent to", emailTo);
          } else {
            console.error("[webhook] Order confirmation email failed:", emailResult.error);
          }
        } catch (emailErr) {
          console.error("[webhook] Order confirmation email error:", emailErr);
        }
      }
    } else {
      console.warn("[webhook] No customer email for order", orderId, "- cannot send confirmation.");
    }
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
