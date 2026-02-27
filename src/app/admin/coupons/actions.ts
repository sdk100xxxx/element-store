"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createCoupon(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session?.user || !["ADMIN", "PARTNER"].includes((session.user as { role?: string }).role ?? "")) {
    return { error: "Unauthorized" };
  }

  const code = formData.get("code")?.toString()?.trim().toUpperCase();
  const name = formData.get("name")?.toString()?.trim() || null;
  const discountType = formData.get("discountType")?.toString();
  const discountValueRaw = formData.get("discountValue")?.toString();
  const productIdRaw = formData.get("productId")?.toString();
  const allowedEmailsRaw = formData.get("allowedEmails")?.toString()?.trim();

  if (!code || code.length < 2) return { error: "Code is required (min 2 characters)." };
  if (discountType !== "PERCENT" && discountType !== "FIXED") return { error: "Invalid discount type." };
  const discountValue = discountType === "PERCENT"
    ? Math.min(100, Math.max(1, parseInt(discountValueRaw ?? "0", 10)))
    : Math.max(1, Math.round(parseFloat(discountValueRaw ?? "0") * 100)); // FIXED in cents
  if (Number.isNaN(discountValue) || discountValue < 1) return { error: "Enter a valid discount amount." };

  const productId = productIdRaw === "" || productIdRaw === "__all__" ? null : productIdRaw || null;
  const allowedEmails = allowedEmailsRaw && allowedEmailsRaw.length > 0 ? allowedEmailsRaw : null;

  try {
    await prisma.coupon.create({
      data: {
        code,
        name,
        discountType,
        discountValue,
        productId,
        allowedEmails,
      },
    });
  } catch (e) {
    const msg = e && typeof e === "object" && "code" in e && (e as { code: string }).code === "P2002"
      ? "A coupon with this code already exists."
      : "Failed to create coupon.";
    return { error: msg };
  }

  revalidatePath("/admin/coupons");
  revalidatePath("/admin");
  return { success: true };
}

export async function toggleCouponActive(couponId: string, isActive: boolean) {
  const session = await getServerSession(authOptions);
  if (!session?.user || !["ADMIN", "PARTNER"].includes((session.user as { role?: string }).role ?? "")) {
    return { error: "Unauthorized" };
  }

  await prisma.coupon.update({
    where: { id: couponId },
    data: { isActive },
  });
  revalidatePath("/admin/coupons");
  revalidatePath("/admin");
  return { success: true };
}

export async function deleteCoupon(couponId: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user || !["ADMIN", "PARTNER"].includes((session.user as { role?: string }).role ?? "")) {
    return { error: "Unauthorized" };
  }
  await prisma.coupon.delete({
    where: { id: couponId },
  });
  revalidatePath("/admin/coupons");
  revalidatePath("/admin");
  return { success: true };
}
