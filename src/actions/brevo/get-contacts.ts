import { contactsApi } from "@/lib/brevo";

export async function getContacts() {
  const { body } = await contactsApi.getContacts();

  return body.contacts;
}
