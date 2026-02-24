import { ProductForm } from "@/app/components/admin/ProductForm";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function NewProductPage() {
  const groups = await prisma.productGroup.findMany({
    orderBy: { name: "asc" },
  });
  return (
    <div>
      <h1 className="text-2xl font-bold text-white">Add Product</h1>
      <ProductForm groups={groups} />
    </div>
  );
}
