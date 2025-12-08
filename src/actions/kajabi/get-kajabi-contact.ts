"use server";

import { getKajabiToken } from "./get-kajabi-token";

interface Props {
  email: string;
}

export async function getKajabiContactsWithEmail({ email }: Props) {
  try {
    const token = await getKajabiToken();

    const response = await fetch(
      `https://app.kajabi.com/api/v1/contacts?fields[contacts]=email&filter[site_id]=${process.env.KAJABI_SITE_ID}&filter[search]=${email}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const { data } = await response.json();
    if (data) {
      return data[0];
    } else {
      return null;
    }
  } catch {
    return null;
  }
}
