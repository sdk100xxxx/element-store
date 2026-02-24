import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getStripe } from "@/lib/stripe";
import { ExpireOrderButton } from "@/app/admin/orders/[id]/ExpireOrderButton";
import { CopyAllKeysButton } from "../CopyAllKeysButton";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ id: string }>;
}

async function getPaymentMethodInfo(stripeSessionId: string | null): Promise<{ last4?: string; brand?: string } | null> {
  if (!stripeSessionId) return null;
  const stripe = getStripe();
  if (!stripe) return null;
  try {
    const session = await stripe.checkout.sessions.retrieve(stripeSessionId, {
      expand: ["payment_intent", "payment_intent.payment_method"],
    });
    const pi = session.payment_intent as { payment_method?: { card?: { last4?: string; brand?: string } } } | null;
    const pm = pi?.payment_method;
    if (pm && typeof pm === "object" && pm.card) {
      return { last4: pm.card.last4, brand: pm.card.brand };
    }
  } catch {
    // ignore
  }
  return null;
}

export default async function OrderDetailPage({ params }: Props) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) redirect("/auth/signin?callbackUrl=/orders");

  const userId = (session.user as { id?: string }).id;
  const order = await prisma.order.findFirst({
    where: {
      id,
      OR: [
        ...(userId ? [{ userId }] : []),
        { email: session.user.email.toLowerCase() },
      ],
    },
    include: {
      items: { include: { product: { select: { name: true, slug: true, deliveryType: true } } } },
      licenses: { where: { isActive: true } },
    },
  });

  if (!order) notFound();

  const role = (session.user as { role?: string }).role ?? "";
  const isAdmin = ["ADMIN", "PARTNER"].includes(role);

  const paymentInfo = await getPaymentMethodInfo(order.stripeSessionId ?? null);

  const formattedDate = (d: Date) =>
    new Date(d).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  const formatPrice = (cents: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(cents / 100);

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <Link href="/orders" className="text-sm text-element-red hover:underline">
          ← Back to orders
        </Link>
        {isAdmin && (
          <Link
            href={`/admin/orders/${order.id}`}
            className="text-sm font-medium text-gray-400 hover:text-white"
          >
            Admin view →
          </Link>
        )}
      </div>
      <h1 className="text-2xl font-bold text-white">Order details</h1>
      <p className="mt-1 text-sm text-gray-400">{formattedDate(order.createdAt)}</p>

      <div className="mt-6 rounded-lg border border-element-gray-800 bg-element-gray-900 p-4">
        <dl className="grid gap-3 sm:grid-cols-2">
          <div>
            <dt className="text-xs font-medium uppercase text-gray-500">Order ID</dt>
            <dd className="mt-0.5 font-mono text-sm text-white">{order.id}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase text-gray-500">Status</dt>
            <dd>
              <span
                className={`inline-block rounded px-2 py-0.5 text-xs font-medium ${
                  order.status === "paid"
                    ? "bg-green-500/20 text-green-400"
                    : order.status === "pending"
                      ? "bg-amber-500/20 text-amber-400"
                      : order.status === "declined"
                        ? "bg-red-500/20 text-red-400"
                        : order.status === "expired"
                          ? "bg-gray-500/20 text-gray-400"
                          : "bg-element-gray-700 text-gray-400"
                }`}
              >
                {order.status}
              </span>
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase text-gray-500">Total</dt>
            <dd className="mt-0.5 font-semibold text-element-red">{formatPrice(order.total)}</dd>
          </div>
          {order.stripeSessionId && (
            <div className="sm:col-span-2">
              <dt className="text-xs font-medium uppercase text-gray-500">Invoice / Payment reference</dt>
              <dd className="mt-0.5 font-mono text-sm text-gray-300">{order.stripeSessionId}</dd>
            </div>
          )}
          {paymentInfo && (paymentInfo.last4 || paymentInfo.brand) && (
            <div className="sm:col-span-2">
              <dt className="text-xs font-medium uppercase text-gray-500">Paid with</dt>
              <dd className="mt-0.5 text-sm text-gray-300">
                {[paymentInfo.brand, paymentInfo.last4 && `•••• ${paymentInfo.last4}`].filter(Boolean).join(" ")}
              </dd>
            </div>
          )}
        </dl>
      </div>

      <div className="mt-6">
        <h2 className="text-lg font-semibold text-white">Items</h2>
        <ul className="mt-3 space-y-2 rounded-lg border border-element-gray-800 bg-element-gray-900 p-4">
          {order.items.map((item) => (
            <li key={item.id} className="flex justify-between text-sm">
              <span className="text-gray-300">
                {item.product.name} × {item.quantity}
              </span>
              <span className="text-white">{formatPrice(item.price * item.quantity)}</span>
            </li>
          ))}
          <li className="flex justify-between border-t border-element-gray-800 pt-2 font-medium text-white">
            <span>Total</span>
            <span>{formatPrice(order.total)}</span>
          </li>
        </ul>
      </div>

      {order.status === "paid" && order.licenses.length > 0 && (
        <div className="mt-6">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-lg font-semibold text-white">License keys</h2>
            {order.licenses.length > 1 && (
              <CopyAllKeysButton keys={order.licenses.map((l) => l.key)} />
            )}
          </div>
          <p className="mt-1 text-sm text-gray-400">These keys were assigned from the product’s serial stock.</p>
          <ul className="mt-3 space-y-2">
            {order.licenses.map((lic) => {
              const productName = order.items.find((i) => i.productId === lic.productId)?.product.name ?? "Product";
              return (
                <li
                  key={lic.id}
                  className="flex flex-wrap items-center gap-2 rounded border border-element-gray-800 bg-element-gray-900 px-4 py-3"
                >
                  <span className="text-sm text-gray-400">{productName}:</span>
                  <code className="flex-1 font-mono text-sm text-gray-300">{lic.key}</code>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {order.status === "paid" &&
        order.items.some((i) => i.product.deliveryType === "SERVICE") &&
        order.licenses.length === 0 && (
          <p className="mt-6 text-sm text-gray-500">Service items: open a Discord ticket to receive your product.</p>
        )}

      {isAdmin && (
        <div className="mt-8 rounded-lg border border-element-gray-800 bg-element-gray-900 p-4">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-400">Admin</h2>
          <p className="mt-1 text-sm text-gray-500">You see this because you have admin access.</p>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <Link
              href={`/admin/orders/${order.id}`}
              className="text-sm font-medium text-element-red hover:underline"
            >
              View full admin order →
            </Link>
            {order.status === "pending" && <ExpireOrderButton orderId={order.id} />}
          </div>
        </div>
      )}
    </div>
  );
}
