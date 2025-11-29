import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, ClipboardCheck, FileText } from 'lucide-react';

const Layout = () => {
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/workers', label: 'Workers', icon: Users },
    { path: '/attendance', label: 'Attendance', icon: ClipboardCheck },
    { path: '/reports', label: 'Reports', icon: FileText },
  ];

  return (
    <div className="flex h-screen bg-zinc-100">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-zinc-200">
        <div className="p-6 border-b border-zinc-200">
          <h1 className="heading-font text-2xl font-black text-zinc-900 tracking-tight">
            WAGEFLOW
          </h1>
          <p className="body-font text-xs text-zinc-500 mt-1 uppercase tracking-wide">Control Panel</p>
        </div>
        <nav className="p-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                data-testid={`nav-${item.label.toLowerCase()}`}
                className={`flex items-center gap-3 px-4 py-3 mb-1 rounded-sm transition-colors ${
                  isActive
                    ? 'bg-primary text-white'
                    : 'text-zinc-700 hover:bg-zinc-100'
                }`}
              >
                <Icon size={20} strokeWidth={2} />
                <span className="body-font font-medium text-sm uppercase tracking-wide">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;