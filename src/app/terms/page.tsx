import Link from "next/link";

export const metadata = {
  title: "Terms of Service - Element",
  description: "Terms of Service for Element.",
};

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="text-3xl font-bold text-white">Terms of Service</h1>
      <p className="mt-4 text-gray-400">
        Welcome to Element. By using our site and services, you agree to these terms.
        Please read them carefully. We reserve the right to update this page;
        continued use after changes constitutes acceptance.
      </p>
      <p className="mt-4 text-gray-400">
        For refunds, support, and product-specific terms, see product descriptions
        and contact us via Discord if you have questions.
      </p>
      <Link
        href="/"
        className="mt-8 inline-block text-element-red hover:underline"
      >
        ← Back to home
      </Link>
    </div>
  );
}
