import { useState, useEffect } from 'react';
import { getAdminQuestions } from '../../services/api';
import AdminNav from './AdminNav';
import './AdminLayout.css';

export default function AdminQuestions() {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const data = await getAdminQuestions();
      setQuestions(data);
    } catch (err) {
      console.error('Failed to load questions:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-page container">
      <h1>ניהול שאלות</h1>
      <p>רשימת כל השאלות במערכת (כולל אפשרויות תשובה וחוקי נראות)</p>
      <AdminNav />

      {loading ? (
        <p>טוען...</p>
      ) : (
        <div className="card admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>#</th>
                <th>מפתח</th>
                <th>שאלה (עברית)</th>
                <th>סוג</th>
                <th>חובה</th>
                <th>קבוצה</th>
                <th>אפשרויות</th>
                <th>חוקי נראות</th>
                <th>סטטוס</th>
              </tr>
            </thead>
            <tbody>
              {questions.map((q) => (
                <tr key={q.id}>
                  <td>{q.displayOrder}</td>
                  <td><code>{q.questionKey}</code></td>
                  <td><strong>{q.labelHe}</strong></td>
                  <td><code>{q.answerType}</code></td>
                  <td>{q.isRequired ? '✓' : '—'}</td>
                  <td><code>{q.groupKey}</code></td>
                  <td>
                    {q.options && q.options.length > 0 ? (
                      <span className="badge badge-info">
                        {q.options.length} אפשרויות
                      </span>
                    ) : (
                      '—'
                    )}
                  </td>
                  <td>
                    {q.visibilityRules && q.visibilityRules.length > 0 ? (
                      <span className="badge badge-warning">
                        {q.visibilityRules.length} חוקים
                      </span>
                    ) : (
                      '—'
                    )}
                  </td>
                  <td>
                    <span className={`badge ${q.isActive ? 'badge-success' : 'badge-muted'}`}>
                      {q.isActive ? 'פעיל' : 'לא פעיל'}
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
