<<<<<<< HEAD
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
    setIsMounted(true); // Báo hiệu đã render ở phía Client
    
    if (!token) {
      router.push('/login');
    }
  }, [token, router]);

  // Nếu chưa mount (đang ở server hoặc mới load), không render gì cả để tránh lệch HTML
  if (!isMounted) return null; 
  
  // Nếu không có token thì cũng không render gì (đợi redirect)
  if (!token) return null;

  return (
    <div className="flex h-screen w-full overflow-hidden bg-gray-100">
      <Sidebar />
      <main className="flex-1 h-full relative">
        {children}
      </main>
    </div>
  );
}
=======
import Header from "@/components/layout/Header";
import Sidebar from "@/components/layout/Sidebar";

export default function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <Header />
      <div className="flex-1 flex overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-hidden">{children}</main>
      </div>
    </div>
  );
}
>>>>>>> main
