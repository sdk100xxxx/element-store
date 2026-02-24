import Link from "next/link";
import Image from "next/image";

interface Product {
  id: string;
  name: string;
  slug: string;
  subtitle: string | null;
  price: number;
  image: string | null;
  stockCount?: number | null;
}

interface StoreContentProps {
  groupName: string;
  groupSlug: string;
  products: Product[];
}

export function StoreContent({ groupName, groupSlug, products: productsProp }: StoreContentProps) {
  const products = Array.isArray(productsProp) ? productsProp : [];
  return (
    <div className="border-b border-element-gray-800 bg-element-gray-900/30">
      <div className="flex items-center justify-between gap-3 border-b border-element-gray-800 px-4 py-3.5 sm:px-6 sm:py-4">
        <h2 className="truncate text-base font-bold tracking-tight text-white sm:text-lg lg:text-xl">{groupName}</h2>
        <Link
          href="/store"
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-element-gray-800 bg-element-gray-900 text-gray-400 transition hover:border-element-gray-700 hover:text-white active:bg-element-gray-800"
          aria-label="Back to store"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </Link>
      </div>

      <div className="grid gap-3 p-4 sm:gap-4 sm:p-6 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((product) => {
          const formattedPrice = new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
          }).format(product.price / 100);

          return (
            <Link
              key={product.id}
              href={`/store/${product.slug}`}
              className="group flex items-center gap-3.5 rounded-xl border border-element-gray-800 bg-element-gray-900 p-3.5 transition hover:border-element-red/40 hover:bg-element-gray-800/80 active:bg-element-gray-800 sm:gap-4 sm:p-4"
            >
              <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-element-black sm:h-20 sm:w-20">
                {product.image ? (
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    className="object-cover transition group-hover:scale-105"
                    sizes="80px"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-element-gray-800 text-gray-500">
                    <svg className="h-8 w-8 sm:h-10 sm:w-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <span className="block truncate font-semibold text-white group-hover:text-element-red">
                  {product.name}
                </span>
                {product.subtitle && (
                  <span className="block truncate text-xs text-gray-400 sm:text-sm">{product.subtitle}</span>
                )}
                <span className="mt-0.5 block text-element-red font-medium sm:mt-1">{formattedPrice}</span>
                {product.stockCount != null && (
                  <span className="mt-0.5 block text-xs text-gray-500">
                    {product.stockCount === 0 ? "Out of stock" : `${product.stockCount} in stock`}
                  </span>
                )}
              </div>
              <span className="shrink-0 rounded-full bg-element-gray-800 p-1.5 text-element-red sm:p-2">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </span>
            </Link>
          );
        })}
      </div>

      {products.length === 0 && (
        <div className="p-8 text-center text-sm text-gray-500 sm:p-12">
          No products in this category yet.
        </div>
      )}
    </div>
  );
}
