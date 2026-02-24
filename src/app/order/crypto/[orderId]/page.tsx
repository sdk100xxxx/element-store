import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ orderId: string }>;
}

export default async function OrderCryptoPage({ params }: Props) {
  const { orderId } = await params;
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: { include: { product: true } } },
  });

  if (!order || order.status !== "pending_crypto") notFound();

  const totalDollars = (order.total / 100).toFixed(2);

  return (
    <div className="mx-auto max-w-lg px-4 py-12">
      <h1 className="text-2xl font-bold text-white">Pay with Crypto</h1>
      <p className="mt-2 text-gray-400">
        Order total: <span className="font-semibold text-element-red">${totalDollars} USD</span>
      </p>

      <div className="mt-8 rounded-lg border border-element-gray-800 bg-element-gray-900 p-6">
        <h2 className="text-sm font-medium text-gray-400">Order items</h2>
        <ul className="mt-3 space-y-2">
          {order.items.map((item) => (
            <li key={item.id} className="flex justify-between text-white">
              <span>
                {item.product.name} × {item.quantity}
              </span>
              <span>${((item.price * item.quantity) / 100).toFixed(2)}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-8 rounded-lg border border-yellow-500/30 bg-yellow-500/10 p-6">
        <p className="text-sm text-yellow-200">
          Crypto payment can be enabled by connecting a provider (e.g. NOWPayments, CoinGate) in
          Settings. For now, complete payment via another channel or contact support with your
          order ID.
        </p>
        <p className="mt-3 font-mono text-xs text-gray-400">Order ID: {order.id}</p>
      </div>

      <Link
        href="/store"
        className="mt-8 inline-block rounded bg-element-gray-800 px-6 py-3 font-medium text-white transition hover:bg-element-gray-700"
      >
        Back to Store
      </Link>
    </div>
  );
}
