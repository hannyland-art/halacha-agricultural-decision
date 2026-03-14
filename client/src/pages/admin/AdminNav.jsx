import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Boxes, HelpCircle, Scale, FileText, Mail } from 'lucide-react';

const links = [
  { to: '/admin', label: 'לוח בקרה', icon: <LayoutDashboard size={16} />, exact: true },
  { to: '/admin/modules', label: 'מודולים', icon: <Boxes size={16} /> },
  { to: '/admin/questions', label: 'שאלות', icon: <HelpCircle size={16} /> },
  { to: '/admin/rules', label: 'חוקים', icon: <Scale size={16} /> },
  { to: '/admin/templates', label: 'תבניות תוצאה', icon: <FileText size={16} /> },
  { to: '/admin/contact', label: 'צור קשר', icon: <Mail size={16} /> },
];

export default function AdminNav() {
  const location = useLocation();

  return (
    <nav className="admin-nav">
      {links.map((link) => {
        const isActive = link.exact
          ? location.pathname === link.to
          : location.pathname.startsWith(link.to);
        return (
          <Link
            key={link.to}
            to={link.to}
            className={`admin-nav-link ${isActive ? 'active' : ''}`}
          >
            {link.icon}
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
