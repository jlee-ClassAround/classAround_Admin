"use server";

import { headers } from "next/headers";

interface Props {
  userId: string;
  parameterName: string;
  username?: string;
  nickname?: string;
  phone?: string;
}

export async function postTracking({
  userId,
  parameterName,
  username,
  nickname,
  phone,
}: Props) {
  try {
    const headersList = await headers();
    const ip = headersList.get("x-forwarded-for");

    const url =
      "https://d3vun18xqshzq8.cloudfront.net/external/member-tracking";
    const options = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        memberId: userId,
        parameterName,
        firstName: username,
        nickname,
        billingPhone: phone,
        lastIpAddress: ip,
      }),
    };

    const response = await fetch(url, options);
    let responseBody: unknown = null;

    if (response.status !== 204) {
      const contentType = response.headers.get("content-type")?.toLowerCase();
      if (contentType?.includes("application/json")) {
        responseBody = await response.json();
      } else {
        responseBody = await response.text();
      }
    }
    console.log("[TRK_RESPONSE]", responseBody);

    if (!response.ok) {
      throw new Error("Failed to post tracking");
    }
  } catch (error) {
    console.error("[TRK_ERROR]", error);
  }
}
