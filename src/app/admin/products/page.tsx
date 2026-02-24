import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { DeleteProductButton } from "@/app/components/admin/DeleteProductButton";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  const products = await prisma.product.findMany({
    orderBy: { name: "asc" },
    include: { group: true },
  });

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Products</h1>
        <Link
          href="/admin/products/new"
          className="rounded bg-element-red px-4 py-2 text-sm font-semibold text-white transition hover:bg-element-red-dark"
        >
          Add Product
        </Link>
      </div>
      <div className="mt-6 overflow-x-auto rounded-lg border border-element-gray-800">
        <table className="w-full">
          <thead className="bg-element-gray-900">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Name</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Group</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Slug</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Price</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Status</th>
              <th className="px-4 py-3 text-right text-sm font-medium text-gray-400">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id} className="border-t border-element-gray-800">
                <td className="px-4 py-3 font-medium text-white">{product.name}</td>
                <td className="px-4 py-3 text-sm text-gray-400">
                  {product.group?.name ?? "—"}
                </td>
                <td className="px-4 py-3 text-sm text-gray-400">{product.slug}</td>
                <td className="px-4 py-3 text-sm text-element-red">
                  ${(product.price / 100).toFixed(2)}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded px-2 py-0.5 text-xs ${
                      product.isActive ? "bg-green-500/20 text-green-400" : "bg-gray-500/20 text-gray-400"
                    }`}
                  >
                    {product.isActive ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <Link
                    href={`/admin/products/${product.id}/edit`}
                    className="text-sm text-element-red hover:underline"
                  >
                    Edit
                  </Link>
                  <DeleteProductButton productId={product.id} productName={product.name} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
