import type { Prisma } from "@prisma/client";

type OrderWithItems = {
  id: string;
  items: Array<{
    productId: string;
    quantity: number;
    product: { deliveryType?: string };
  }>;
};

/**
 * Assign license keys for an order from stocked serials only (no generated keys).
 * Only serials added in Admin → Products → Serials are used. Used by the Stripe webhook and admin "Retry key assignment".
 */
export async function assignOrderKeys(
  tx: Omit<Prisma.TransactionClient, "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends">,
  order: OrderWithItems
): Promise<void> {
  for (const item of order.items) {
    const product = item.product as { deliveryType?: string };
    const deliveryType = product.deliveryType ?? "SERIAL";

    if (deliveryType === "SERIAL") {
      const available = await tx.productSerial.findMany({
        where: { productId: item.productId, orderId: null },
        take: item.quantity,
        orderBy: { createdAt: "asc" },
      });
      for (const ps of available) {
        const existingKey = await tx.licenseKey.findUnique({
          where: { key: ps.serial },
          select: { id: true },
        });
        if (existingKey) continue;

        await tx.productSerial.update({
          where: { id: ps.id },
          data: { orderId: order.id },
        });
        await tx.licenseKey.create({
          data: {
            key: ps.serial,
            orderId: order.id,
            productId: item.productId,
            isActive: true,
          },
        });
      }
      // Only stocked serials are sent; no generated keys. If available.length < item.quantity (e.g. race), customer gets what's in stock.
    }
  }
}
