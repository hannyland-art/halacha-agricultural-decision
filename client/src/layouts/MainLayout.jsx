import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Leaf, Home, TreePine, Settings, LogIn, LogOut, User, Menu, X, Mail } from 'lucide-react';
import { useState } from 'react';
import './MainLayout.css';

export default function MainLayout() {
  const { user, logoutUser } = useAuth();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path) => location.pathname === path;
  const isAdmin = user?.role === 'admin';

  return (
    <div className="layout">
      {/* Header */}
      <header className="header">
        <div className="container header-inner">
          <Link to="/" className="logo">
            <Leaf size={28} />
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
              onClick={() => setMobileMenuOpen(false)}
            >
              <Home size={18} />
              דף הבית
            </Link>
            <Link
              to="/check"
              className={`nav-link ${isActive('/check') ? 'active' : ''}`}
              onClick={() => setMobileMenuOpen(false)}
            >
              <TreePine size={18} />
              בדיקה חדשה
            </Link>

            {user && (
              <Link
                to="/my-plants"
                className={`nav-link ${isActive('/my-plants') ? 'active' : ''}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                <Leaf size={18} />
                הצמחים שלי
              </Link>
            )}

            <Link
              to="/contact"
              className={`nav-link ${isActive('/contact') ? 'active' : ''}`}
              onClick={() => setMobileMenuOpen(false)}
            >
              <Mail size={18} />
              צור קשר
            </Link>

            {isAdmin && (
              <Link
                to="/admin"
                className={`nav-link ${location.pathname.startsWith('/admin') ? 'active' : ''}`}
                onClick={() => setMobileMenuOpen(false)}
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
                  onClick={() => { logoutUser(); setMobileMenuOpen(false); }}
                >
                  <LogOut size={16} />
                  יציאה
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="btn btn-secondary btn-sm"
                onClick={() => setMobileMenuOpen(false)}
              >
                <LogIn size={16} />
                התחברות
              </Link>
            )}
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="main-content">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="footer">
        <div className="container footer-inner">
          <div className="footer-disclaimer">
            <p>
              ⚠️ המידע באתר נועד לסיוע כללי בלבד ואינו מהווה פסק הלכה.
              במקרה מעשי מומלץ להתייעץ עם רב.
            </p>
          </div>
          <div className="footer-links">
            <Link to="/about">אודות</Link>
            <span className="footer-divider">|</span>
            <Link to="/contact">צור קשר</Link>
            <span className="footer-divider">|</span>
            <Link to="/">דף הבית</Link>
          </div>
          <p className="footer-copy">© 2026 מצוות התלויות בארץ — כלי עזר הלכתי</p>
        </div>
      </footer>
    </div>
  );
}
