import { useState, useEffect } from 'react';
import { getAdminModules } from '../../services/api';
import AdminNav from './AdminNav';
import './AdminLayout.css';

export default function AdminModules() {
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const data = await getAdminModules();
      setModules(data);
    } catch (err) {
      console.error('Failed to load modules:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-page container">
      <h1>ניהול מודולים</h1>
      <p>רשימת כל המודולים במערכת</p>
      <AdminNav />

      {loading ? (
        <p>טוען...</p>
      ) : (
        <div className="card admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>מזהה</th>
                <th>קוד</th>
                <th>שם</th>
                <th>תיאור</th>
                <th>סטטוס</th>
              </tr>
            </thead>
            <tbody>
              {modules.map((m) => (
                <tr key={m.id}>
                  <td>{m.id}</td>
                  <td><code>{m.code}</code></td>
                  <td><strong>{m.name}</strong></td>
                  <td>{m.description}</td>
                  <td>
                    <span className={`badge ${m.isActive ? 'badge-success' : 'badge-muted'}`}>
                      {m.isActive ? 'פעיל' : 'לא פעיל'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
