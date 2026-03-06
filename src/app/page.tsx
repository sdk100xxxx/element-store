import Link from "next/link";
import { HeroCards } from "@/components/HeroCards";

export const dynamic = "force-dynamic";

export default function HomePage() {
  return (
    <div>
      <section className="relative overflow-hidden border-b border-element-gray-800 bg-gradient-to-b from-element-red/15 to-element-black">
        <div className="absolute inset-0 bg-gradient-to-br from-element-red/20 via-transparent to-transparent" />
        <div className="relative mx-auto max-w-7xl px-4 py-16 sm:py-20 md:py-28 lg:py-32 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-10">
          <div className="mx-auto max-w-3xl text-center lg:text-left lg:mx-0">
            <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl md:text-5xl lg:text-6xl">
              Built for players.
              <br />
              <span className="text-element-red">Delivered fast.</span>
            </h1>
            <p className="mt-5 text-base text-gray-300 sm:text-lg">
              Premium digital products and support you can count on. Pick what you need, pay securely, and get access in minutes.
            </p>
            <div className="mt-8 flex flex-wrap justify-center lg:justify-start gap-4">
              <Link
                href="/store"
                className="inline-flex min-h-[2.75rem] items-center gap-2 rounded-lg bg-element-red px-6 py-3 font-semibold text-white transition hover:bg-element-red-dark active:bg-element-red-dark"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                BROWSE STORE
              </Link>
              <Link
                href="/downloads"
                className="inline-flex min-h-[2.75rem] items-center gap-2 rounded-lg border border-element-gray-600 bg-element-gray-800 px-6 py-3 font-semibold text-white transition hover:bg-element-gray-700"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                DOWNLOADS
              </Link>
            </div>
          </div>
          <HeroCards />
        </div>
      </section>
    </div>
  );
}
