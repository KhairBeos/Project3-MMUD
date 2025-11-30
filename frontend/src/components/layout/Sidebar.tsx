'use client';

import { useAuthStore } from '../../store/useAuthStore';

export default function Sidebar() {
  const logout = useAuthStore((state) => state.logout);

  return (
    <div className="w-64 bg-white border-r h-full p-4 flex flex-col">
      <h2 className="font-bold text-xl mb-4">Sidebar</h2>
      <p className="text-gray-500 text-sm mb-auto">Danh sách phòng chat sẽ ở đây...</p>
      
      <button 
        onClick={logout}
        className="w-full p-2 bg-red-500 text-white rounded hover:bg-red-600"
      >
        Đăng xuất (Test)
      </button>
    </div>
  );
}
