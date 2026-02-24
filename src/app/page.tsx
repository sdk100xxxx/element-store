import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { WhyChooseElement } from "@/components/WhyChooseElement";
import { FAQ } from "@/components/FAQ";
import { HeroCards } from "@/components/HeroCards";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const groups = await prisma.productGroup.findMany({
    orderBy: { name: "asc" },
    include: {
      _count: { select: { products: true } },
      products: {
        where: { isActive: true },
        select: { price: true },
      },
    },
  });

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-element-gray-800 bg-gradient-to-b from-element-red/20 to-element-black">
        <div className="absolute inset-0 bg-gradient-to-br from-element-red/30 via-transparent to-transparent" />
        <div className="relative mx-auto grid max-w-7xl grid-cols-1 items-center gap-6 px-4 py-12 sm:gap-8 sm:py-24 lg:grid-cols-2 lg:gap-12 lg:py-32">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl sm:text-5xl md:text-6xl">
              Built for players.{" "}
              <span className="text-element-red">Delivered fast.</span>
            </h1>
            <p className="mt-4 text-base text-gray-300 sm:mt-6 sm:text-lg">
              Premium digital products and support you can count on. Pick what you need, pay securely, and get access in minutes.
            </p>
            <div className="mt-6 flex flex-wrap gap-3 sm:mt-8 sm:gap-4">
              <Link
                href="/store"
                className="inline-flex min-h-[2.75rem] items-center gap-2 rounded-lg bg-element-red px-5 py-3 font-semibold text-white transition hover:bg-element-red-dark active:bg-element-red-dark sm:px-6"
              >
                <svg
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
                BROWSE STORE
              </Link>
              <Link
                href="/downloads"
                className="inline-flex min-h-[2.75rem] items-center gap-2 rounded-lg border border-element-gray-600 bg-element-gray-800 px-5 py-3 font-semibold text-white transition hover:bg-element-gray-700 active:bg-element-gray-700 sm:px-6"
              >
                <svg
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                  />
                </svg>
                DOWNLOADS
              </Link>
            </div>
          </div>
          {/* Right: reference look – layered cards with red glow, hero image in center */}
          <HeroCards />
        </div>
        <div className="relative border-t border-element-gray-800 bg-element-black/50 py-3 sm:py-4">
          <div className="mx-auto flex max-w-7xl flex-col items-center gap-2 px-4 text-center">
            <p className="text-xs uppercase tracking-wider text-gray-400">
              Fast setup · Secure checkout · Real support when you need it
            </p>
          </div>
        </div>
      </section>

      {/* Groups only - click to see products */}
      <section className="mx-auto max-w-7xl px-4 py-10 sm:py-16">
        <h2 className="text-xl font-bold text-element-red sm:text-2xl">What we offer</h2>
        <p className="mt-2 text-sm text-gray-400 sm:text-base">Select a category to browse available products</p>

        <div className="mt-6 grid gap-4 sm:mt-10 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
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
            return (
              <Link
                key={group.id}
                href={`/store?group=${encodeURIComponent(group.slug)}`}
                className="group flex flex-col rounded-lg border border-element-gray-800 bg-element-gray-900 overflow-hidden transition hover:border-element-red/50 hover:bg-element-gray-800"
              >
                {groupImage && (
                  <div className="relative aspect-video w-full shrink-0 bg-element-black">
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
                <div className="flex flex-1 flex-col p-4 sm:p-6">
                  <span className="text-base font-semibold text-white group-hover:text-element-red sm:text-lg">
                    {group.name}
                  </span>
                  <span className="mt-1 text-xs text-gray-400 sm:text-sm">
                    {count} product{count !== 1 ? "s" : ""}
                  </span>
                  {priceRange && (
                    <span className="mt-1 text-sm text-gray-500">{priceRange}</span>
                  )}
                  <span className="mt-auto pt-4 flex items-center gap-2 text-element-red text-sm font-medium">
                    View products
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </span>
                </div>
              </Link>
            );
          })}
        </div>

        {groups.length === 0 && (
          <div className="mt-12 rounded-lg border border-dashed border-element-gray-800 p-12 text-center text-gray-500">
            <p>No categories yet. Add groups and products from the admin panel.</p>
            <Link
              href="/admin"
              className="mt-2 inline-block text-element-red hover:underline"
            >
              Go to Admin
            </Link>
          </div>
        )}
      </section>

      <WhyChooseElement />
      <FAQ />
    </div>
  );
}
