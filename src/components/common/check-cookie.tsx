"use client";

import { setCookie } from "@/actions/cookies/set-cookie";
import { useSearchParams } from "next/navigation";
import { useEffect } from "react";

export function CheckCookie() {
  const searchParams = useSearchParams();

  useEffect(() => {
    const trkId = searchParams.get("trkId");
    if (trkId) {
      setCookie("trkId", trkId);
    }
  }, [searchParams]);

  return null;
}
