import { useState, useEffect } from 'react';
import { getAdminRules, getAdminRuleSets } from '../../services/api';
import AdminNav from './AdminNav';
import './AdminLayout.css';

export default function AdminRules() {
  const [rules, setRules] = useState([]);
  const [ruleSets, setRuleSets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [rulesData, ruleSetsData] = await Promise.all([
        getAdminRules(),
        getAdminRuleSets(),
      ]);
      setRules(rulesData);
      setRuleSets(ruleSetsData);
    } catch (err) {
      console.error('Failed to load rules:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-page container">
      <h1>ניהול חוקים</h1>
      <p>חוקי ההחלטה המוגדרים במערכת</p>
      <AdminNav />

      {loading ? (
        <p>טוען...</p>
      ) : (
        <>
          {/* Rule Sets */}
          <h2 style={{ fontSize: '1.25rem', marginBottom: 16 }}>גרסאות חוקים</h2>
          <div className="card admin-table-container" style={{ marginBottom: 32 }}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>מזהה</th>
                  <th>גרסה</th>
                  <th>סטטוס</th>
                  <th>נוצר</th>
                  <th>פורסם</th>
                </tr>
              </thead>
              <tbody>
                {ruleSets.map((rs) => (
                  <tr key={rs.id}>
                    <td>{rs.id}</td>
                    <td><code>{rs.version}</code></td>
                    <td>
                      <span className={`badge ${rs.status === 'published' ? 'badge-success' : 'badge-muted'}`}>
                        {rs.status === 'published' ? 'מפורסם' : rs.status}
                      </span>
                    </td>
                    <td>{new Date(rs.createdAt).toLocaleDateString('he-IL')}</td>
                    <td>{rs.publishedAt ? new Date(rs.publishedAt).toLocaleDateString('he-IL') : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Rules */}
          <h2 style={{ fontSize: '1.25rem', marginBottom: 16 }}>חוקים</h2>
          <div className="card admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>עדיפות</th>
                  <th>תיאור</th>
                  <th>גרסה</th>
                  <th>תנאים</th>
                  <th>פעולות</th>
                  <th>סטטוס</th>
                </tr>
              </thead>
              <tbody>
                {rules.sort((a, b) => a.priority - b.priority).map((r) => (
                  <tr key={r.id}>
                    <td><strong>{r.priority}</strong></td>
                    <td>{r.description}</td>
                    <td><code>{r.ruleSetVersion}</code></td>
                    <td>
                      <div className="admin-json-preview">
                        {JSON.stringify(r.conditionsJson, null, 2)}
                      </div>
                    </td>
                    <td>
                      <div className="admin-json-preview">
                        {JSON.stringify(r.actionsJson, null, 2)}
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${r.isActive ? 'badge-success' : 'badge-muted'}`}>
                        {r.isActive ? 'פעיל' : 'לא פעיל'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
