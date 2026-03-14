import { useState, useEffect } from 'react';
import { Settings } from 'lucide-react';
import { getAdminStats } from '../../services/api';
import AdminNav from './AdminNav';
import './AdminLayout.css';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const data = await getAdminStats();
      setStats(data);
    } catch (err) {
      console.error('Failed to load stats:', err);
    } finally {
      setLoading(false);
    }
  };

  const statCards = stats
    ? [
        { label: 'מודולים פעילים', value: stats.activeModules },
        { label: 'סה״כ מודולים', value: stats.totalModules },
        { label: 'שאלות', value: stats.totalQuestions },
        { label: 'חוקים פעילים', value: stats.activeRules },
        { label: 'סה״כ חוקים', value: stats.totalRules },
        { label: 'תבניות תוצאה', value: stats.totalTemplates },
        { label: 'גרסאות חוקים', value: stats.totalRuleSets },
        { label: 'גרסאות מפורסמות', value: stats.publishedRuleSets },
      ]
    : [];

  return (
    <div className="admin-page container">
      <h1>
        <Settings size={28} style={{ verticalAlign: 'middle', marginLeft: 8 }} />
        הגדרות מנהל
      </h1>
      <p>ניהול מודולים, שאלות, חוקים ותבניות תוצאה</p>

      <AdminNav />

      {loading ? (
        <p style={{ textAlign: 'center', color: 'var(--color-text-muted)' }}>טוען נתונים...</p>
      ) : (
        <div className="admin-stats-grid">
          {statCards.map((s, i) => (
            <div key={i} className="card admin-stat-card">
              <div className="admin-stat-value">{s.value}</div>
              <div className="admin-stat-label">{s.label}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
