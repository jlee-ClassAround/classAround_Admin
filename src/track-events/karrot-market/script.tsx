"use client";

import { usePathname } from "next/navigation";
import Script from "next/script";
import { useEffect } from "react";
import { trackDanggeunEvent } from "./events";

interface DanggeunPixelProps {
  pixelId: string;
}

export default function DanggeunPixel({ pixelId }: DanggeunPixelProps) {
  const pathname = usePathname();

  useEffect(() => {
    trackDanggeunEvent("ViewPage");
  }, [pathname]);

  return (
    <>
      <Script
        src="https://karrot-pixel.business.daangn.com/0.4/karrot-pixel.umd.js"
        strategy="afterInteractive"
        onLoad={() => {
          if (typeof window !== "undefined" && window.karrotPixel) {
            window.karrotPixel.init(pixelId);
          }
        }}
      />
    </>
  );
}

// 타입 선언
declare global {
  interface Window {
    karrotPixel: {
      init: (pixelId: string) => void;
      track: (eventName: string) => void;
    };
  }
}
