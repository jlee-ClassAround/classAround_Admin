import { sendGTMEvent } from "@next/third-parties/google";
import { fbqTrack } from "./meta-pixel/meta-pixel-event";

interface Props {
  amount: number;
  contentId: string;
  contentType: string;
}

export function trackPurchase({ amount, contentId, contentType }: Props) {
  // gtm 이벤트 전송
  sendGTMEvent({
    event: "purchase",
  });

  // meta pixel 이벤트 전송
  // fbqTrack({
  //   eventName: "Purchase",
  //   options: {
  //     value: Number(amount),
  //     currency: "KRW",
  //     content_ids: [contentId],
  //     content_type: contentType,
  //   },
  // });
}
