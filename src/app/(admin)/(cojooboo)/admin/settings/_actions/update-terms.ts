"use server";

import { db } from "@/lib/db";
import { TermsSchema } from "@/validations/schemas";
import { revalidatePath } from "next/cache";

interface Props {
  id: number;
  values: TermsSchema;
}

export async function updateTerms({ id, values }: Props) {
  await db.terms.upsert({
    where: { id },
    update: values,
    create: {
      id,
      ...values,
    },
  });

  revalidatePath("/admin/settings/terms");

  revalidatePath("/terms-of-use");
  revalidatePath("/privacy-policy");
  revalidatePath("/refund-policy");
}
