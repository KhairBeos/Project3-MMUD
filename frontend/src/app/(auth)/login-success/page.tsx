'use client';

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '../../../store/useAuthStore';

function LoginHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const setToken = useAuthStore((state) => state.setToken);

  useEffect(() => {
    const token = searchParams.get('token');
    
    if (token) {
      setToken(token); // Lưu token
      router.push('/chats'); // Vào chat
    } else {
      router.push('/login'); // Lỗi thì về login
    }
  }, [router, searchParams, setToken]);

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Loading Spinner đơn giản */}
      <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      <p className="text-gray-600 font-medium">Đang xử lý đăng nhập...</p>
    </div>
  );
}

export default function LoginSuccessPage() {
  return (
    <div className="flex h-screen items-center justify-center bg-gray-50">
      <Suspense fallback={<div>Loading...</div>}>
        <LoginHandler />
      </Suspense>
    </div>
  );
}