import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Users, CalendarCheck, ShoppingBag,
  Gift, Package, Settings, LogOut, Menu, X, ChevronRight,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';

const navItems = [
  { to: '/admin',          label: 'Dashboard',  icon: LayoutDashboard, end: true },
  { to: '/admin/guests',   label: 'Guests',     icon: Users },
  { to: '/admin/rsvps',    label: 'RSVPs',      icon: CalendarCheck },
  { to: '/admin/orders',   label: 'Orders',     icon: ShoppingBag },
  { to: '/admin/gifts',    label: 'Gifts',      icon: Gift },
  { to: '/admin/products', label: 'Products',   icon: Package },
  { to: '/admin/settings', label: 'Settings',   icon: Settings },
];

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/admin/login');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-dark-950 flex flex-col transition-transform duration-300
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
        <div className="flex items-center justify-between h-16 px-5 border-b border-dark-800">
          <div>
            <p className="font-serif text-lg font-light text-white">C <span className="text-gold-400">&</span> N</p>
            <p className="font-sans text-[9px] text-gold-400/60 tracking-widest uppercase -mt-0.5">Admin</p>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-dark-400 hover:text-white">
            <X size={18} />
          </button>
        </div>

        <nav className="flex-1 py-6 overflow-y-auto">
          {navItems.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-5 py-3 font-sans text-sm transition-all duration-150
                ${isActive
                  ? 'bg-gold-600/15 text-gold-300 border-r-2 border-gold-400'
                  : 'text-dark-300 hover:text-white hover:bg-dark-800'}`
              }
            >
              <Icon size={17} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-dark-800">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2.5 text-dark-300 hover:text-white font-sans text-sm transition-colors"
          >
            <LogOut size={16} />
            Sign Out
          </button>
        </div>
      </aside>

      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <div className="flex-1 lg:ml-64 flex flex-col min-h-screen">
        <header className="h-16 bg-white border-b border-gray-200 flex items-center px-6 gap-4">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-gray-500 hover:text-gray-900">
            <Menu size={20} />
          </button>
          <div className="flex items-center gap-1 text-sm text-gray-500 font-sans">
            <span>Admin</span>
            <ChevronRight size={14} />
          </div>
          <div className="ml-auto font-sans text-xs text-gray-400">
            Chuks & Naomi Wedding
          </div>
        </header>

        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
