import { Card } from "@/components/ui/card";
import { BadgeForm } from "../[badgeId]/_components/badge-form";

export default function CreateBadgePage() {
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">배지 만들기</h1>
      <Card className="p-6">
        <BadgeForm initialData={null} />
      </Card>
    </div>
  );
}
