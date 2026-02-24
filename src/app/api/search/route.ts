import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim();
  if (!q || q.length < 2) {
    return NextResponse.json({ products: [], groups: [] });
  }

  const [products, groups] = await Promise.all([
    prisma.product.findMany({
      where: {
        isActive: true,
        OR: [
          { name: { contains: q } },
          { slug: { contains: q } },
          ...(q.length >= 3 ? [{ description: { contains: q } }] : []),
        ],
      },
      select: { id: true, name: true, slug: true, price: true },
      take: 20,
    }),
    prisma.productGroup.findMany({
      where: {
        OR: [{ name: { contains: q } }, { slug: { contains: q } }],
      },
      select: { id: true, name: true, slug: true },
      take: 10,
    }),
  ]);

  return NextResponse.json({ products, groups });
}
