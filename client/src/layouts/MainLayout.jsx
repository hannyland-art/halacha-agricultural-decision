import { Outlet, Link } from 'react-router-dom';
import TopBar from '../components/TopBar';
import './MainLayout.css';

export default function MainLayout() {
  return (
    <div className="layout">
      <TopBar />

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
