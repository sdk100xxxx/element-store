import { prisma } from "@/lib/prisma";
import { Resend } from "resend";

const FROM = process.env.RESEND_FROM?.trim() || "Element Store <onboarding@resend.dev>";

const NO_REFUND_POLICY = `
NO REFUNDS POLICY
All sales are final. We do not offer refunds or exchanges for digital products or license keys once they have been delivered. By completing your purchase you agree to this policy.
`.trim();

/**
 * Sends order confirmation email to the customer: invoice (order info, items, total),
 * no-refund policy, and their license keys. Does nothing if RESEND_API_KEY is not set.
 */
export async function sendOrderConfirmationEmail(orderId: string, toEmail: string): Promise<{ ok: boolean; error?: string }> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey || !toEmail?.trim()) {
    console.warn("[send-order-email] Skip:", !apiKey ? "RESEND_API_KEY missing" : "No toEmail");
    return { ok: false, error: !apiKey ? "RESEND_API_KEY not set" : "No email address" };
  }
  const resend = new Resend(apiKey);

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      items: { include: { product: { select: { name: true } } } },
      licenses: { where: { isActive: true }, select: { key: true } },
    },
  });

  if (!order || order.status !== "paid") {
    return { ok: false, error: "Order not found or not paid" };
  }

  const totalDollars = (order.total / 100).toFixed(2);
  const dateStr = new Date(order.createdAt).toLocaleDateString("en-US", {
    dateStyle: "medium",
    timeZone: "UTC",
  });

  const lines: string[] = [
    "Thank you for your purchase.",
    "",
    "--- ORDER INVOICE ---",
    `Order ID: ${orderId}`,
    `Date: ${dateStr}`,
    "",
    "Items:",
  ];

  for (const item of order.items) {
    const price = ((item.price * item.quantity) / 100).toFixed(2);
    lines.push(`  • ${item.product.name} x ${item.quantity} — $${price}`);
  }
  lines.push("");
  lines.push(`Total: $${totalDollars}`);
  lines.push("");
  lines.push("--- YOUR LICENSE KEY(S) ---");
  if (order.licenses.length > 0) {
    order.licenses.forEach((l) => lines.push(l.key));
  } else {
    lines.push("(No keys — service/item delivered via Discord or other channel.)");
  }
  lines.push("");
  lines.push("---");
  lines.push(NO_REFUND_POLICY);

  const textBody = lines.join("\n");

  const keysHtml =
    order.licenses.length > 0
      ? order.licenses.map((l) => `<div style="font-family:monospace;margin:4px 0;">${escapeHtml(l.key)}</div>`).join("")
      : "<p>(No keys — service/item delivered via Discord or other channel.)</p>";

  const itemsHtml = order.items
    .map(
      (item) =>
        `<tr><td style="padding:6px 12px;">${escapeHtml(item.product.name)}</td><td style="padding:6px 12px;">${item.quantity}</td><td style="padding:6px 12px;">$${((item.price * item.quantity) / 100).toFixed(2)}</td></tr>`
    )
    .join("");

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>Order Confirmation</title></head>
<body style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:20px;color:#333;">
  <h2 style="color:#1a1a1a;">Thank you for your purchase</h2>
  <p>Your order has been confirmed. Details and your license key(s) are below.</p>

  <h3 style="margin-top:24px;color:#1a1a1a;">Order invoice</h3>
  <p><strong>Order ID:</strong> ${escapeHtml(orderId)}<br><strong>Date:</strong> ${dateStr}</p>
  <table style="width:100%;border-collapse:collapse;margin:12px 0;">
    <thead><tr style="border-bottom:2px solid #ddd;"><th style="text-align:left;padding:6px 12px;">Item</th><th style="padding:6px 12px;">Qty</th><th style="text-align:right;padding:6px 12px;">Amount</th></tr></thead>
    <tbody>${itemsHtml}</tbody>
  </table>
  <p style="font-weight:bold;">Total: $${totalDollars}</p>

  <h3 style="margin-top:24px;color:#1a1a1a;">Your license key(s)</h3>
  <div style="background:#f5f5f5;padding:12px;border-radius:6px;margin:8px 0;">${keysHtml}</div>

  <h3 style="margin-top:24px;color:#1a1a1a;">No refunds policy</h3>
  <p style="font-size:14px;color:#555;">All sales are final. We do not offer refunds or exchanges for digital products or license keys once they have been delivered. By completing your purchase you agree to this policy.</p>

  <p style="margin-top:32px;font-size:12px;color:#888;">You can also view your keys anytime from the order confirmation page or your account.</p>
</body>
</html>
  `.trim();

  try {
    const { data, error } = await resend.emails.send({
      from: FROM,
      to: toEmail.trim(),
      subject: `Order confirmation – ${orderId}`,
      text: textBody,
      html,
    });
    if (error) {
      console.error("[send-order-email] Resend API error:", JSON.stringify(error));
      return { ok: false, error: String((error as { message?: string }).message ?? error) };
    }
    console.log("[send-order-email] Sent to", toEmail.trim(), "id:", (data as { id?: string })?.id);
    return { ok: true };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[send-order-email] Exception:", msg);
    return { ok: false, error: msg };
  }
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
