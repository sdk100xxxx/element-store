import Link from "next/link";

export default function AdminSettingsPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-white">Settings</h1>
      <div className="mt-6 space-y-6">
        <section className="rounded-lg border border-element-gray-800 bg-element-gray-900 p-6">
          <h2 className="text-lg font-semibold text-white">Stripe</h2>
          <p className="mt-2 text-sm text-gray-400">
            Configure your Stripe API keys in the <code className="rounded bg-element-black px-1 py-0.5 text-element-red">.env</code> file.
          </p>
          <ul className="mt-4 list-inside list-disc space-y-1 text-sm text-gray-400">
            <li>STRIPE_SECRET_KEY</li>
            <li>STRIPE_PUBLISHABLE_KEY</li>
            <li>STRIPE_WEBHOOK_SECRET (for license key generation)</li>
          </ul>
          <p className="mt-4 text-sm text-gray-400">
            Webhook URL: <code className="rounded bg-element-black px-1 py-0.5 text-element-red">https://yourdomain.com/api/webhooks/stripe</code>
          </p>
        </section>
        <section className="rounded-lg border border-element-gray-800 bg-element-gray-900 p-6">
          <h2 className="text-lg font-semibold text-white">Create Admin User</h2>
          <p className="mt-2 text-sm text-gray-400">
            Run the seed script to create your first admin account.
          </p>
          <pre className="mt-4 overflow-x-auto rounded bg-element-black p-4 text-sm text-gray-300">
            npm run db:seed
          </pre>
          <p className="mt-2 text-sm text-gray-400">
            Or use: <code className="rounded bg-element-black px-1 py-0.5 text-element-red">npx ts-node prisma/seed.ts</code>
          </p>
        </section>
        <section className="rounded-lg border border-element-gray-800 bg-element-gray-900 p-6">
          <h2 className="text-lg font-semibold text-white">Security</h2>
          <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-gray-400">
            <li>Rate limiting on auth and checkout</li>
            <li>Input validation with Zod</li>
            <li>Secure session cookies (httpOnly, sameSite)</li>
            <li>Admin routes protected by middleware</li>
            <li>License keys generated on successful payment</li>
          </ul>
        </section>
      </div>
    </div>
  );
}
