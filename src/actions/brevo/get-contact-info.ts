import { contactsApi } from "@/lib/brevo";

export async function getContactInfo(email: string) {
  const { body } = await contactsApi.getContactInfo(email);
  return body;
}
