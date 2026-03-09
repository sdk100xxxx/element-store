import { prisma } from "@/lib/prisma";

const EMBED_COLOR = 0xdc2626; // element-red

/**
 * Sends a Discord webhook embed when an order is paid. No-op if DISCORD_WEBHOOK_URL is not set.
 */
export async function sendOrderPaidToDiscord(orderId: string, paymentMethod: "card" | "crypto" = "card"): Promise<void> {
  const url = process.env.DISCORD_WEBHOOK_URL?.trim();
  if (!url) return;

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: { include: { product: { select: { name: true } } } } },
  });

  if (!order || order.status !== "paid") return;

  const totalDollars = (order.total / 100).toFixed(2);
  const itemsText = order.items
    .map((i) => `${(i.product as { name: string }).name} × ${i.quantity}`)
    .join("\n");

  const embed = {
    title: "New purchase",
    color: EMBED_COLOR,
    fields: [
      { name: "Order ID", value: orderId, inline: true },
      { name: "Total", value: `$${totalDollars}`, inline: true },
      { name: "Payment", value: paymentMethod === "card" ? "Card (Stripe)" : "Crypto", inline: true },
      { name: "Customer", value: order.email || "—", inline: false },
      { name: "Items", value: itemsText || "—", inline: false },
    ],
    timestamp: new Date().toISOString(),
    footer: { text: "Element Store" },
  };

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ embeds: [embed] }),
    });
    if (!res.ok) {
      console.error("[discord-webhook] Failed to send order embed:", res.status, await res.text());
    }
  } catch (err) {
    console.error("[discord-webhook] Error sending order embed:", err);
  }
}
