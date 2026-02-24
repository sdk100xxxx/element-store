import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { DeleteGroupButton } from "@/app/components/admin/DeleteGroupButton";

export const dynamic = "force-dynamic";

export default async function AdminGroupsPage() {
  const groups = await prisma.productGroup.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { products: true } } },
  });

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Product Groups</h1>
        <Link
          href="/admin/groups/new"
          className="rounded bg-element-red px-4 py-2 text-sm font-semibold text-white transition hover:bg-element-red-dark"
        >
          Add Group
        </Link>
      </div>
      <p className="mt-2 text-sm text-gray-400">
        Organize products into groups (e.g. Scripts, Configs, Bundles). Products appear under their group on the store.
      </p>
      <div className="mt-6 overflow-x-auto rounded-lg border border-element-gray-800">
        <table className="w-full">
          <thead className="bg-element-gray-900">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Name</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Slug</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Products</th>
              <th className="px-4 py-3 text-right text-sm font-medium text-gray-400">Actions</th>
            </tr>
          </thead>
          <tbody>
            {groups.map((group) => (
              <tr key={group.id} className="border-t border-element-gray-800">
                <td className="px-4 py-3 font-medium text-white">{group.name}</td>
                <td className="px-4 py-3 text-sm text-gray-400">{group.slug}</td>
                <td className="px-4 py-3 text-sm text-gray-400">{group._count.products}</td>
                <td className="px-4 py-3 text-right">
                  <Link
                    href={`/admin/groups/${group.id}/edit`}
                    className="text-sm text-element-red hover:underline"
                  >
                    Edit
                  </Link>
                  <DeleteGroupButton
                    groupId={group.id}
                    groupName={group.name}
                    productCount={group._count.products}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {groups.length === 0 && (
        <div className="mt-6 rounded-lg border border-dashed border-element-gray-800 p-8 text-center text-gray-500">
          No groups yet. Create a group to organize your products.
        </div>
      )}
    </div>
  );
}
