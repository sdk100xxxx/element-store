import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getStripe } from "@/lib/stripe";
import { rateLimit, getClientIp } from "@/lib/security";

export async function POST(req: Request) {
  const ip = getClientIp();
  const { allowed } = rateLimit(`checkout:${ip}`);
  if (!allowed) {
    return NextResponse.json(
      { error: "Too many requests." },
      { status: 429 }
    );
  }

  try {
    const body = await req.json();
    const { productId, quantity = 1, paymentMethod = "card", couponCode: rawCode, email: bodyEmail } = body;
    if (!productId || quantity < 1) {
      return NextResponse.json(
        { error: "Invalid product or quantity." },
        { status: 400 }
      );
    }

    const session = await getServerSession(authOptions);
    const isEmailValid = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e?.trim?.() ?? "");
    const orderEmailRaw = session?.user?.email ?? bodyEmail?.toString?.()?.trim?.();
    if (!orderEmailRaw || !isEmailValid(orderEmailRaw)) {
      return NextResponse.json(
        { error: "Sign in or enter your email to complete your purchase." },
        { status: 400 }
      );
    }
    const orderEmail = orderEmailRaw.toLowerCase();

    // Only link order to a user if that user exists in DB (avoids FK violation from stale session)
    let orderUserId: string | null = null;
    if (session?.user?.id) {
      const userExists = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { id: true },
      });
      if (userExists) orderUserId = session.user.id;
    }

    const product = await prisma.product.findFirst({
      where: { id: productId, isActive: true },
    });
    if (!product) {
      return NextResponse.json(
        { error: "Product not found." },
        { status: 404 }
      );
    }

    // SERIAL products: require enough stock (unassigned serials). No key until payment confirmed.
    const deliveryType = (product as { deliveryType?: string }).deliveryType ?? "SERIAL";
    if (deliveryType === "SERIAL") {
      const inStock = await prisma.productSerial.count({
        where: { productId: product.id, orderId: null },
      });
      if (inStock < quantity) {
        return NextResponse.json(
          { error: `Not enough stock. Only ${inStock} available.` },
          { status: 400 }
        );
      }
    }

    const customerEmail = session?.user?.email ? session.user.email.toLowerCase() : orderEmail;
    const subtotal = product.price * quantity;
    let total = subtotal;
    let couponId: string | null = null;

    // Validate and apply coupon if provided
    const code = rawCode?.toString()?.trim()?.toUpperCase();
    if (code) {
      const coupon = await prisma.coupon.findUnique({
        where: { code, isActive: true },
      });
      if (!coupon) {
        return NextResponse.json(
          { error: "Invalid or expired coupon code." },
          { status: 400 }
        );
      }
      if (coupon.allowedEmails?.trim()) {
        const allowed = coupon.allowedEmails.split(",").map((e) => e.trim().toLowerCase()).filter(Boolean);
        const email = customerEmail?.toLowerCase();
        if (!email || !allowed.includes(email)) {
          return NextResponse.json(
            { error: "This coupon is not valid for your account." },
            { status: 400 }
          );
        }
      }
      const appliesToProduct = coupon.productId == null || coupon.productId === product.id;
      if (!appliesToProduct) {
        return NextResponse.json(
          { error: "This coupon does not apply to this product." },
          { status: 400 }
        );
      }
      if (coupon.discountType === "PERCENT") {
        total = Math.round(subtotal - (subtotal * coupon.discountValue) / 100);
      } else {
        total = Math.max(0, subtotal - coupon.discountValue);
      }
      couponId = coupon.id;
    }

    if (total < 50) {
      return NextResponse.json(
        { error: "Minimum order total is $0.50. Add a product or use a valid coupon." },
        { status: 400 }
      );
    }

    if (paymentMethod === "crypto") {
      if (!product.acceptCrypto) {
        return NextResponse.json(
          { error: "This product does not accept crypto." },
          { status: 400 }
        );
      }
      const chargedUnitPrice = quantity > 0 ? Math.round(total / quantity) : total;
      const order = await prisma.order.create({
        data: {
          userId: orderUserId,
          email: orderEmail,
          status: "pending_crypto",
          total,
          couponId,
          items: {
            create: {
              productId: product.id,
              quantity,
              price: chargedUnitPrice,
            },
          },
        },
      });
      return NextResponse.json({
        crypto: true,
        orderId: order.id,
        url: `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/order/crypto/${order.id}`,
      });
    }

    if (paymentMethod === "card" || !paymentMethod) {
      if (!product.acceptStripe) {
        return NextResponse.json(
          { error: "This product does not accept card payments." },
          { status: 400 }
        );
      }
      const stripe = getStripe();
      if (!stripe) {
        return NextResponse.json(
          {
            error:
              "Card payments are not configured. Add STRIPE_SECRET_KEY to .env or .env.stripe and restart the dev server.",
          },
          { status: 500 }
        );
      }

      const baseUrl =
        process.env.NEXTAUTH_URL?.trim() ||
        (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");
      const chargedUnitPrice = quantity > 0 ? Math.round(total / quantity) : total;
      // Create order first so we can put orderId in session metadata (for declined/expired webhooks).
      const order = await prisma.order.create({
        data: {
          userId: orderUserId,
          email: orderEmail,
          stripeSessionId: null,
          status: "pending",
          total,
          couponId,
          items: {
            create: {
              productId: product.id,
              quantity,
              price: chargedUnitPrice,
            },
          },
        },
      });

      const checkoutSession = await stripe.checkout.sessions.create({
        mode: "payment",
        payment_method_types: ["card"],
        line_items: [
          {
            price_data: {
              currency: "usd",
              product_data: {
                name: product.name,
                description: product.subtitle || product.description || undefined,
                images: product.image
                  ? [
                      product.image.startsWith("http")
                        ? product.image
                        : `${process.env.NEXTAUTH_URL || "http://localhost:3000"}${product.image.startsWith("/") ? product.image : `/${product.image}`}`,
                    ]
                  : undefined,
              },
              unit_amount: chargedUnitPrice,
            },
            quantity,
          },
        ],
        success_url: `${baseUrl}/order/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${baseUrl}/store/${product.slug}`,
        metadata: {
          orderId: order.id,
          productId: product.id,
          quantity: String(quantity),
          userId: session?.user?.id || "",
        },
        payment_intent_data: {
          metadata: { orderId: order.id },
        },
        customer_email: orderEmail,
      });

      await prisma.order.update({
        where: { id: order.id },
        data: { stripeSessionId: checkoutSession.id },
      });

      return NextResponse.json({ url: checkoutSession.url });
    }

    return NextResponse.json(
      { error: "Invalid payment method." },
      { status: 400 }
    );
  } catch (e) {
    const err = e instanceof Error ? e : new Error(String(e));
    console.error("Checkout error:", err.message, err);
    const isDev = process.env.NODE_ENV !== "production";
    return NextResponse.json(
      { error: isDev ? (err.message || "Checkout failed.") : "Checkout failed." },
      { status: 500 }
    );
  }
}
