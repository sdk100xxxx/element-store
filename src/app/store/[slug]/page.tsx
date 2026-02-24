import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { BuyButton } from "./BuyButton";
import { ViewProductImage } from "./ViewProductImage";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ slug: string }>;
}

const STATUS_COLORS: Record<string, string> = {
  UNDETECTED: "bg-green-500",
  DETECTED: "bg-amber-500",
  FROZEN: "bg-blue-500",
  TESTING: "bg-purple-500",
};

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const product = await prisma.product.findUnique({
    where: { slug },
  });

  if (!product || !product.isActive) notFound();

  const deliveryType = (product as { deliveryType?: string }).deliveryType ?? "SERIAL";
  const status = (product as { status?: string }).status ?? "UNDETECTED";
  const statusColor = STATUS_COLORS[status] ?? "bg-gray-500";

  const stockCount =
    deliveryType === "SERIAL"
      ? await prisma.productSerial.count({
          where: { productId: product.id, orderId: null },
        })
      : null;

  const formattedPrice = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(product.price / 100);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="grid gap-8 lg:grid-cols-5">
        {/* Left: cover image only */}
        <div className="lg:col-span-3">
          <div className="relative aspect-square w-full overflow-hidden rounded-xl border border-element-gray-800 bg-element-black">
            {product.image ? (
              <Image
                src={product.image}
                alt={product.name}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 60vw"
                priority
                unoptimized={!product.image.startsWith("/")}
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-element-gray-800 text-gray-500">
                <svg className="h-24 w-24" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            )}
          </div>
          <div className="mt-6 rounded-lg border border-element-gray-800 bg-element-gray-900/50 p-6">
            <h2 className="text-sm font-medium uppercase tracking-wider text-gray-400">
              Product description
            </h2>
            <div className="mt-3 text-gray-300">
              {product.description ? (
                <p className="whitespace-pre-wrap leading-relaxed">{product.description}</p>
              ) : (
                <p className="text-gray-500">
                  {product.subtitle || "No description provided."}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Right: name, tags, price card, buy */}
        <div className="lg:col-span-2">
          <h1 className="text-2xl font-bold text-white sm:text-3xl">
            {product.name}
          </h1>
          {product.subtitle && (
            <p className="mt-1 text-gray-400">{product.subtitle}</p>
          )}

          {/* Tags: Instant Delivery / Discord Ticket + Status (with glow) */}
          <div className="mt-4 flex flex-wrap gap-2">
            {deliveryType === "SERIAL" ? (
              <span className="inline-flex items-center gap-1.5 rounded-lg bg-element-red/20 px-3 py-1.5 text-sm font-medium text-red-500 shadow-[0_0_12px_rgba(220,38,38,0.5)]">
                <span className="h-1.5 w-1.5 rounded-full bg-red-500 shadow-[0_0_6px_rgba(220,38,38,0.8)]" />
                INSTANT DELIVERY
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 rounded-lg bg-amber-500/20 px-3 py-1.5 text-sm font-medium text-amber-400">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                DISCORD TICKET
              </span>
            )}
            <span className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium ${status === "UNDETECTED" ? "bg-green-500/20 text-green-400 shadow-[0_0_12px_rgba(34,197,94,0.4)]" : "bg-element-gray-800 text-gray-300"}`}>
              <span className={`h-1.5 w-1.5 rounded-full ${statusColor} ${status === "UNDETECTED" ? "shadow-[0_0_6px_rgba(34,197,94,0.9)]" : ""}`} />
              STATUS: {status}
            </span>
          </div>

          {/* Price & quantity card (rounded beveled) */}
          <div className="mt-6 rounded-xl border border-element-gray-800 bg-element-gray-900 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.05),0_4px_6px_-1px_rgba(0,0,0,0.3)]">
            {deliveryType === "SERIAL" && (
              <p className="mb-4 text-sm text-gray-400">
                {stockCount === 0 ? (
                  <span className="text-amber-400">Out of stock</span>
                ) : (
                  <>
                    <span className="font-semibold text-white">{stockCount}</span>
                    {" "}in stock
                  </>
                )}
              </p>
            )}
            <h3 className="text-sm font-medium uppercase tracking-wider text-gray-400">
              Price per key
            </h3>
            <div className="mt-3 flex items-center justify-between rounded-lg border border-element-red/40 bg-element-red/10 px-4 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
              <span className="text-xl font-bold text-white">{formattedPrice}</span>
              <span className="text-xs text-gray-400">One-time</span>
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-400">Quantity</label>
              <BuyButton
                productId={product.id}
                price={product.price}
                name={product.name}
                acceptStripe={product.acceptStripe}
                acceptCrypto={product.acceptCrypto}
              />
            </div>
            <div className="mt-4 flex flex-col gap-2">
              {product.imageDisplay && (
                <ViewProductImage
                  imageUrl={product.imageDisplay}
                  productName={product.name}
                />
              )}
<Link
              href="/store"
              className="flex h-12 w-full items-center justify-center gap-2 rounded-lg border-2 border-element-red bg-transparent text-sm font-medium text-element-red transition hover:bg-element-red/10"
            >
              <svg className="h-5 w-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Store
            </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
