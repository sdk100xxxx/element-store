import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ProductCard } from "@/components/ProductCard";

export const dynamic = "force-dynamic";

export default async function StoreAllPage() {
  const products = await prisma.product.findMany({
    where: { isActive: true },
    orderBy: { name: "asc" },
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-12">
      <Link
        href="/store"
        className="mb-6 inline-block text-sm text-gray-400 transition hover:text-white"
      >
        ← Back to Store
      </Link>
      <h1 className="text-3xl font-bold text-element-red">All Products</h1>
      <p className="mt-2 text-gray-400">{products.length} products</p>

      {products.length > 0 ? (
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              name={product.name}
              subtitle={product.subtitle}
              slug={product.slug}
              image={product.image}
              price={product.price}
            />
          ))}
        </div>
      ) : (
        <div className="mt-8 rounded-lg border border-dashed border-element-gray-800 p-12 text-center text-gray-500">
          No products available yet.
        </div>
      )}
    </div>
  );
}
