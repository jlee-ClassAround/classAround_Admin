"use server";

import { unstable_cache as nextCache } from "next/cache";

export async function fetchKajabiToken() {
  const params = {
    username: process.env.KAJABI_USERNAME!,
    password: process.env.KAJABI_PASSWORD!,
  };

  const formBody = Object.entries(params)
    .map(
      ([key, value]) =>
        `${encodeURIComponent(key)}=${encodeURIComponent(value)}`
    )
    .join("&");

  const response = await fetch("https://app.kajabi.com/api/v1/oauth/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: formBody,
  });

  const data = await response.json();
  console.log("Kajabi data:", data);
  return data.access_token;
}

export async function getCachedKajabiToken() {
  const cache = nextCache(fetchKajabiToken, ["kajabi-token"], {
    tags: ["kajabi-token"],
    revalidate: 60 * 60 * 24,
  });

  return cache();
}

export async function getKajabiToken() {
  let token = await getCachedKajabiToken();
  if (!token) {
    token = await fetchKajabiToken();
  }
  return token;
}
