<<<<<<< HEAD
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
=======
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const conversations = [
  {
    id: "1",
    name: "Alice Johnson",
    lastMessage: "Hey, how are you?",
    time: "2m ago",
    unread: 2,
    online: true,
  },
  {
    id: "2",
    name: "Bob Smith",
    lastMessage: "See you tomorrow!",
    time: "1h ago",
    unread: 0,
    online: false,
  },
  {
    id: "3",
    name: "Dev Team",
    lastMessage: "Meeting at 3pm",
    time: "3h ago",
    unread: 5,
    online: true,
    isGroup: true,
  },
  {
    id: "4",
    name: "Charlie Davis",
    lastMessage: "Thanks!",
    time: "5h ago",
    unread: 0,
    online: false,
  },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-80 bg-white border-r border-gray-200 flex flex-col flex-shrink-0">
      {/* Search */}
      <div className="p-4 border-b border-gray-200">
        <div className="relative">
          <input
            type="text"
            placeholder="Search conversations..."
            className="w-full pl-10 pr-4 py-2 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <span className="absolute left-3 top-2.5 text-gray-400">🔍</span>
        </div>
      </div>

      {/* Conversation List */}
      <div className="flex-1 overflow-y-auto">
        {conversations.map((conv) => {
          const isActive = pathname === `/chat/${conv.id}`;

          return (
            <Link
              key={conv.id}
              href={`/chat/${conv.id}`}
              className={`flex items-center gap-3 p-4 hover:bg-gray-50 border-b border-gray-100 cursor-pointer transition ${
                isActive ? "bg-blue-50 border-l-4 border-l-blue-500" : ""
              }`}
            >
              <div className="relative flex-shrink-0">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold text-lg">
                  {conv.isGroup ? "👥" : conv.name[0]}
                </div>
                {conv.online && (
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-baseline mb-1">
                  <h3 className="font-semibold text-gray-900 truncate">
                    {conv.name}
                  </h3>
                  <span className="text-xs text-gray-500 ml-2 flex-shrink-0">
                    {conv.time}
                  </span>
                </div>
                <p className="text-sm text-gray-600 truncate">
                  {conv.lastMessage}
                </p>
              </div>

              {conv.unread > 0 && (
                <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                  {conv.unread}
                </div>
              )}
            </Link>
          );
        })}
      </div>

      {/* New Chat Button */}
      <div className="p-4 border-t border-gray-200">
        <Link
          href="/chat/new"
          className="w-full py-3 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 transition flex items-center justify-center gap-2"
        >
          <span className="text-xl">➕</span>
          <span>New Chat</span>
        </Link>
      </div>
    </aside>
  );
}
>>>>>>> main
