import { GoogleTagManager } from "@next/third-parties/google";
import type { Metadata } from "next";
import "./globals.css";

import { QueryProvider } from "@/providers/query-provider";

import { cn } from "@/lib/utils";
import GtmNoscript from "@/scripts/gtm-noscript";
import { clashDisplay, freesectation, nexonWarhaven } from "./fonts";

export const metadata: Metadata = {
  title: {
    default: "코주부클래스",
    template: "%s - 코주부클래스",
  },
  description: "코주부클래스",
  icons: {
    icon: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="bg-neutral-800" suppressHydrationWarning>
      <GoogleTagManager gtmId="GTM-P5PPMBBQ" />
      <body
        className={cn(
          clashDisplay.variable,
          nexonWarhaven.variable,
          freesectation.className,
          "antialiased"
        )}
        suppressHydrationWarning
      >
        <QueryProvider>{children}</QueryProvider>
        {/* <GtmNoscript /> */}
      </body>
    </html>
  );
}
