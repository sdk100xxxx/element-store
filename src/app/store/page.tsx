import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { StoreContent } from "./StoreContent";
import { WhyChooseElement } from "@/components/WhyChooseElement";

export const dynamic = "force-dynamic";

/** Order: day (0) → week (1) → month (2) → lifetime (3) → other (4). Products with these in the name sort in that order. */
function productPeriodOrder(name: string): number {
  const n = name.toLowerCase();
  if (n.includes("lifetime")) return 3;
  if (n.includes("month")) return 2;
  if (n.includes("week")) return 1;
  if (n.includes("day")) return 0;
  return 4;
}

function sortProductsByPeriod<T extends { name: string }>(products: T[]): T[] {
  return [...products].sort((a, b) => {
    const oA = productPeriodOrder(a.name);
    const oB = productPeriodOrder(b.name);
    if (oA !== oB) return oA - oB;
    return a.name.localeCompare(b.name);
  });
}

interface Props {
  searchParams: Promise<{ group?: string }>;
}

export default async function StorePage({ searchParams }: Props) {
  const { group: groupSlug } = await searchParams;

  const groups = await prisma.productGroup.findMany({
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    include: {
      _count: { select: { products: true } },
      products: {
        where: { isActive: true },
        select: { price: true, image: true },
        take: 1,
      },
    },
  });

  // Default to first group so groups (left) and products (right) show immediately
  if (!groupSlug && groups.length > 0) {
    redirect(`/store?group=${encodeURIComponent(groups[0].slug)}`);
  }

  let selectedGroup: Awaited<ReturnType<typeof prisma.productGroup.findUnique>> & {
    products: { id: string; name: string; slug: string; subtitle: string | null; price: number; image: string | null }[];
  } | null = null;

  if (groupSlug) {
    const group = await prisma.productGroup.findUnique({
      where: { slug: groupSlug },
      include: {
        products: {
          where: { isActive: true },
          orderBy: { name: "asc" },
          select: {
            id: true,
            name: true,
            slug: true,
            subtitle: true,
            price: true,
            image: true,
            deliveryType: true,
          },
        },
      },
    });
    if (group) {
      const products = sortProductsByPeriod(group.products);
      const serialIds = products
        .filter((p) => (p as { deliveryType?: string }).deliveryType === "SERIAL")
        .map((p) => p.id);
      const stockCounts =
        serialIds.length > 0
          ? await prisma.productSerial.groupBy({
              by: ["productId"],
              where: { productId: { in: serialIds }, orderId: null },
              _count: { productId: true },
            })
          : [];
      const stockByProductId = Object.fromEntries(
        stockCounts.map((s) => [s.productId, s._count.productId])
      );
      selectedGroup = {
        ...group,
        products: products.map((p) => ({
          ...p,
          stockCount: (p as { deliveryType?: string }).deliveryType === "SERIAL" ? (stockByProductId[p.id] ?? 0) : null,
        })),
      };
    }
  }

  return (
    <>
    <div className="flex min-h-[calc(100vh-12rem)] flex-col lg:flex-row">
      {/* Left panel - groups */}
      <aside className="w-full shrink-0 border-b border-element-gray-800 bg-element-black/50 lg:max-w-sm lg:border-b-0 lg:border-r">
        <div className="sticky top-24 p-4">
          <h1 className="text-2xl font-bold text-element-red">STORE</h1>
          <p className="mt-1 text-sm text-gray-400">Choose a category</p>

          <div className="mt-6 space-y-3">
            {groups.map((group) => {
              const count = group._count.products;
              const prices = group.products.map((p) => p.price);
              const minPrice = prices.length ? Math.min(...prices) / 100 : 0;
              const maxPrice = prices.length ? Math.max(...prices) / 100 : 0;
              const priceRange =
                minPrice > 0 && maxPrice > 0
                  ? minPrice === maxPrice
                    ? `$${minPrice.toFixed(2)}`
                    : `$${minPrice.toFixed(2)} – $${maxPrice.toFixed(2)}`
                  : null;
              const groupImage = group.image ?? group.products[0]?.image ?? null;
              const isSelected = groupSlug === group.slug;

              return (
                <Link
                  key={group.id}
                  href={`/store?group=${encodeURIComponent(group.slug)}`}
                  className={`block overflow-hidden rounded-lg border transition ${
                    isSelected
                      ? "border-element-red/80 bg-element-red/10 ring-1 ring-element-red/30"
                      : "border-element-gray-800 bg-element-gray-900 hover:border-element-red/50 hover:bg-element-gray-800"
                  }`}
                >
                  <div className="relative flex items-center gap-4 p-4">
                    {groupImage ? (
                      <div className="relative flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded bg-element-black">
                        <Image
                          src={groupImage}
                          alt=""
                          fill
                          className="object-contain"
                          sizes="56px"
                          unoptimized={!groupImage.startsWith("/")}
                        />
                      </div>
                    ) : (
                      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded bg-element-gray-800">
                        <svg className="h-6 w-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                        </svg>
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <span className="block font-semibold text-white">{group.name}</span>
                      <span className="block text-sm text-gray-400">
                        {count} product{count !== 1 ? "s" : ""}
                        {priceRange && ` · ${priceRange}`}
                      </span>
                    </div>
                    <span className="shrink-0 rounded-full bg-element-gray-800 p-2 text-element-red">
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>

          {groups.length === 0 && (
            <div className="rounded-lg border border-dashed border-element-gray-800 p-8 text-center text-gray-500">
              No categories yet.
            </div>
          )}
        </div>
      </aside>

      {/* Right panel - products for selected group */}
      <main className="flex-1 overflow-auto">
        {selectedGroup ? (
          <StoreContent
            key={selectedGroup.id}
            groupName={selectedGroup.name}
            groupSlug={selectedGroup.slug}
            products={selectedGroup.products}
          />
        ) : (
          <div className="flex flex-col items-center justify-center px-4 py-24 text-center">
            <div className="rounded-full border border-element-gray-700 bg-element-gray-900 p-6">
              <svg
                className="h-12 w-12 text-gray-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M4 6h16M4 10h16M4 14h16M4 18h16"
                />
              </svg>
            </div>
            <p className="mt-6 text-lg font-medium text-white">Choose a category</p>
            <p className="mt-2 text-sm text-gray-400">
              Select a group from the left to see its products
            </p>
          </div>
        )}
      </main>
    </div>

    <WhyChooseElement />
    </>
  );
}
