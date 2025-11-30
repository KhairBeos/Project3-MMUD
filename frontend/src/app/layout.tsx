import type { Metadata } from "next";
import { Inter } from "next/font/google";
<<<<<<< HEAD
import "./globals.css";
=======
import "../styles/globals.css";
>>>>>>> main

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
<<<<<<< HEAD
  title: "Chat App - Kết nối bạn bè",
  description: "Ứng dụng nhắn tin thời gian thực",
  icons: {
    icon: "/favicon.ico", // Bạn có thể thay icon sau
  },
=======
  title: "SecureChat - End-to-End Encrypted Messaging",
  description: "Secure chat application with E2E encryption",
>>>>>>> main
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
<<<<<<< HEAD
    <html lang="vi">
      <body className={inter.className}>
        {/* Đây là nơi các trang con (page.tsx) được hiển thị */}
        {children}
      </body>
=======
    <html lang="en">
      <body className={inter.className}>{children}</body>
>>>>>>> main
    </html>
  );
}