import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Leaf, Home, TreePine, Settings, LogIn, LogOut, User, Menu, X, Mail } from 'lucide-react';
import { useState } from 'react';
import './TopBar.css';

export default function TopBar() {
  const { user, logoutUser } = useAuth();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path) => location.pathname === path;
  const isAdmin = user?.role === 'admin';

  const closeMenu = () => setMobileMenuOpen(false);

  return (
    <header className="header">
      <div className="container header-inner">
        <Link to="/" className="logo" onClick={closeMenu}>
          <div className="brand-badge">🌿</div>
          <span className="logo-text">מצוות התלויות בארץ</span>
        </Link>

        <button
          className="mobile-menu-btn"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="תפריט"
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        <nav className={`nav ${mobileMenuOpen ? 'nav-open' : ''}`}>
          <Link
            to="/"
            className={`nav-link ${isActive('/') ? 'active' : ''}`}
            onClick={closeMenu}
          >
            <Home size={18} />
            דף הבית
          </Link>
          <Link
            to="/check"
            className={`nav-link ${isActive('/check') ? 'active' : ''}`}
            onClick={closeMenu}
          >
            <TreePine size={18} />
            בדיקה חדשה
          </Link>

          {user && (
            <Link
              to="/my-plants"
              className={`nav-link ${isActive('/my-plants') ? 'active' : ''}`}
              onClick={closeMenu}
            >
              <Leaf size={18} />
              צמחים
            </Link>
          )}

          <Link
            to="/contact"
            className={`nav-link ${isActive('/contact') ? 'active' : ''}`}
            onClick={closeMenu}
          >
            <Mail size={18} />
            צור קשר
          </Link>

          {isAdmin && (
            <Link
              to="/admin"
              className={`nav-link ${location.pathname.startsWith('/admin') ? 'active' : ''}`}
              onClick={closeMenu}
            >
              <Settings size={18} />
              הגדרות מנהל
            </Link>
          )}

          <div className="nav-separator" />

          {user ? (
            <div className="nav-user">
              <span className="nav-user-name">
                <User size={16} />
                {user.fullName}
              </span>
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => { logoutUser(); closeMenu(); }}
              >
                <LogOut size={16} />
                יציאה
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="btn btn-secondary btn-sm"
              onClick={closeMenu}
            >
              <LogIn size={16} />
              התחברות
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
