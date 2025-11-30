"use client";

import { useState } from "react";
import Link from "next/link";
import NotificationBell from "@/components/ui/NotificationBell";

export default function Header() {
  const [showUserMenu, setShowUserMenu] = useState(false);

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
      <div className="flex items-center gap-4">
        <h1 className="text-2xl font-bold text-blue-600">🔐 SecureChat</h1>
      </div>

      <div className="flex items-center gap-4">
        <button className="p-2 hover:bg-gray-100 rounded-lg transition">
          🔍
        </button>

        {/* Notification Bell - UPDATED */}
        <NotificationBell />

        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
              U
            </div>
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2">
              <Link
                href="/profile"
                className="block px-4 py-2 hover:bg-gray-100"
              >
                👤 Profile
              </Link>
              <Link
                href="/profile/settings"
                className="block px-4 py-2 hover:bg-gray-100"
              >
                ⚙️ Settings
              </Link>
              <hr className="my-2" />
              <button className="w-full text-left px-4 py-2 hover:bg-gray-100 text-red-600">
                🚪 Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
