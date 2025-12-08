"use server";

import { contactsApi } from "@/lib/brevo";

export async function createList(name: string) {
  const response = await contactsApi.createList({
    name,
    folderId: 1,
  });
  return response;
}
