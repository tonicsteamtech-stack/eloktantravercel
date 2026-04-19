'use client';

import React from 'react';
import { Toaster } from 'react-hot-toast';
import AuthProvider from "@/components/AuthProvider";
import Sidebar from '@/components/layout/Sidebar';
import Topbar from '@/components/layout/Topbar';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-gray-50 flex">
        <Sidebar />
        <main className="flex-1 ml-64 min-h-screen flex flex-col">
          <Topbar />
          <div className="p-8 flex-1 overflow-y-auto">
            {children}
          </div>
        </main>
      </div>
      <Toaster position="top-right" />
    </AuthProvider>
  );
}
