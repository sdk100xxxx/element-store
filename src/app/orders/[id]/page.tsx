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
      licenses: true,
    },
  });

  if (!order) notFound();
  const activeLicenses = order.licenses.filter((l) => l.isActive);

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
    <div className="mx-auto max-w-3xl px-4 py-8 sm:py-12">
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

      <div className="overflow-hidden rounded-xl border border-element-gray-700 bg-element-gray-900 shadow-lg">
        <div className="border-b border-element-gray-700 bg-element-gray-800/50 px-6 py-5 sm:px-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-lg font-bold uppercase tracking-widest text-white">Invoice</h1>
              <p className="mt-1 font-mono text-xs text-gray-400 sm:text-sm">#{order.id.slice(-8).toUpperCase()}</p>
            </div>
            <div className="text-right">
              <p className="text-xs font-medium uppercase tracking-wider text-gray-500">Date</p>
              <p className="mt-0.5 text-sm text-white">{formattedDate(order.createdAt)}</p>
              <span
                className={`mt-2 inline-block rounded px-2.5 py-1 text-xs font-semibold uppercase ${
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
            </div>
          </div>
        </div>

        <div className="border-b border-element-gray-700 px-6 py-4 sm:px-8">
          <p className="text-xs font-medium uppercase tracking-wider text-gray-500">Bill to</p>
          <p className="mt-1 text-sm text-white">{order.email}</p>
          {paymentInfo && (paymentInfo.last4 || paymentInfo.brand) && order.status === "paid" && (
            <p className="mt-2 text-xs text-gray-400">
              Paid with {[paymentInfo.brand, paymentInfo.last4 && `•••• ${paymentInfo.last4}`].filter(Boolean).join(" ")}
            </p>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-element-gray-700 bg-element-gray-800/30">
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-400 sm:px-8">Description</th>
                <th className="w-16 px-2 py-3 text-center text-xs font-semibold uppercase tracking-wider text-gray-400">Qty</th>
                <th className="hidden w-24 px-2 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-400 sm:table-cell">Unit price</th>
                <th className="w-24 px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-400 sm:px-8">Amount</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((item) => (
                <tr key={item.id} className="border-b border-element-gray-800">
                  <td className="px-6 py-3 text-gray-300 sm:px-8">{item.product.name}</td>
                  <td className="px-2 py-3 text-center text-gray-400">{item.quantity}</td>
                  <td className="hidden px-2 py-3 text-right text-gray-400 sm:table-cell">{formatPrice(item.price)}</td>
                  <td className="px-6 py-3 text-right font-medium text-white sm:px-8">{formatPrice(item.price * item.quantity)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex justify-end border-t-2 border-element-gray-700 bg-element-gray-800/30 px-6 py-4 sm:px-8">
          <div className="flex w-full max-w-[200px] items-center justify-between">
            <span className="text-sm font-semibold uppercase text-gray-400">Total</span>
            <span className="text-lg font-bold text-element-red">{formatPrice(order.total)}</span>
          </div>
        </div>

      {order.status === "paid" && (
        <div className="border-t border-element-gray-700 px-6 py-5 sm:px-8">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-400">Deliverables</h2>
          {activeLicenses.length > 0 ? (
            <>
              {activeLicenses.length > 1 && (
                <div className="mt-3">
                  <CopyAllKeysButton keys={activeLicenses.map((l) => l.key)} />
                </div>
              )}
              <ul className="mt-3 space-y-2">
                {activeLicenses.map((lic) => {
                  const productName = order.items.find((i) => i.productId === lic.productId)?.product.name ?? "Product";
                  return (
                    <li
                      key={lic.id}
                      className="flex flex-wrap items-center gap-2 rounded-lg border border-element-gray-700 bg-element-black/50 px-4 py-2.5"
                    >
                      <span className="text-xs text-gray-500">{productName}</span>
                      <code className="min-w-0 flex-1 break-all font-mono text-sm text-element-red">{lic.key}</code>
                    </li>
                  );
                })}
              </ul>
            </>
          ) : order.items.some((i) => i.product.deliveryType === "SERVICE") ? (
            <p className="mt-3 text-sm text-gray-500">Service items: open a Discord ticket with your order email to receive your product.</p>
          ) : (
            <p className="mt-3 text-sm text-amber-400">Your keys are being prepared. Refresh this page in a moment or contact support with order #{order.id.slice(-8).toUpperCase()}.</p>
          )}
        </div>
      )}

        {order.stripeSessionId && (
          <div className="border-t border-element-gray-800 px-6 py-2 sm:px-8">
            <p className="truncate font-mono text-xs text-gray-500">Payment ref: {order.stripeSessionId}</p>
          </div>
        )}
      </div>

      {isAdmin && (
        <div className="mt-6 rounded-lg border border-element-gray-800 bg-element-gray-900 p-4">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-400">Admin</h2>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <Link href={`/admin/orders/${order.id}`} className="text-sm font-medium text-element-red hover:underline">
              View full admin order →
            </Link>
            {order.status === "pending" && <ExpireOrderButton orderId={order.id} />}
          </div>
        </div>
      )}
    </div>
  );
}
