import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './components/Sidebar';
import { Topbar } from './components/Topbar';
import { ToastStack } from './components/ToastStack';

export function Layout() {
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar open={menuOpen} onClose={() => setMenuOpen(false)} />
      <div className="flex-1 min-w-0 flex flex-col overflow-hidden">
        <Topbar onMenu={() => setMenuOpen(true)} />
        <main className="flex-1 overflow-y-auto p-5 lg:p-6">
          <div className="max-w-[1400px] w-full mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
      <ToastStack />
    </div>
  );
}
