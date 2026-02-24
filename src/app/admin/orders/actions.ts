"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function expireOrder(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session?.user || !["ADMIN", "PARTNER"].includes((session.user as { role?: string }).role ?? "")) {
    return { error: "Unauthorized" };
  }

  const orderId = formData.get("orderId")?.toString();
  if (!orderId) return { error: "Missing order" };

  await prisma.order.updateMany({
    where: { id: orderId, status: "pending" },
    data: { status: "expired" },
  });

  revalidatePath(`/admin/orders/${orderId}`);
  revalidatePath("/admin/orders");
  revalidatePath("/admin");
  return { success: true };
}
