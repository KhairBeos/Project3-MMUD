"use client";

import { useEffect } from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { useNotificationStore } from "@/store/notification.store";
import "../styles/globals.css";

const inter = Inter({ subsets: ["latin"] });

// Note: metadata needs to be exported from a Server Component
// For now, we'll remove it since we need 'use client' for socket connection

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { initSocket, disconnectSocket } = useNotificationStore();

  useEffect(() => {
    // Kết nối notification socket khi user đã login
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      const userId = localStorage.getItem("userId");

      if (token && userId) {
        console.log("🔔 Connecting notification socket...");
        initSocket(token, userId);
      }
    }

    // Cleanup khi unmount
    return () => {
      disconnectSocket();
    };
  }, [initSocket, disconnectSocket]);

  return (
    <html lang="en">
      <head>
        <title>SecureChat - End-to-End Encrypted Messaging</title>
        <meta
          name="description"
          content="Secure chat application with E2E encryption"
        />
      </head>
      <body className={inter.className}>{children}</body>
    </html>
  );
}
