"use client";

import { sendGTMEvent } from "@next/third-parties/google";
import { useEffect } from "react";
import { fbqTrack } from "./meta-pixel/meta-pixel-event";

interface Props {
  contentId: string;
  contentType: string;
  value: number;
}

export default function StartCheckoutTracker({
  contentId,
  value,
  contentType,
}: Props) {
  useEffect(() => {
    // gtm 이벤트 전송
    sendGTMEvent({
      event: "enterCheckout",
    });

    // meta pixel 이벤트 전송
    // fbqTrack({
    //   eventName: "InitiateCheckout",
    //   options: {
    //     value,
    //     currency: "KRW",
    //     content_ids: [contentId],
    //     content_type: contentType,
    //   },
    // });
  }, [contentId, contentType, value]);

  return null;
}
