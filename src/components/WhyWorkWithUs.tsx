export function WhyWorkWithUs() {
  const features = [
    {
      icon: (
        <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
        </svg>
      ),
      title: "Custom website builds",
      description:
        "From landing pages to full storefronts and dashboards. We use modern stacks — Next.js, Prisma, secure auth — so your site is fast and maintainable.",
    },
    {
      icon: (
        <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4m0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
        </svg>
      ),
      title: "Themes & design",
      description:
        "Clean, responsive themes and UI that fit your brand. We care about typography, layout, and UX so your project looks and feels polished.",
    },
    {
      icon: (
        <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
      title: "Secure by default",
      description:
        "Auth, rate limiting, and sensible security headers are part of the build. We don’t bolt on security later — it’s built in from the start.",
    },
    {
      icon: (
        <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
      title: "Support when you need it",
      description:
        "Setup help, troubleshooting, and ongoing questions. Get in touch via Discord or email so you can focus on running your project.",
    },
  ];

  return (
    <section className="border-t border-element-gray-800 bg-element-gray-900/50">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:py-16 lg:py-20">
        <div className="flex flex-col items-center text-center">
          <span className="inline-flex items-center gap-2 rounded-full bg-element-red px-4 py-1.5 text-sm font-medium text-white">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            Why work with us
          </span>
          <h2 className="mt-4 text-2xl font-bold tracking-tight text-white sm:mt-6 sm:text-3xl lg:text-4xl">
            Builds and themes you can rely on
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm text-gray-400 sm:mt-4 sm:text-base lg:text-lg">
            We build the same way we run this site: modern stack, clear structure, and security built in. No lock-in, no surprises — just solid websites and themes.
          </p>
        </div>

        <div className="mt-8 grid gap-4 sm:mt-12 sm:gap-6 sm:grid-cols-2 lg:mt-16">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="rounded-xl border border-element-gray-800 bg-element-gray-900 p-4 transition hover:border-element-red/30 sm:p-6"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-element-red/20 text-element-red">
                {feature.icon}
              </div>
              <h3 className="mt-4 text-lg font-semibold text-white">{feature.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-gray-400">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
