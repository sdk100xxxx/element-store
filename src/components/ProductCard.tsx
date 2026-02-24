import Link from "next/link";
import Image from "next/image";

interface ProductCardProps {
  name: string;
  subtitle?: string | null;
  slug: string;
  image?: string | null;
  price: number;
}

export function ProductCard({ name, subtitle, slug, image, price }: ProductCardProps) {
  const formattedPrice = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(price / 100);

  return (
    <Link
      href={`/store/${slug}`}
      className="group flex flex-col overflow-hidden rounded-lg border border-element-gray-800 bg-element-gray-900 transition hover:border-element-red/50 hover:shadow-lg hover:shadow-element-red/10"
    >
      <div className="relative aspect-square w-full bg-element-black">
        {image ? (
          <Image
            src={image}
            alt={name}
            fill
            className="object-cover transition group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <Image
              src="/logo.png"
              alt={name}
              width={80}
              height={80}
              className="opacity-50"
            />
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col p-4">
        <h3 className="text-lg font-bold text-white group-hover:text-element-red">
          {name}
        </h3>
        {subtitle && (
          <p className="mt-1 text-sm text-gray-400">{subtitle}</p>
        )}
        <p className="mt-auto pt-2 text-element-red font-semibold">{formattedPrice}</p>
      </div>
    </Link>
  );
}
