"use client";

import { Toaster } from "react-hot-toast";

export default function ToastProvider() {
  return (
    <Toaster
      position="bottom-right"
      toastOptions={{
        duration: 4000,
        style: {
          background: "#333",
          color: "#fff",
        },
        success: {
          style: {
            background: "#4caf50",
          },
        },
        error: {
          style: {
            background: "#f44336",
          },
        },
      }}
    />
  );
}
