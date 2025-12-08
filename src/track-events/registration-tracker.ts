import { sendGTMEvent } from "@next/third-parties/google";
import { fbqTrack } from "./meta-pixel/meta-pixel-event";

interface Props {
  userId: string;
}

export function registrationTracker({ userId }: Props) {
  // gtm 이벤트 전송
  sendGTMEvent({
    event: "sign_up",
  });

  // meta pixel 이벤트 전송
  // fbqTrack({
  //   eventName: "CompleteRegistration",
  //   options: {
  //     user_id: userId,
  //   },
  // });
}
