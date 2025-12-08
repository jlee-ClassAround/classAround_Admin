import { Card } from "@/components/ui/card";
import { PolicyForm } from "./_components/policy-form";
import { db } from "@/lib/db";

export default async function PrivacyPolicyPage() {
  const privacyPolicy = await db.terms.findUnique({
    where: {
      id: 1,
    },
  });

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">개인정보처리방침</h1>
      </div>
      <Card className="p-8">
        <PolicyForm initialData={privacyPolicy} />
      </Card>
    </div>
  );
}
