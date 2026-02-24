"use client";

import { useState } from "react";

const FAQ_ITEMS = [
  {
    id: "support",
    question: "What kind of support do you provide?",
    answer: "We provide customer support via our Discord server. Join the community for setup help, troubleshooting, and questions.",
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 18v-6a9 9 0 0118 0v6M3 18h4a2 2 2 0 002-2v-4a2 2 0 00-2-2H3M21 18h-4a2 2 0 00-2-2v-4a2 2 0 012-2h4M7 8v2" />
      </svg>
    ),
  },
  {
    id: "refunds",
    question: "Do you offer refunds or guarantees?",
    answer: "Refund policy depends on the product. Check the product description for details, or contact us via Discord before purchasing if you have questions.",
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
  },
  {
    id: "delivery",
    question: "How quickly will I receive my order?",
    answer: "Access is delivered automatically after payment. You'll get your key or download details right away so you can get started in minutes.",
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
      </svg>
    ),
  },
  {
    id: "security",
    question: "Is my payment information secure?",
    answer: "Yes. We use encrypted checkout (Stripe for card, or crypto). We don't store your full card details on our servers.",
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
      </svg>
    ),
  },
];

export function FAQ() {
  const [openId, setOpenId] = useState<string | null>(null);

  return (
    <section className="flex justify-center border-t border-element-gray-800 bg-element-black/50 px-4 py-16 sm:py-20">
      <div className="w-full max-w-3xl">
        <h2 className="text-center text-2xl font-bold text-white sm:text-3xl">
          Frequently asked questions
        </h2>
        <p className="mt-2 text-center text-gray-400">
          Click a question to see the answer.
        </p>
        <ul className="mx-auto mt-10 max-w-2xl space-y-3">
          {FAQ_ITEMS.map((item) => {
            const isOpen = openId === item.id;
            return (
              <li
                key={item.id}
                className="overflow-hidden rounded-lg border border-element-gray-800 bg-element-gray-900/80 transition hover:border-element-gray-700"
              >
                <button
                  type="button"
                  onClick={() => setOpenId(isOpen ? null : item.id)}
                  className="flex w-full items-center gap-4 px-5 py-4 text-left transition hover:bg-element-gray-800/50"
                  aria-expanded={isOpen}
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-element-red/20 text-element-red">
                    {item.icon}
                  </span>
                  <span className="flex-1 font-semibold text-white">
                    {item.question}
                  </span>
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-element-gray-800 text-element-red transition">
                    {isOpen ? (
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    ) : (
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                    )}
                  </span>
                </button>
                {isOpen && (
                  <div className="border-t border-element-gray-800 px-5 pb-5 pt-2">
                    <p className="pl-14 text-gray-400 sm:pl-[4.5rem]">
                      {item.answer}
                    </p>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
