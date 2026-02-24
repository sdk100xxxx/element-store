import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import Link from "next/link";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { OrderList } from "./OrderList";

export const dynamic = "force-dynamic";

export default async function OrdersPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    redirect("/auth/signin?callbackUrl=/orders");
  }

  // Only this customer's orders: match by account id or by email (so guest orders appear after they sign in with that email)
  const userId = (session.user as { id?: string }).id;
  const orders = await prisma.order.findMany({
    where: {
      OR: [
        ...(userId ? [{ userId }] : []),
        { email: session.user.email.toLowerCase() },
      ],
    },
    orderBy: { createdAt: "desc" },
    include: {
      items: { include: { product: { select: { name: true, slug: true, deliveryType: true } } } },
      licenses: { where: { isActive: true }, select: { id: true, key: true, productId: true } },
    },
  });

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:py-12">
      <h1 className="text-xl font-bold text-white sm:text-2xl">Manage Orders</h1>
      <p className="mt-1 text-sm text-gray-400 sm:text-base">Your orders only. Sign in to see purchases tied to your account or email.</p>
      {orders.length === 0 ? (
        <div className="mt-8 rounded-lg border border-element-gray-800 bg-element-gray-900 p-8 text-center text-gray-400">
          <p>You haven&apos;t placed any orders yet.</p>
          <Link href="/store" className="mt-4 inline-block text-element-red hover:underline">
            Browse the store
          </Link>
        </div>
      ) : (
        <OrderList orders={orders} />
      )}
    </div>
  );
}
