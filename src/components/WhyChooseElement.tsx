export function WhyChooseElement() {
  const features = [
    {
      icon: (
        <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 18v-6a9 9 0 0118 0v6M3 18h4a2 2 0 002-2v-4a2 2 0 00-2-2H3M21 18h-4a2 2 0 00-2-2v-4a2 2 0 012-2h4M7 8v2" />
        </svg>
      ),
      title: "Support when it matters",
      description:
        "Our team is here to help with setup, troubleshooting, and questions. Get answers so you can get back to what you're here for.",
    },
    {
      icon: (
        <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
      title: "Tested and trusted",
      description:
        "We test our builds and keep quality high. You get something that's built to perform and maintained with care.",
    },
    {
      icon: (
        <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      title: "Access in minutes",
      description:
        "Complete your purchase and get your access details right away. No long waits — just follow the steps and you're set.",
    },
    {
      icon: (
        <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      ),
      title: "Safe checkout",
      description:
        "Pay with card or crypto through secure, encrypted checkout. Your payment details stay protected.",
    },
  ];

  return (
    <section className="border-t border-element-gray-800 bg-element-gray-900/50">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:py-16 lg:py-20">
        <div className="flex flex-col items-center text-center">
          <span className="inline-flex items-center gap-2 rounded-full bg-element-red px-4 py-1.5 text-sm font-medium text-white">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Why Element
          </span>
          <h2 className="mt-4 text-2xl font-bold tracking-tight text-white sm:mt-6 sm:text-3xl lg:text-4xl">
            Simple, secure, and built to last
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm text-gray-400 sm:mt-4 sm:text-base lg:text-lg">
            We keep things straightforward: quality products, clear pricing, and help when you need it. No lock-in, no surprises — just tools that work and a team that backs them.
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
