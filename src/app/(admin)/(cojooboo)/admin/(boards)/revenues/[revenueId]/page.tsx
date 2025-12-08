import { Card } from "@/components/ui/card";
import { db } from "@/lib/db";
import { RevenueForm } from "./_components/revenue-form";

interface Props {
  params: Promise<{ revenueId: string }>;
}

export default async function RevenueIdPage({ params }: Props) {
  const { revenueId } = await params;
  const id = Number(revenueId);

  const revenue = isNaN(id)
    ? null
    : await db.revenue.findUnique({
        where: {
          id,
        },
      });

  const users = await db.user.findMany({
    select: {
      id: true,
      username: true,
      email: true,
    },
  });

  return (
    <Card className="p-8">
      <RevenueForm initialData={revenue} users={users} />
    </Card>
  );
}
