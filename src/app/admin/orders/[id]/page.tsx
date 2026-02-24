import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getStripe } from "@/lib/stripe";
import { ExpireOrderButton } from "./ExpireOrderButton";

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

export default async function AdminOrderDetailPage({ params }: Props) {
  const { id } = await params;
  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      items: { include: { product: true } },
      licenses: { where: { isActive: true } },
    },
  });

  if (!order) notFound();

  const paymentInfo = await getPaymentMethodInfo(order.stripeSessionId);

  const formattedDate = (d: Date) =>
    new Date(d).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/admin/orders"
          className="text-sm text-element-red hover:underline"
        >
          ← Back to orders
        </Link>
        <Link href="/admin" className="text-sm text-gray-400 hover:text-white">
          Dashboard
        </Link>
      </div>
      <div>
        <h1 className="text-2xl font-bold text-white">Order {order.id.slice(0, 8)}...</h1>
        <p className="mt-1 text-sm text-gray-400">{formattedDate(order.createdAt)}</p>
      </div>
      <div className="rounded-lg border border-element-gray-800 bg-element-gray-900 p-4">
        <dl className="grid gap-3 sm:grid-cols-2">
          <div>
            <dt className="text-xs font-medium uppercase text-gray-500">Email</dt>
            <dd className="mt-0.5 text-white">{order.email}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase text-gray-500">Status</dt>
            <dd className="flex flex-wrap items-center gap-2">
              <span
                className={`inline-block rounded px-2 py-0.5 text-xs font-medium ${
                  order.status === "paid"
                    ? "bg-green-500/20 text-green-400"
                    : order.status === "pending"
                    ? "bg-yellow-500/20 text-yellow-400"
                    : order.status === "declined"
                    ? "bg-red-500/20 text-red-400"
                    : order.status === "expired"
                    ? "bg-gray-500/20 text-gray-400"
                    : "bg-red-500/20 text-red-400"
                }`}
              >
                {order.status}
              </span>
              {order.status === "pending" && <ExpireOrderButton orderId={order.id} />}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase text-gray-500">Total</dt>
            <dd className="mt-0.5 text-element-red font-semibold">
              ${(order.total / 100).toFixed(2)}
            </dd>
          </div>
          {order.stripeSessionId && (
            <>
              <div className="sm:col-span-2">
                <dt className="text-xs font-medium uppercase text-gray-500">Stripe session / Invoice ID</dt>
                <dd className="mt-0.5 font-mono text-sm text-gray-300 break-all">{order.stripeSessionId}</dd>
              </div>
              {paymentInfo && (paymentInfo.last4 || paymentInfo.brand) && (
                <div>
                  <dt className="text-xs font-medium uppercase text-gray-500">Paid with</dt>
                  <dd className="mt-0.5 text-sm text-gray-300">
                    {[paymentInfo.brand, paymentInfo.last4 && `•••• ${paymentInfo.last4}`].filter(Boolean).join(" ")}
                  </dd>
                </div>
              )}
            </>
          )}
        </dl>
      </div>
      <div>
        <h2 className="text-lg font-semibold text-white">Items</h2>
        <div className="mt-3 overflow-x-auto rounded-lg border border-element-gray-800">
          <table className="w-full text-left">
            <thead className="bg-element-gray-900">
              <tr>
                <th className="px-4 py-3 text-sm font-medium text-gray-400">Product</th>
                <th className="px-4 py-3 text-sm font-medium text-gray-400">Qty</th>
                <th className="px-4 py-3 text-sm font-medium text-gray-400">Price</th>
                <th className="px-4 py-3 text-sm font-medium text-gray-400">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((item) => (
                <tr key={item.id} className="border-t border-element-gray-800">
                  <td className="px-4 py-3 text-white">{item.product.name}</td>
                  <td className="px-4 py-3 text-gray-300">{item.quantity}</td>
                  <td className="px-4 py-3 text-gray-300">
                    ${(item.price / 100).toFixed(2)}
                  </td>
                  <td className="px-4 py-3 text-white">
                    ${((item.price * item.quantity) / 100).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {order.status === "paid" && order.licenses.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-white">License keys</h2>
          <p className="mt-1 text-sm text-gray-400">Assigned from product serial stock when payment completed.</p>
          <ul className="mt-3 space-y-2">
            {order.licenses.map((lic) => (
              <li
                key={lic.id}
                className="rounded border border-element-gray-800 bg-element-gray-900 px-4 py-2 font-mono text-sm text-gray-300"
              >
                {lic.key}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
