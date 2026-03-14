import { useState, useEffect } from 'react';
import { getAdminResultTemplates } from '../../services/api';
import { getStatusInfo } from '../../utils/statusUtils';
import AdminNav from './AdminNav';
import './AdminLayout.css';

export default function AdminTemplates() {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const data = await getAdminResultTemplates();
      setTemplates(data);
    } catch (err) {
      console.error('Failed to load templates:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-page container">
      <h1>ניהול תבניות תוצאה</h1>
      <p>תבניות הודעות ותוצאות המוצגות למשתמשים</p>
      <AdminNav />

      {loading ? (
        <p>טוען...</p>
      ) : (
        <div className="card admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>קוד תבנית</th>
                <th>סטטוס</th>
                <th>כותרת (עברית)</th>
                <th>הסבר</th>
                <th>המלצה</th>
                <th>ודאות</th>
              </tr>
            </thead>
            <tbody>
              {templates.map((t) => {
                const statusInfo = getStatusInfo(t.statusCode);
                return (
                  <tr key={t.id}>
                    <td><code>{t.templateCode}</code></td>
                    <td>
                      <span className={`badge ${statusInfo.badgeClass}`}>
                        {statusInfo.icon} {statusInfo.label}
                      </span>
                    </td>
                    <td><strong>{t.headlineHe}</strong></td>
                    <td style={{ fontSize: '0.8125rem', maxWidth: 300 }}>
                      {t.explanationTemplateHe}
                    </td>
                    <td style={{ fontSize: '0.8125rem', maxWidth: 250 }}>
                      {t.recommendationTemplateHe}
                    </td>
                    <td>
                      <code>{t.confidenceLevel}</code>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
