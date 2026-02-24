import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { CreateCouponForm } from "./CreateCouponForm";
import { CouponList } from "./CouponList";

export const dynamic = "force-dynamic";

export default async function AdminCouponsPage() {
  const [coupons, products] = await Promise.all([
    prisma.coupon.findMany({
      orderBy: { createdAt: "desc" },
      include: { product: { select: { id: true, name: true, slug: true } } },
    }),
    prisma.product.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
      select: { id: true, name: true, slug: true },
    }),
  ]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Coupons</h1>
        <p className="mt-1 text-sm text-gray-400">Create and manage discount codes.</p>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <div className="rounded-lg border border-element-gray-800 bg-element-gray-900 p-6">
          <h2 className="text-lg font-semibold text-white">Create coupon</h2>
          <CreateCouponForm products={products} />
        </div>

        <div className="rounded-lg border border-element-gray-800 bg-element-gray-900 p-6">
          <h2 className="text-lg font-semibold text-white">Existing coupons</h2>
          {coupons.length === 0 ? (
            <p className="mt-4 text-sm text-gray-500">No coupons yet. Create one above.</p>
          ) : (
            <CouponList coupons={coupons} />
          )}
        </div>
      </div>

      <Link href="/admin" className="inline-block text-sm text-element-red hover:underline">
        ← Back to Dashboard
      </Link>
    </div>
  );
}
