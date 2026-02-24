import Link from "next/link";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <nav className="mb-8 flex gap-4 border-b border-element-gray-800 pb-4">
        <Link
          href="/admin"
          className="text-sm font-medium text-gray-400 transition hover:text-white"
        >
          Dashboard
        </Link>
        <Link
          href="/admin/groups"
          className="text-sm font-medium text-gray-400 transition hover:text-white"
        >
          Groups
        </Link>
        <Link
          href="/admin/products"
          className="text-sm font-medium text-gray-400 transition hover:text-white"
        >
          Products
        </Link>
        <Link
          href="/admin/orders"
          className="text-sm font-medium text-gray-400 transition hover:text-white"
        >
          Orders
        </Link>
        <Link
          href="/admin/activity"
          className="text-sm font-medium text-gray-400 transition hover:text-white"
        >
          Activity log
        </Link>
        <Link
          href="/admin/coupons"
          className="text-sm font-medium text-gray-400 transition hover:text-white"
        >
          Coupons
        </Link>
        <Link
          href="/admin/settings"
          className="text-sm font-medium text-gray-400 transition hover:text-white"
        >
          Settings
        </Link>
      </nav>
      {children}
    </div>
  );
}
