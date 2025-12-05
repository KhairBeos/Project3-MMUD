'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '../../store/useAuthStore';
import Sidebar from '../../components/layout/Sidebar';

export default function ChatLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { token } = useAuthStore();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    
    if (!token) {
      router.push('/login');
    }
  }, [token, router]);

  // Show loading screen while checking auth
  if (!isMounted || !token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-4">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600" />
          <p className="text-sm font-medium text-gray-600">Đang tải...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full overflow-hidden bg-gray-100">
      <Sidebar />
      <main className="flex-1 h-full relative">
        {children}
      </main>
    </div>
  );
}
