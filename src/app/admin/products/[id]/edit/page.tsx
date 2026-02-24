import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ProductForm } from "@/app/components/admin/ProductForm";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditProductPage({ params }: Props) {
  const { id } = await params;
  const [product, groups] = await Promise.all([
    prisma.product.findUnique({ where: { id } }),
    prisma.productGroup.findMany({ orderBy: { name: "asc" } }),
  ]);
  if (!product) notFound();

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Edit Product</h1>
        {(product as { deliveryType?: string }).deliveryType !== "SERVICE" && (
          <a
            href={`/admin/products/${product.id}/serials`}
            className="rounded border border-element-gray-600 bg-element-gray-800 px-4 py-2 text-sm font-medium text-white transition hover:bg-element-gray-700"
          >
            Manage stock (serials)
          </a>
        )}
      </div>
      <ProductForm product={product} groups={groups} />
    </div>
  );
}
