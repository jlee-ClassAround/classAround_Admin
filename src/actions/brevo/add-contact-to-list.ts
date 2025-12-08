"use server";

import { contactsApi } from "@/lib/brevo";

export async function addContactToList(email: string, listId: number) {
  const { body } = await contactsApi.addContactToList(listId, {
    emails: [email],
  });
  console.log(body);
}
