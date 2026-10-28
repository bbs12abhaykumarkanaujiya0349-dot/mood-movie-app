import React, { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Clapperboard,
  Sparkles,
  Menu,
  X,
  Compass,
  Film,
  Smile,
  Info,
  LogIn,
  UserPlus,
  Bookmark,
  User,
  Settings,
  Shield,
  LogOut,
  ChevronDown,
  Heart,
  History
} from 'lucide-react';
import Container from '../common/Container';
import Button from '../common/Button';
import Badge from '../common/Badge';
import useAuth from '../../hooks/useAuth';
import toast from 'react-hot-toast';

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close menus on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setUserDropdownOpen(false);
  }, [location.pathname]);

  const handleLogout = async () => {
    await logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  // Dynamic Navigation Links based on authentication
  const navLinks = isAuthenticated
    ? [
        { name: 'Dashboard', path: '/home', icon: Film },
        { name: 'Movies', path: '/movies', icon: Compass },
        { name: 'Mood', path: '/mood', icon: Smile },
        { name: 'Watchlist', path: '/watchlist', icon: Bookmark },
        { name: 'About', path: '/about', icon: Info }
      ]
    : [
        { name: 'Home', path: '/', icon: Film },
        { name: 'Explore Movies', path: '/movies', icon: Compass },
        { name: 'Mood Matcher', path: '/mood', icon: Smile },
        { name: 'About', path: '/about', icon: Info }
      ];

  const userInitials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
    : 'U';

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-[#0a0b10]/90 backdrop-blur-md border-b border-white/10 shadow-lg shadow-black/40 py-3'
          : 'bg-transparent py-4 sm:py-5'
      }`}
    >
      <Container>
        <div className="flex items-center justify-between">
          {/* Logo & Brand Identity */}
          <Link to={isAuthenticated ? '/home' : '/'} className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-rose-600 via-rose-500 to-amber-500 flex items-center justify-center text-white shadow-lg shadow-rose-500/25 group-hover:scale-105 transition-transform duration-200">
              <Clapperboard className="w-5 h-5" />
            </div>
            <div className="flex flex-col text-left">
              <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-rose-300 bg-clip-text text-transparent font-display">
                Moodie
              </span>
              <span className="text-[10px] uppercase font-bold tracking-widest text-amber-400/90 -mt-1 flex items-center gap-1">
                AI Cinema <Sparkles className="w-2.5 h-2.5" />
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 bg-[#121520]/70 p-1.5 rounded-full border border-white/5 backdrop-blur-sm">
            {navLinks.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                className={({ isActive }) =>
                  `px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30 shadow-sm'
                      : 'text-slate-300 hover:text-white hover:bg-white/5'
                  }`
                }
              >
                <link.icon className="w-3.5 h-3.5" />
                <span>{link.name}</span>
              </NavLink>
            ))}
          </nav>

          {/* Desktop Actions / User Dropdown */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  type="button"
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2.5 p-1.5 pr-3 rounded-full bg-[#121520] hover:bg-[#181c2b] border border-slate-800 transition-colors cursor-pointer select-none"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-rose-600 to-amber-500 flex items-center justify-center text-white text-xs font-bold shadow-md shadow-rose-500/20">
                    {userInitials}
                  </div>
                  <div className="text-left text-xs">
                    <span className="font-semibold text-white block leading-tight">
                      {user?.name || 'User'}
                    </span>
                    <span className="text-[10px] text-slate-400 capitalize">
                      {user?.role}
                    </span>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-1" />
                </button>

                {/* Dropdown Menu */}
                <AnimatePresence>
                  {userDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 mt-2 w-60 rounded-2xl bg-[#0e111a] border border-slate-800 shadow-2xl overflow-hidden py-2 text-left z-50 backdrop-blur-xl"
                    >
                      <div className="px-4 py-2.5 border-b border-slate-800/80 mb-1">
                        <p className="text-xs font-bold text-white truncate">{user?.name}</p>
                        <p className="text-[11px] text-slate-400 truncate">{user?.email}</p>
                        {isAdmin && (
                          <Badge variant="amber" size="sm" className="mt-1.5" dot>
                            Administrator
                          </Badge>
                        )}
                      </div>

                      <div className="py-1 text-xs">
                        <Link
                          to="/profile"
                          className="flex items-center gap-2.5 px-4 py-2 text-slate-300 hover:text-white hover:bg-slate-800/50 transition-colors"
                        >
                          <User className="w-4 h-4 text-slate-400" />
                          <span>My Profile</span>
                        </Link>

                        <Link
                          to="/watchlist"
                          className="flex items-center gap-2.5 px-4 py-2 text-slate-300 hover:text-white hover:bg-slate-800/50 transition-colors"
                        >
                          <Bookmark className="w-4 h-4 text-slate-400" />
                          <span>Watchlist</span>
                        </Link>

                        <Link
                          to="/favorites"
                          className="flex items-center gap-2.5 px-4 py-2 text-slate-300 hover:text-white hover:bg-slate-800/50 transition-colors"
                        >
                          <Heart className="w-4 h-4 text-rose-400" />
                          <span>Favorites</span>
                        </Link>

                        <Link
                          to="/history"
                          className="flex items-center gap-2.5 px-4 py-2 text-slate-300 hover:text-white hover:bg-slate-800/50 transition-colors"
                        >
                          <History className="w-4 h-4 text-slate-400" />
                          <span>Mood History</span>
                        </Link>

                        <Link
                          to="/settings"
                          className="flex items-center gap-2.5 px-4 py-2 text-slate-300 hover:text-white hover:bg-slate-800/50 transition-colors"
                        >
                          <Settings className="w-4 h-4 text-slate-400" />
                          <span>Settings</span>
                        </Link>

                        {isAdmin && (
                          <div className="pt-1 mt-1 border-t border-slate-800/80">
                            <Link
                              to="/admin"
                              className="flex items-center gap-2.5 px-4 py-2 text-amber-300 hover:text-amber-200 hover:bg-amber-500/10 transition-colors font-medium"
                            >
                              <Shield className="w-4 h-4 text-amber-400" />
                              <span>Admin Panel</span>
                            </Link>
                          </div>
                        )}
                      </div>

                      <div className="pt-1 mt-1 border-t border-slate-800/80">
                        <button
                          type="button"
                          onClick={handleLogout}
                          className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors text-left"
                        >
                          <LogOut className="w-4 h-4" />
                          <span>Log Out</span>
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="ghost" size="sm" leftIcon={LogIn}>
                    Sign In
                  </Button>
                </Link>
                <Link to="/register">
                  <Button variant="primary" size="sm" leftIcon={UserPlus}>
                    Get Started
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Hamburger Toggle */}
          <div className="md:hidden">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl bg-slate-800/80 text-slate-200 hover:text-white border border-slate-700 focus:outline-none focus:ring-2 focus:ring-rose-500"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </Container>

      {/* Mobile Drawer Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="md:hidden bg-[#0c0e17]/98 backdrop-blur-2xl border-b border-slate-800 overflow-hidden shadow-2xl"
          >
            <Container className="py-6 space-y-4">
              {isAuthenticated && (
                <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-900 border border-slate-800">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-rose-600 to-amber-500 flex items-center justify-center text-white text-sm font-bold">
                    {userInitials}
                  </div>
                  <div className="text-left text-xs truncate">
                    <p className="font-bold text-white truncate">{user?.name}</p>
                    <p className="text-[11px] text-slate-400 truncate">{user?.email}</p>
                  </div>
                  {isAdmin && (
                    <Badge variant="amber" size="sm" className="ml-auto">
                      Admin
                    </Badge>
                  )}
                </div>
              )}

              <nav className="flex flex-col gap-1.5">
                {navLinks.map((link) => (
                  <NavLink
                    key={link.path}
                    to={link.path}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                        isActive
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                      }`
                    }
                  >
                    <link.icon className="w-4 h-4 text-rose-400" />
                    <span>{link.name}</span>
                  </NavLink>
                ))}

                {isAuthenticated && (
                  <>
                    <Link
                      to="/favorites"
                      className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-300 hover:text-white hover:bg-slate-800/60"
                    >
                      <Heart className="w-4 h-4 text-rose-400" />
                      <span>Favorites</span>
                    </Link>
                    <Link
                      to="/profile"
                      className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-300 hover:text-white hover:bg-slate-800/60"
                    >
                      <User className="w-4 h-4 text-slate-400" />
                      <span>My Profile</span>
                    </Link>
                    {isAdmin && (
                      <Link
                        to="/admin"
                        className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold text-amber-300 hover:bg-amber-500/10"
                      >
                        <Shield className="w-4 h-4 text-amber-400" />
                        <span>Admin Panel</span>
                      </Link>
                    )}
                  </>
                )}
              </nav>

              <div className="pt-4 border-t border-slate-800/80 flex flex-col gap-2.5">
                {isAuthenticated ? (
                  <Button
                    variant="danger"
                    size="md"
                    className="w-full"
                    onClick={handleLogout}
                    leftIcon={LogOut}
                  >
                    Log Out
                  </Button>
                ) : (
                  <>
                    <Link to="/login" className="w-full">
                      <Button variant="secondary" size="md" className="w-full" leftIcon={LogIn}>
                        Sign In
                      </Button>
                    </Link>
                    <Link to="/register" className="w-full">
                      <Button variant="primary" size="md" className="w-full" leftIcon={UserPlus}>
                        Create Account
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </Container>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
