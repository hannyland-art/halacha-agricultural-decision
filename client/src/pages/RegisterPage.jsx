import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserPlus, Mail, User } from 'lucide-react';
import { register } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import './AuthPages.css';

export default function RegisterPage() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { loginUser } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await register(fullName, email);
      loginUser(data.user, data.token);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'שגיאה בהרשמה');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page container">
      <div className="auth-card card">
        <div className="auth-header">
          <UserPlus size={32} className="auth-icon" />
          <h1>הרשמה</h1>
          <p>צרו חשבון כדי לשמור צמחים ולעקוב אחריהם</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">
              <User size={16} style={{ display: 'inline', verticalAlign: 'middle', marginLeft: 6 }} />
              שם מלא
            </label>
            <input
              type="text"
              className="form-input"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="לדוגמה: ישראל ישראלי"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">
              <Mail size={16} style={{ display: 'inline', verticalAlign: 'middle', marginLeft: 6 }} />
              אימייל
            </label>
            <input
              type="email"
              className="form-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@email.com"
              required
              dir="ltr"
            />
          </div>

          {error && <div className="auth-error">{error}</div>}

          <button type="submit" className="btn btn-primary btn-lg auth-submit" disabled={loading}>
            {loading ? 'נרשם...' : 'הרשמה'}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            יש לכם כבר חשבון? <Link to="/login">התחברו כאן</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
