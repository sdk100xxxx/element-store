"use client";

const cardGlow = "shadow-[0_0_20px_rgba(220,38,38,0.25)]";
const cardWidth = "w-full max-w-[14rem] sm:max-w-[16rem] sm:w-64 md:w-64 lg:w-72";
const pulseClass = "animate-hero-pulse";

const PAYMENT_ITEMS = [
  { label: "PayPal", value: 100 },
  { label: "Bitcoin", value: 90 },
  { label: "Stripe", value: 80 },
  { label: "Card", value: 70 },
];

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
              <span className="text-xs font-medium text-white">{item.label}</span>
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
