import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Chat App - Kết nối bạn bè",
  description: "Ứng dụng nhắn tin thời gian thực",
  icons: {
    icon: "/favicon.ico", // Bạn có thể thay icon sau
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      <body className={inter.className}>
        {/* Đây là nơi các trang con (page.tsx) được hiển thị */}
        {children}
      </body>
    </html>
  );
}