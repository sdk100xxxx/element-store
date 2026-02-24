import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { productSchema } from "@/lib/validators";

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  const role = (session?.user as { role?: string })?.role;
  if (role !== "ADMIN" && role !== "PARTNER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }
  return null;
}

export async function POST(req: Request) {
  const authErr = await requireAdmin();
  if (authErr) return authErr;

  try {
    const body = await req.json();
    const parsed = productSchema.safeParse({
      ...body,
      price: typeof body.price === "number" ? body.price : parseInt(body.price, 10),
    });
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0]?.message || "Invalid input" },
        { status: 400 }
      );
    }

    const { name, slug, description, subtitle, price, image, imageDisplay, isActive, groupId, acceptStripe, acceptCrypto, deliveryType } = parsed.data;
    const existing = await prisma.product.findUnique({ where: { slug } });
    if (existing) {
      return NextResponse.json(
        { error: "A product with this slug already exists." },
        { status: 400 }
      );
    }

    const product = await prisma.product.create({
      data: {
        name,
        slug,
        description: description || null,
        subtitle: subtitle || null,
        price,
        image: image || null,
        imageDisplay: imageDisplay || null,
        isActive: isActive ?? true,
        groupId: groupId || null,
        acceptStripe: acceptStripe ?? true,
        acceptCrypto: acceptCrypto ?? false,
        deliveryType: deliveryType ?? "SERIAL",
      },
    });

    return NextResponse.json(product);
  } catch (e) {
    console.error("Create product error:", e);
    return NextResponse.json({ error: "Failed to create product." }, { status: 500 });
  }
}
