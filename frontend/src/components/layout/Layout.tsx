import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { MapPin, BarChart2, MessageSquare, AlertTriangle, Search,
         LogIn, LogOut, User, Shield, Menu, X, WifiOff } from 'lucide-react';
import { useState } from 'react';
import { useAuthStore } from '../../store/auth';
import { useAppStore } from '../../store/app';

// Scroll every page back to top on route change
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    // Only scroll the main page-scroll container, not map/chat pages
    const el = document.getElementById('main-scroll');
    if (el) el.scrollTop = 0;
  }, [pathname]);
  return null;
}

// Pages that manage their own full-height viewport layout
const FULLSCREEN_ROUTES = ['/', '/chatbot'];

export default function Layout() {
  const { user, isAuthenticated, logout } = useAuthStore();
  const { isOffline } = useAppStore();
  const navigate   = useNavigate();
  const location   = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const isFullscreen = FULLSCREEN_ROUTES.includes(location.pathname)
    || location.pathname.startsWith('/road/'); // road detail is not fullscreen but uses its own scroll

  const navItems = [
    { to: '/',          icon: MapPin,         label: 'Map'            },
    { to: '/analytics', icon: BarChart2,       label: 'Analytics'      },
    { to: '/chatbot',   icon: MessageSquare,   label: 'AI Assistant'   },
    { to: '/report',    icon: AlertTriangle,   label: 'Report Issue'   },
    { to: '/track',     icon: Search,          label: 'Track Complaint' },
  ];

  const isActive = (path: string) =>
    path === '/' ? location.pathname === '/' : location.pathname.startsWith(path);

  return (
    <div className="flex flex-col h-full">
      <ScrollToTop />

      {/* ── Header ── */}
      <header className="bg-brand-800 text-white shadow-lg z-50 relative shrink-0">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between gap-3">
          <Link to="/" className="flex items-center gap-2 font-bold text-lg shrink-0">
            <span className="text-2xl">🛣️</span>
            <span className="hidden sm:inline">RoadWatch</span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1 flex-1 justify-center">
            {navItems.map(({ to, icon: Icon, label }) => (
              <Link key={to} to={to}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-150
                  ${isActive(to)
                    ? 'bg-brand-600 text-white shadow-sm'
                    : 'text-blue-100 hover:bg-brand-700 hover:text-white'}`}>
                <Icon size={15} />{label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2 shrink-0">
            {isOffline && (
              <span className="flex items-center gap-1 text-xs bg-orange-500/90 px-2 py-0.5 rounded-full">
                <WifiOff size={11} /> Offline
              </span>
            )}
            {isAuthenticated ? (
              <div className="flex items-center gap-1.5">
                <button onClick={() => navigate(user?.role === 'admin' ? '/admin' : '/engineer')}
                  className="hidden md:flex items-center gap-1.5 px-2.5 py-1 text-xs bg-brand-600 hover:bg-brand-500 rounded-md transition-colors">
                  {user?.role === 'admin' ? <Shield size={12} /> : <User size={12} />}
                  {user?.name?.split(' ')[0]}
                </button>
                <button onClick={() => { logout(); navigate('/'); }}
                  className="flex items-center gap-1 px-2.5 py-1 text-xs bg-red-600/80 hover:bg-red-500 rounded-md transition-colors">
                  <LogOut size={12} /> <span className="hidden sm:inline">Logout</span>
                </button>
              </div>
            ) : (
              <Link to="/login"
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-brand-600 hover:bg-brand-500 rounded-md transition-colors">
                <LogIn size={14} /> Login
              </Link>
            )}
            <button className="md:hidden p-1.5 rounded hover:bg-brand-700 transition-colors"
              onClick={() => setMenuOpen(!menuOpen)}>
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile dropdown menu */}
        {menuOpen && (
          <div className="md:hidden absolute top-full left-0 right-0 bg-brand-900 border-t border-brand-700 shadow-xl z-50">
            <div className="px-3 py-2 space-y-0.5">
              {navItems.map(({ to, icon: Icon, label }) => (
                <Link key={to} to={to} onClick={() => setMenuOpen(false)}
                  className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                    ${isActive(to) ? 'bg-brand-600 text-white' : 'text-blue-100 hover:bg-brand-700'}`}>
                  <Icon size={16} />{label}
                </Link>
              ))}
              {isAuthenticated && (
                <Link to={user?.role === 'admin' ? '/admin' : '/engineer'}
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm text-blue-100 hover:bg-brand-700 transition-colors">
                  {user?.role === 'admin' ? <Shield size={16} /> : <User size={16} />}
                  Dashboard ({user?.name?.split(' ')[0]})
                </Link>
              )}
            </div>
          </div>
        )}
      </header>

      {/* ── Main content ──
          Map/Chat pages use h-full + their own internal scroll.
          All other pages use overflow-y-auto so content scrolls naturally. ── */}
      <main
        id="main-scroll"
        className={`flex-1 min-h-0 ${
          FULLSCREEN_ROUTES.includes(location.pathname)
            ? 'overflow-hidden'          // map & chat manage their own height
            : 'overflow-y-auto scroll-panel' // every other page scrolls here
        }`}>
        <Outlet />
      </main>

      {/* ── Mobile bottom nav ── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40 flex safe-pb shadow-[0_-1px_6px_rgba(0,0,0,0.06)]">
        {navItems.slice(0, 5).map(({ to, icon: Icon, label }) => (
          <Link key={to} to={to}
            className={`flex-1 flex flex-col items-center justify-center py-2 text-[10px] font-medium transition-colors
              ${isActive(to) ? 'text-brand-700' : 'text-gray-400 hover:text-gray-600'}`}>
            <Icon size={19} className="mb-0.5" />
            {label.split(' ')[0]}
          </Link>
        ))}
      </nav>
    </div>
  );
}
