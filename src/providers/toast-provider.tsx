"use client";

import { Toaster } from "react-hot-toast";

export function ToastProvider() {
  return (
    <Toaster
      toastOptions={{
        style: {
          backgroundColor: "#333",
          color: "hsl(var(--foreground))",
        },
      }}
    />
  );
}
