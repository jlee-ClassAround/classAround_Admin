interface Props {
  trackType?: "track" | "trackCustom";
  eventName: string;
  options?: Record<string, any>;
}

export const fbqTrack = ({
  trackType = "track",
  eventName,
  options,
}: Props) => {
  if (typeof window !== "undefined" && window.fbq) {
    window.fbq(trackType, eventName, options);
  }
};
