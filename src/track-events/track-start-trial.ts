import { sendGTMEvent } from "@next/third-parties/google";
import { fbqTrack } from "./meta-pixel/meta-pixel-event";
import { trackDanggeunEvent } from "./karrot-market/events";

export function trackStartTrial() {
  // gtm 이벤트 전송
  sendGTMEvent({
    event: "applyCourse",
  });

  // meta pixel 이벤트 전송
  // fbqTrack({
  //   eventName: "StartTrial",
  //   options: {
  //     value: 0.0,
  //     currency: "KRW",
  //   },
  // });

  // 당근마켓 pixel 이벤트 전송
  trackDanggeunEvent("Lead");
}
