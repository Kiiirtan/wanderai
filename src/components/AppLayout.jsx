import { useState } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutGrid,
  FileText,
  Compass,
  Bookmark,
  Settings,
  ChevronDown,
  LogOut,
  Menu,
  X,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutGrid },
  { path: '/itineraries', label: 'Itineraries', icon: FileText },
  { path: '/explore', label: 'Explore', icon: Compass },
  { path: '/saved', label: 'Saved', icon: Bookmark },
  { path: '/settings', label: 'Settings', icon: Settings },
];

export default function AppLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="app-container">
      {/* Mobile Toggle Button */}
      <button
        className="mobile-nav-toggle"
        onClick={() => setMobileOpen(!mobileOpen)}
        aria-label="Toggle navigation"
      >
        {mobileOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Backdrop for Mobile */}
      <div
        className={`sidebar-backdrop ${mobileOpen ? 'visible' : ''}`}
        onClick={() => setMobileOpen(false)}
      />

      {/* Left Sidebar */}
      <aside className={`sidebar ${mobileOpen ? 'open' : ''}`}>
        {/* Brand Header */}
        <NavLink to="/dashboard" className="sidebar-brand">
          <div className="sidebar-brand-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
                fill="#d96b4f"
                opacity="0.85"
              />
            </svg>
          </div>
          <span className="sidebar-brand-title">
            Wander<span>AI</span>
          </span>
        </NavLink>

        {/* Navigation Items */}
        <nav className="sidebar-menu">
          {navItems.map(({ path, label, icon: Icon }) => (
            <NavLink
              key={path}
              to={path}
              className={({ isActive }) =>
                `sidebar-item ${isActive ? 'active' : ''}`
              }
              onClick={() => setMobileOpen(false)}
            >
              <Icon size={18} strokeWidth={2} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        {/* User Profile Pill at Bottom */}
        <div className="sidebar-footer" style={{ position: 'relative' }}>
          <div
            className="user-profile-pill"
            onClick={() => setUserMenuOpen(!userMenuOpen)}
          >
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: '50%',
                background: '#e2e8f0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.8125rem',
                fontWeight: 700,
                color: '#334155',
                overflow: 'hidden',
              }}
            >
              {user?.full_name ? (
                user.full_name[0].toUpperCase()
              ) : (
                <img
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
                  alt="avatar"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              )}
            </div>
            <div className="user-info">
              <div className="user-name">
                {user?.full_name || 'User Profile'}
              </div>
              <div className="user-handle">
                {user?.username ? `@${user.username}` : '@wanderai.com'}
              </div>
            </div>
            <ChevronDown size={14} color="#94a3b8" />
          </div>

          {/* User Popover Menu */}
          {userMenuOpen && (
            <div
              style={{
                position: 'absolute',
                bottom: '100%',
                left: 10,
                right: 10,
                marginBottom: 8,
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: 12,
                boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)',
                padding: 6,
                zIndex: 60,
              }}
            >
              <div
                style={{
                  padding: '8px 12px',
                  fontSize: '0.75rem',
                  color: '#64748b',
                  borderBottom: '1px solid #f1f5f9',
                }}
              >
                Signed in as <strong>{user?.email || 'traveler@wanderai.com'}</strong>
              </div>
              <button
                className="sidebar-item"
                onClick={handleLogout}
                style={{ color: '#dc2626', marginTop: 4 }}
              >
                <LogOut size={16} />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* Main Workspace Wrapper */}
      <main className="main-wrapper">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.18 }}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
