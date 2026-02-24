import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

interface Props {
  searchParams: Promise<{ q?: string }>;
}

export default async function SearchPage({ searchParams }: Props) {
  const { q } = await searchParams;
  const query = q?.trim() ?? "";
  const hasQuery = query.length >= 2;

  let products: { id: string; name: string; slug: string; price: number }[] = [];
  let groups: { id: string; name: string; slug: string }[] = [];

  if (hasQuery) {
    [products, groups] = await Promise.all([
      prisma.product.findMany({
        where: {
          isActive: true,
          OR: [
            { name: { contains: query } },
            { slug: { contains: query } },
            ...(query.length >= 3 ? [{ description: { contains: query } }] : []),
          ],
        },
        select: { id: true, name: true, slug: true, price: true },
        take: 20,
      }),
      prisma.productGroup.findMany({
        where: {
          OR: [{ name: { contains: query } }, { slug: { contains: query } }],
        },
        select: { id: true, name: true, slug: true },
        take: 10,
      }),
    ]);
  }

  const formattedPrice = (cents: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(cents / 100);

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-2xl font-bold text-white">Search</h1>
      {!hasQuery ? (
        <p className="mt-2 text-gray-400">Enter at least 2 characters to search products and categories.</p>
      ) : (
        <>
          {groups.length > 0 && (
            <section className="mt-6">
              <h2 className="text-sm font-medium uppercase tracking-wider text-gray-400">Categories</h2>
              <ul className="mt-2 space-y-2">
                {groups.map((g) => (
                  <li key={g.id}>
                    <Link
                      href={`/store?group=${encodeURIComponent(g.slug)}`}
                      className="block rounded-lg border border-element-gray-800 bg-element-gray-900 px-4 py-3 text-white transition hover:border-element-red/50 hover:bg-element-gray-800"
                    >
                      {g.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}
          {products.length > 0 && (
            <section className="mt-6">
              <h2 className="text-sm font-medium uppercase tracking-wider text-gray-400">Products</h2>
              <ul className="mt-2 space-y-2">
                {products.map((p) => (
                  <li key={p.id}>
                    <Link
                      href={`/store/${p.slug}`}
                      className="flex items-center justify-between rounded-lg border border-element-gray-800 bg-element-gray-900 px-4 py-3 text-white transition hover:border-element-red/50 hover:bg-element-gray-800"
                    >
                      <span>{p.name}</span>
                      <span className="text-element-red font-medium">{formattedPrice(p.price)}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}
          {hasQuery && products.length === 0 && groups.length === 0 && (
            <p className="mt-6 text-gray-500">No products or categories found for &quot;{query}&quot;.</p>
          )}
        </>
      )}
    </div>
  );
}
