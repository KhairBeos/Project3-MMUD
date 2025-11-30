'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '../store/useAuthStore';

export default function HomePage() {
  const router = useRouter();
  const { token } = useAuthStore();

  useEffect(() => {
    // Kiểm tra Token và điều hướng
    if (token) {
      router.replace('/chats'); // Dùng replace để không quay lại được trang loading này
    } else {
      router.replace('/login');
    }
  }, [token, router]);

  // Màn hình Loading đẹp trong lúc chờ kiểm tra
  return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-gray-50 gap-4">
      <div className="relative flex h-16 w-16">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
        <span className="relative inline-flex rounded-full h-16 w-16 bg-blue-500 justify-center items-center text-white font-bold text-xl">
          Chat
        </span>
      </div>
      <p className="text-gray-500 font-medium animate-pulse">Đang tải ứng dụng...</p>
    </div>
  );
}