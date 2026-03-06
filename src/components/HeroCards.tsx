"use client";

const cardGlow = "shadow-[0_0_20px_rgba(220,38,38,0.25)]";
const cardWidth = "w-full max-w-[14rem] sm:max-w-[16rem] sm:w-64 md:w-64 lg:w-72";
const pulseClass = "animate-hero-pulse";

const PAYMENT_ITEMS = [
  { label: "PayPal", value: 100, icon: "paypal" },
  { label: "Bitcoin", value: 90, icon: "bitcoin" },
  { label: "Stripe", value: 80, icon: "stripe" },
  { label: "Card", value: 70, icon: "card" },
];

const iconClass = "h-6 w-6 shrink-0";
const svgProps = { viewBox: "0 0 24 24" as const, "aria-hidden": true, style: { shapeRendering: "geometricPrecision" as const } };

function PaymentIcon({ icon }: { icon: string }) {
  if (icon === "paypal")
    return (
      <svg className={iconClass} fill="currentColor" {...svgProps}>
        <path d="M6 4v14H4V4h2.5c1.38 0 2.5 1.12 2.5 2.5S9.88 9 8.5 9H6V4zm1.5 3h1c.55 0 1 .45 1 1s-.45 1-1 1h-1V7z" />
      </svg>
    );
  if (icon === "bitcoin")
    return (
      <svg className={iconClass} fill="currentColor" {...svgProps}>
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1.5 15v1.5h-1.5V17H9v-1h2.5v-4H9v-1h3V9.5h1.5V11h.5c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5h-.5v1.5h-1.5zm.5-4h.5c.41 0 .75-.34.75-.75s-.34-.75-.75-.75h-.5v1.5z" />
      </svg>
    );
  if (icon === "stripe")
    return (
      <svg className={iconClass} fill="currentColor" {...svgProps}>
        <path d="M13.5 9.2c-1.4-.5-2.2-.9-2.2-1.5 0-.6.6-1 1.6-1 1.4 0 3 .5 4 1.1l.6-3.6c-1-.5-2.4-.9-3.9-.9-2.4 0-4 1.3-4 3.3 0 1.6 1 2.5 2.6 3.2 1.3.5 1.7.9 1.7 1.4 0 .7-.6 1.2-1.6 1.2-1.2 0-2.6-.4-3.6-1l-.6 3.5c1 .5 2.5.9 4 .9 2.5 0 4.2-1.2 4.2-3.4-.1-1.3-.9-2.2-2.4-2.9z" />
      </svg>
    );
  if (icon === "card")
    return (
      <svg className={iconClass} fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" {...svgProps}>
        <rect x="2" y="5" width="20" height="14" rx="2" />
        <path d="M2 10h20" />
      </svg>
    );
  return null;
}

export function HeroCards() {
  return (
    <div className="flex flex-col items-center gap-4 md:items-end md:gap-5">
      {/* 1. Delivery */}
      <div
        className={`${cardWidth} ${pulseClass} shrink-0 rounded-2xl border border-element-red/20 bg-element-gray-900/70 p-4 backdrop-blur-sm ${cardGlow}`}
      >
        <p className="text-xs font-medium uppercase tracking-wider text-element-red">Delivery</p>
        <div className="mt-2 h-0.5 w-full overflow-hidden rounded-full bg-element-red/50" />
        <p className="mt-2 text-xl font-bold text-element-red">&lt;24/7</p>
        <p className="text-xs text-white">Always available in minutes</p>
      </div>

      {/* 2. Payment / Stock status */}
      <div
        className={`${cardWidth} ${pulseClass} shrink-0 rounded-2xl border border-element-red/25 bg-element-gray-900/75 p-4 backdrop-blur-sm ${cardGlow}`}
      >
        <div className="space-y-3">
          {PAYMENT_ITEMS.map((item) => (
            <div key={item.label} className="flex items-center justify-between gap-2">
              <span className="flex items-center gap-2 text-xs font-medium text-white">
                <span className="text-element-red">
                  <PaymentIcon icon={item.icon} />
                </span>
                {item.label}
              </span>
              <span className="text-xs font-semibold text-element-red">{item.value}%</span>
            </div>
          ))}
        </div>
        <div className="mt-3 space-y-2">
          {PAYMENT_ITEMS.map((item) => (
            <div key={`bar-${item.label}`} className="h-1.5 w-full overflow-hidden rounded-full bg-element-gray-800">
              <div
                className="h-full rounded-full bg-element-red"
                style={{ width: `${item.value}%` }}
              />
            </div>
          ))}
        </div>
      </div>

      {/* 3. Customers / Vouches */}
      <div
        className={`${cardWidth} ${pulseClass} shrink-0 rounded-2xl border border-element-red/25 bg-element-gray-900/75 p-4 backdrop-blur-sm ${cardGlow}`}
      >
        <div className="space-y-1.5 font-nunito">
          <div className="flex items-center gap-2">
            <span className="shrink-0 text-element-red" aria-hidden>
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 13l4 4L19 7" />
              </svg>
            </span>
            <p className="text-base font-semibold text-white">5K+ Customers</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="shrink-0 text-element-red" aria-hidden>
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 13l4 4L19 7" />
              </svg>
            </span>
            <p className="text-base font-semibold text-white">1K+ Vouches</p>
          </div>
        </div>
      </div>
    </div>
  );
}
