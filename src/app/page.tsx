import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { WhyChooseElement } from "@/components/WhyChooseElement";
import { FAQ } from "@/components/FAQ";
import { HeroCards } from "@/components/HeroCards";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const groups = await prisma.productGroup.findMany({
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
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
      <section className="relative overflow-hidden border-b border-element-gray-800 bg-gradient-to-b from-element-red/15 to-element-black">
        <div className="absolute inset-0 bg-gradient-to-br from-element-red/20 via-transparent to-transparent" />
        <div className="relative mx-auto max-w-7xl px-4 py-16 sm:py-20 md:py-28 lg:py-32">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl md:text-5xl lg:text-6xl">
              <span className="text-element-red">Element</span>
              <br />
              Reliable. Secure. Trusted.
            </h1>
            <p className="mt-5 text-base text-gray-300 sm:text-lg">
              Elite-level digital products, unbeatable value, and fast support. Get your keys instantly after checkout — no wait, no hassle.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Link
                href="/store"
                className="inline-flex min-h-[2.75rem] items-center gap-2 rounded-lg bg-element-red px-6 py-3 font-semibold text-white transition hover:bg-element-red-dark active:bg-element-red-dark"
              >
                Browse store
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
              <Link
                href="/orders"
                className="inline-flex min-h-[2.75rem] items-center gap-2 rounded-lg border border-element-gray-600 bg-element-gray-800 px-6 py-3 font-semibold text-white transition hover:bg-element-gray-700"
              >
                My orders
              </Link>
            </div>
          </div>
          <HeroCards />
        </div>
      </section>

      {/* Shop by category */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:py-16 lg:py-20">
        <h2 className="text-xl font-bold text-element-red sm:text-2xl">Shop by category</h2>
        <p className="mt-2 text-sm text-gray-400 sm:text-base">
          Choose a category to see products.
        </p>

        <div className="mt-8 grid gap-5 sm:mt-10 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {groups.map((group) => {
            const count = group._count.products;
            const groupImage = group.image ?? null;
            return (
              <Link
                key={group.id}
                href={`/store?group=${encodeURIComponent(group.slug)}`}
                className="group flex flex-col rounded-xl border border-element-gray-800 bg-element-gray-900 overflow-hidden transition hover:border-element-red/40 hover:bg-element-gray-800"
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
                <div className="flex flex-1 flex-col p-5">
                  <span className="text-lg font-semibold text-white group-hover:text-element-red">
                    {group.name}
                  </span>
                  <span className="mt-1 text-sm text-gray-400">
                    {count} product{count !== 1 ? "s" : ""}
                  </span>
                  <span className="mt-4 flex items-center gap-2 text-sm font-medium text-element-red">
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
          <div className="mt-12 rounded-xl border border-dashed border-element-gray-800 p-12 text-center text-gray-500">
            <p>No categories yet. Add groups from the admin.</p>
            <Link href="/store" className="mt-2 inline-block text-element-red hover:underline">
              Go to Store
            </Link>
          </div>
        )}
      </section>

      <WhyChooseElement />
      <FAQ />
    </div>
  );
}
