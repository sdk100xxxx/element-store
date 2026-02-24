import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { GroupForm } from "@/app/components/admin/GroupForm";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditGroupPage({ params }: Props) {
  const { id } = await params;
  const group = await prisma.productGroup.findUnique({ where: { id } });
  if (!group) notFound();

  return (
    <div>
      <h1 className="text-2xl font-bold text-white">Edit Group</h1>
      <GroupForm group={group} />
    </div>
  );
}
