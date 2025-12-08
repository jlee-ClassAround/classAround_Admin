"use server";

import { getKajabiToken } from "./get-kajabi-token";

export async function addTagToContact({
  kajabiTagId,
  kajabiContactId,
}: {
  kajabiTagId: string;
  kajabiContactId: string;
}) {
  const token = await getKajabiToken();

  const response = await fetch(
    `https://app.kajabi.com/api/v1/contacts/${kajabiContactId}/relationships/tags`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        data: [
          {
            id: kajabiTagId,
            type: "contact_tags",
          },
        ],
      }),
    }
  );

  const data = await response.json();
  return data;
}
