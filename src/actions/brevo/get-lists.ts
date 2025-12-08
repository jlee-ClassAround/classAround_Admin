import { contactsApi } from "@/lib/brevo";

export async function getLists() {
  const { body } = await contactsApi.getLists();
  return body.lists;
}
