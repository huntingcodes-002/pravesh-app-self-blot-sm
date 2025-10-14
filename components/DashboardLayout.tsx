'use client';

import React, { useState } from 'react';
import { Menu, Bell } from 'lucide-react';
import Sidebar from './Sidebar';
import { useAuth } from '@/contexts/AuthContext';

interface DashboardLayoutProps {
  children: React.ReactNode;
  title?: string;
  showNotifications?: boolean;
  notificationCount?: number;
}

export default function DashboardLayout({
  children,
  title,
  showNotifications = true,
  notificationCount = 3
}: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <header className="bg-white shadow-sm sticky top-0 z-30">
        <div className="px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Menu className="w-6 h-6 text-gray-700" />
            </button>
            {title && <h1 className="text-xl font-semibold text-gray-900">{title}</h1>}
          </div>

          <div className="flex items-center space-x-4">
            {showNotifications && (
              <button className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <Bell className="w-6 h-6 text-gray-700" />
                {notificationCount > 0 && (
                  <span className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-semibold">
                    {notificationCount}
                  </span>
                )}
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="p-4 pb-8">
        {children}
      </main>
    </div>
  );
}
