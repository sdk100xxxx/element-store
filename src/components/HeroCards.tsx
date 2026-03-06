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

function PaymentIcon({ icon }: { icon: string }) {
  const c = "h-5 w-5 shrink-0";
  if (icon === "paypal")
    return (
      <svg className={c} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        <path d="M7.076 21.337H2.47a.596.596 0 0 1-.587-.692L4.944 3.02a.597.597 0 0 1 .587-.502h5.18c2.404 0 4.202.603 5.398 1.784 1.197 1.182 1.782 2.77 1.782 4.806 0 1.336-.209 2.538-.614 3.56-.415 1.048-.986 1.93-1.73 2.666-.726.717-1.578 1.243-2.586 1.6-1.01.358-2.133.532-3.398.532H9.67a.597.597 0 0 0-.587.502l-.597 3.767z" />
      </svg>
    );
  if (icon === "bitcoin")
    return (
      <svg className={c} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm.5 14.5v1.5h-1.5v-1.5H9.5v-1h1.5v-4H9.5v-1h2.5V7h1v1.5h.5c.83 0 1.5.67 1.5 1.5 0 .55-.3 1.03-.74 1.29.44.26.74.74.74 1.29 0 .83-.67 1.5-1.5 1.5h-.5v1.5h-1v-1.5zm.5-5.5h.5c.28 0 .5-.22.5-.5s-.22-.5-.5-.5h-.5v1zm0 3h.5c.28 0 .5-.22.5-.5s-.22-.5-.5-.5h-.5v1z" />
      </svg>
    );
  if (icon === "stripe")
    return (
      <svg className={c} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        <path d="M13.976 9.15c-2.172-.806-3.356-1.426-3.356-2.409 0-.831.683-1.305 1.901-1.305 2.227 0 4.515.858 6.09 1.631l.89-5.494C18.252.975 15.697 0 12.165 0 9.667 0 7.589.654 6.104 1.872 4.56 3.147 3.788 4.993 3.788 7.218v.059c0 2.403 1.184 4.158 3.54 5.19 2.27.987 3.044 1.847 3.044 2.925 0 .98-.758 1.601-2.228 1.601-1.336 0-3.872-.916-5.378-1.714L6.68 20.364c1.732.795 4.408 1.574 7.308 1.574 2.566 0 4.732-.624 6.313-1.862 1.723-1.331 2.578-3.387 2.578-5.943v-.056c0-2.049-.994-3.688-3.595-4.924z" />
      </svg>
    );
  if (icon === "card")
    return (
      <svg className={c} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
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
