"use client";

import { useEffect } from "react";
import { fbqTrack } from "./meta-pixel/meta-pixel-event";
import { sendGTMEvent } from "@next/third-parties/google";

interface Props {
  contentId: string;
  contentName: string;
}

export default function ViewContentTracker({ contentId, contentName }: Props) {
  useEffect(() => {
    // gtm 이벤트 전송
    sendGTMEvent({
      event: "view_item",
    });

    // meta pixel 이벤트 전송
    // fbqTrack({
    //   eventName: "ViewContent",
    //   options: {
    //     content_type: "course",
    //     content_ids: [contentId],
    //     content_name: contentName,
    //   },
    // });
  }, [contentId, contentName]);

  return null;
}
