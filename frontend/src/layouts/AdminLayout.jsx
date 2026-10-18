import React, { useState } from 'react';
import { NavLink, Link, Outlet, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Users,
  MessageSquare,
  Film,
  BarChart3,
  ArrowLeft,
  Shield,
  Menu,
  X,
  UserCheck,
  ExternalLink
} from 'lucide-react';
import useAuth from '../hooks/useAuth';
import Badge from '../components/common/Badge';

export default function AdminLayout() {
  const { user } = useAuth();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const location = useLocation();

  const navItems = [
    { name: 'Dashboard', path: '/admin', icon: LayoutDashboard, exact: true },
    { name: 'Users', path: '/admin/users', icon: Users },
    { name: 'Reviews', path: '/admin/reviews', icon: MessageSquare },
    { name: 'Movies', path: '/admin/movies', icon: Film },
    { name: 'Analytics', path: '/admin/analytics', icon: BarChart3 }
  ];

  const adminInitials = (user?.name || 'Admin')
    .split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 flex flex-col md:flex-row">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 flex-col justify-between bg-[#0b0e17] border-r border-slate-800/80 p-5 shrink-0 min-h-screen sticky top-0">
        <div className="space-y-6">
          {/* Admin Brand */}
          <Link to="/admin" className="flex items-center gap-3 px-2">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-rose-600 flex items-center justify-center text-white shadow-lg shadow-rose-500/20">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <span className="text-base font-extrabold text-white font-display block leading-none">
                Moodie Admin
              </span>
              <span className="text-[10px] text-amber-400 font-semibold tracking-wider uppercase mt-1 block">
                Governance Portal
              </span>
            </div>
          </Link>

          {/* Navigation Items */}
          <nav className="space-y-1.5 pt-2">
            {navItems.map((item) => {
              const isActive = item.exact
                ? location.pathname === item.path
                : location.pathname.startsWith(item.path);

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-rose-500/20 to-amber-500/10 text-white border border-rose-500/30 shadow-md'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
                  }`}
                >
                  <item.icon className={`w-4 h-4 ${isActive ? 'text-rose-400' : 'text-slate-500'}`} />
                  <span>{item.name}</span>
                </NavLink>
              );
            })}

            {/* Back to Site link in sidebar */}
            <div className="pt-2">
              <Link
                to="/home"
                className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800/40 transition-colors"
              >
                <ArrowLeft className="w-4 h-4 text-slate-500" />
                <span>Back to Site</span>
              </Link>
            </div>
          </nav>
        </div>

        {/* Sidebar Footer User Card */}
        <div className="pt-4 border-t border-slate-800/80 space-y-3">
          <div className="flex items-center gap-3 px-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-rose-600 to-amber-500 flex items-center justify-center text-white font-bold text-xs">
              {adminInitials}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-white truncate">{user?.name || 'Administrator'}</p>
              <p className="text-[10px] text-slate-400 truncate">{user?.email}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area with Desktop/Mobile Top Bar */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar with Admin Name & Quick Controls */}
        <header className="h-16 bg-[#0b0e17]/90 backdrop-blur-md border-b border-slate-800/80 px-4 sm:px-8 flex items-center justify-between sticky top-0 z-40">
          {/* Mobile branding and drawer trigger */}
          <div className="flex items-center gap-3 md:hidden">
            <button
              type="button"
              onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
              className="p-2 rounded-xl bg-slate-800/80 text-slate-200 hover:text-white"
              aria-label="Toggle navigation drawer"
            >
              {mobileSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-amber-400" />
              <span className="font-bold text-white font-display text-sm">Moodie Admin</span>
            </div>
          </div>

          {/* Desktop Left status indicator */}
          <div className="hidden md:flex items-center gap-2.5 text-xs text-slate-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Admin Console Online</span>
            <span className="text-slate-600">•</span>
            <Badge variant="amber" size="sm">MCA Project Mode</Badge>
          </div>

          {/* Top Bar Admin User Info */}
          <div className="flex items-center gap-3">
            <Link
              to="/home"
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all"
            >
              <ExternalLink className="w-3.5 h-3.5 text-amber-400" />
              <span>Back to Site</span>
            </Link>

            <div className="flex items-center gap-2.5 pl-2 border-l border-slate-800">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-bold text-white leading-tight">
                  {user?.name || 'Administrator'}
                </p>
                <div className="flex items-center justify-end gap-1 mt-0.5">
                  <Badge variant="rose" size="sm" className="text-[9px] py-0 px-1.5">
                    Admin
                  </Badge>
                </div>
              </div>

              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-rose-600 to-amber-500 flex items-center justify-center text-white font-bold text-xs shadow-md">
                {adminInitials}
              </div>
            </div>
          </div>
        </header>

        {/* Mobile Sidebar Collapsible Drawer */}
        <AnimatePresence>
          {mobileSidebarOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-[#0b0e17] border-b border-slate-800 p-4 space-y-2 text-left shadow-2xl"
            >
              {navItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileSidebarOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold ${
                      isActive ? 'bg-rose-500/20 text-white border border-rose-500/30' : 'text-slate-400 hover:text-white'
                    }`
                  }
                >
                  <item.icon className="w-4 h-4 text-rose-400" />
                  <span>{item.name}</span>
                </NavLink>
              ))}

              <Link
                to="/home"
                onClick={() => setMobileSidebarOpen(false)}
                className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
              >
                <ArrowLeft className="w-4 h-4 text-slate-500" />
                <span>Back to Site</span>
              </Link>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Admin Routed Page Outlet */}
        <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
