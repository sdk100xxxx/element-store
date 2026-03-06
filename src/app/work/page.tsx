import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Our work — Website builds & themes",
  description: "Portfolio of website builds, themes, and digital products we ship. Browse by category or jump to the store.",
};

interface Props {
  searchParams: Promise<{ category?: string }>;
}

export default async function WorkPage({ searchParams }: Props) {
  const { category: categorySlug } = await searchParams;

  const groups = await prisma.productGroup.findMany({
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    include: {
      _count: { select: { products: true } },
      products: {
        where: { isActive: true },
        select: { id: true, name: true, slug: true, image: true, subtitle: true },
        orderBy: { name: "asc" },
      },
    },
  });

  const activeGroup = categorySlug
    ? groups.find((g) => g.slug === categorySlug)
    : null;

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:py-14">
      <div className="mb-10">
        <h1 className="text-2xl font-bold text-white sm:text-3xl">Our work</h1>
        <p className="mt-2 text-gray-400">
          Website builds, themes, and products. Select a category or browse all.
        </p>
      </div>

      {/* Category pills */}
      <div className="mb-8 flex flex-wrap gap-2">
        <Link
          href="/work"
          className={`rounded-full px-4 py-2 text-sm font-medium transition ${
            !categorySlug
              ? "bg-element-red text-white"
              : "border border-element-gray-700 bg-element-gray-900 text-gray-300 hover:border-element-gray-600 hover:text-white"
          }`}
        >
          All
        </Link>
        {groups.map((g) => (
          <Link
            key={g.id}
            href={categorySlug === g.slug ? "/work" : `/work?category=${encodeURIComponent(g.slug)}`}
            className={`rounded-full px-4 py-2 text-sm font-medium transition ${
              categorySlug === g.slug
                ? "bg-element-red text-white"
                : "border border-element-gray-700 bg-element-gray-900 text-gray-300 hover:border-element-gray-600 hover:text-white"
            }`}
          >
            {g.name}
          </Link>
        ))}
      </div>

      {/* Grid: either one category's products or all groups as cards */}
      {activeGroup ? (
        <div>
          <h2 className="mb-6 text-lg font-semibold text-white">{activeGroup.name}</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {activeGroup.products.map((product) => (
              <Link
                key={product.id}
                href={`/store/${product.slug}`}
                className="group flex flex-col overflow-hidden rounded-xl border border-element-gray-800 bg-element-gray-900 transition hover:border-element-red/40"
              >
                {product.image && (
                  <div className="relative aspect-video w-full bg-element-black">
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      className="object-cover transition group-hover:scale-[1.02]"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      unoptimized={!product.image.startsWith("/")}
                    />
                  </div>
                )}
                <div className="flex flex-1 flex-col p-4">
                  <span className="font-semibold text-white group-hover:text-element-red">{product.name}</span>
                  {product.subtitle && (
                    <span className="mt-1 text-sm text-gray-400">{product.subtitle}</span>
                  )}
                  <span className="mt-3 text-sm font-medium text-element-red">View in store →</span>
                </div>
              </Link>
            ))}
          </div>
          {activeGroup.products.length === 0 && (
            <p className="rounded-xl border border-dashed border-element-gray-800 py-12 text-center text-gray-500">
              No projects in this category yet.
            </p>
          )}
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {groups.map((group) => {
            const groupImage = group.image ?? group.products[0]?.image ?? null;
            return (
              <Link
                key={group.id}
                href={`/work?category=${encodeURIComponent(group.slug)}`}
                className="group flex flex-col overflow-hidden rounded-xl border border-element-gray-800 bg-element-gray-900 transition hover:border-element-red/40 hover:bg-element-gray-800"
              >
                {groupImage && (
                  <div className="relative aspect-video w-full bg-element-black">
                    <Image
                      src={groupImage}
                      alt={group.name}
                      fill
                      className="object-cover transition group-hover:scale-[1.02]"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      unoptimized={!groupImage.startsWith("/")}
                    />
                  </div>
                )}
                <div className="flex flex-1 flex-col p-5">
                  <span className="text-lg font-semibold text-white group-hover:text-element-red">
                    {group.name}
                  </span>
                  <span className="mt-1 text-sm text-gray-400">
                    {group._count.products} project{group._count.products !== 1 ? "s" : ""}
                  </span>
                  <span className="mt-4 flex items-center gap-2 text-sm font-medium text-element-red">
                    View projects
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      <div className="mt-12 border-t border-element-gray-800 pt-8 text-center">
        <Link
          href="/store"
          className="inline-flex items-center gap-2 rounded-lg bg-element-gray-800 px-5 py-3 font-medium text-white transition hover:bg-element-gray-700"
        >
          Browse full store
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </Link>
      </div>
    </div>
  );
}
