import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogIn, Mail } from 'lucide-react';
import { login } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import './AuthPages.css';

export default function LoginPage() {
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
      const data = await login(email);
      loginUser(data.user, data.token);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'שגיאה בהתחברות');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page container">
      <div className="auth-card card">
        <div className="auth-header">
          <LogIn size={32} className="auth-icon" />
          <h1>התחברות</h1>
          <p>הזינו את כתובת האימייל שלכם</p>
        </div>

        <form onSubmit={handleSubmit}>
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
            {loading ? 'מתחבר...' : 'התחבר'}
          </button>
        </form>

        <div className="auth-hint">
          <p>
            לבדיקה: <code dir="ltr">hannah@example.com</code> (משתמש) או{' '}
            <code dir="ltr">admin@example.com</code> (מנהל)
          </p>
        </div>

        <div className="auth-footer">
          <p>
            אין לכם חשבון? <Link to="/register">הרשמו כאן</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
