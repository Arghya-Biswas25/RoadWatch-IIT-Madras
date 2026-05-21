import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { MapPin, BarChart2, MessageSquare, AlertTriangle, Search, LogIn, LogOut, User, Shield, Menu, X, Wifi, WifiOff } from 'lucide-react';
import { useState } from 'react';
import { useAuthStore } from '../../store/auth';
import { useAppStore } from '../../store/app';

export default function Layout() {
  const { user, isAuthenticated, logout } = useAuthStore();
  const { isOffline } = useAppStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const navItems = [
    { to: '/', icon: MapPin, label: 'Map' },
    { to: '/analytics', icon: BarChart2, label: 'Analytics' },
    { to: '/chatbot', icon: MessageSquare, label: 'AI Assistant' },
    { to: '/report', icon: AlertTriangle, label: 'Report Issue' },
    { to: '/track', icon: Search, label: 'Track Complaint' },
  ];

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <div className="flex flex-col h-full min-h-screen">
      {/* Header */}
      <header className="bg-brand-800 text-white shadow-lg z-50 relative">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 font-bold text-lg">
            <span className="text-2xl">🛣️</span>
            <span>RoadWatch</span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map(({ to, icon: Icon, label }) => (
              <Link key={to} to={to}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors
                  ${isActive(to) ? 'bg-brand-600 text-white' : 'text-blue-100 hover:bg-brand-700'}`}>
                <Icon size={15} />
                {label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            {isOffline && (
              <span className="flex items-center gap-1 text-xs bg-orange-500 px-2 py-1 rounded-full">
                <WifiOff size={12} /> Offline
              </span>
            )}
            {!isOffline && (
              <span className="hidden md:flex items-center gap-1 text-xs text-blue-200">
                <Wifi size={12} /> Online
              </span>
            )}
            {isAuthenticated ? (
              <div className="flex items-center gap-2">
                <span className="hidden md:flex items-center gap-1 text-sm text-blue-100">
                  {user?.role === 'admin' ? <Shield size={14} /> : <User size={14} />}
                  {user?.name?.split(' ')[0]}
                </span>
                <button onClick={() => navigate(user?.role === 'admin' ? '/admin' : '/engineer')}
                  className="hidden md:block px-2 py-1 text-xs bg-brand-600 hover:bg-brand-500 rounded transition-colors">
                  Dashboard
                </button>
                <button onClick={() => { logout(); navigate('/'); }}
                  className="flex items-center gap-1 px-2 py-1 text-xs bg-red-600 hover:bg-red-500 rounded transition-colors">
                  <LogOut size={12} /> Logout
                </button>
              </div>
            ) : (
              <Link to="/login"
                className="flex items-center gap-1 px-3 py-1.5 text-sm bg-brand-600 hover:bg-brand-500 rounded transition-colors">
                <LogIn size={14} /> Login
              </Link>
            )}
            <button className="md:hidden p-1" onClick={() => setMenuOpen(!menuOpen)}>
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden bg-brand-900 border-t border-brand-700 px-4 py-2">
            {navItems.map(({ to, icon: Icon, label }) => (
              <Link key={to} to={to} onClick={() => setMenuOpen(false)}
                className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium
                  ${isActive(to) ? 'bg-brand-600 text-white' : 'text-blue-100'}`}>
                <Icon size={16} /> {label}
              </Link>
            ))}
            {isAuthenticated && (
              <Link to={user?.role === 'admin' ? '/admin' : '/engineer'} onClick={() => setMenuOpen(false)}
                className="flex items-center gap-2 px-3 py-2 rounded-md text-sm text-blue-100">
                <User size={16} /> Dashboard
              </Link>
            )}
          </div>
        )}
      </header>

      {/* Main content */}
      <main className="flex-1 overflow-hidden">
        <Outlet />
      </main>

      {/* Bottom nav (mobile) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40 flex">
        {navItems.slice(0, 4).map(({ to, icon: Icon, label }) => (
          <Link key={to} to={to}
            className={`flex-1 flex flex-col items-center justify-center py-2 text-xs
              ${isActive(to) ? 'text-brand-700 font-medium' : 'text-gray-500'}`}>
            <Icon size={20} />
            <span className="mt-0.5">{label}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
}
