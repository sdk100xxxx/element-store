import Link from "next/link";

export default function InformationPage() {
  const links = [
    { href: "/guides", label: "Installation Guides" },
    { href: "/faq", label: "FAQ" },
    { href: "/terms", label: "Terms of Service" },
    { href: "/privacy", label: "Privacy Policy" },
    { href: "/contact", label: "Contact Support" },
  ];

  return (
    <div className="mx-auto max-w-2xl px-4 py-16">
      <h1 className="text-2xl font-bold text-white">Information</h1>
      <ul className="mt-8 space-y-2">
        {links.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className="text-gray-300 transition hover:text-element-red"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
