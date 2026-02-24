import { prisma } from "@/lib/prisma";
import { DownloadsContent } from "./DownloadsContent";

export const dynamic = "force-dynamic";

export default async function DownloadsPage() {
  const items = await prisma.downloadItem.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true, slug: true, fileUrl: true },
  });
  return <DownloadsContent items={items} />;
}
