import { useState, useEffect } from 'react';
import { Save, Loader2, CheckCircle2 } from 'lucide-react';
import { getAdminContactSettings, updateAdminContactSettings } from '../../services/api';
import AdminNav from './AdminNav';
import './AdminLayout.css';
import './AdminContactSettings.css';

const FIELD_META = [
  { key: 'email', label: 'אימייל', type: 'email', placeholder: 'info@example.co.il', dir: 'ltr' },
  { key: 'phone', label: 'טלפון', type: 'tel', placeholder: '03-1234567', dir: 'ltr' },
  { key: 'whatsapp', label: 'WhatsApp', type: 'tel', placeholder: '972-50-1234567', dir: 'ltr' },
  { key: 'address', label: 'כתובת', type: 'text', placeholder: 'רחוב, עיר' },
  { key: 'officeHours', label: 'שעות פעילות', type: 'text', placeholder: 'ימים א׳–ה׳, 09:00–17:00' },
  { key: 'additionalNotes', label: 'הערות נוספות', type: 'textarea', placeholder: 'מידע נוסף שיוצג בדף צור קשר...' },
];

export default function AdminContactSettings() {
  const [form, setForm] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const data = await getAdminContactSettings();
      setForm(data);
    } catch (err) {
      console.error('Failed to load contact settings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  };

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    try {
      const updated = await updateAdminContactSettings(form);
      setForm(updated);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error('Failed to save contact settings:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="admin-page container">
      <h1>הגדרות צור קשר</h1>
      <p>פרטי הקשר שמוצגים בדף צור קשר הציבורי</p>
      <AdminNav />

      {loading ? (
        <p>טוען...</p>
      ) : (
        <div className="card admin-contact-form">
          {FIELD_META.map(({ key, label, type, placeholder, dir }) => (
            <div key={key} className="form-group">
              <label className="form-label">{label}</label>
              {type === 'textarea' ? (
                <textarea
                  className="form-input"
                  rows={3}
                  value={form[key] || ''}
                  onChange={(e) => handleChange(key, e.target.value)}
                  placeholder={placeholder}
                />
              ) : (
                <input
                  type={type}
                  className="form-input"
                  value={form[key] || ''}
                  onChange={(e) => handleChange(key, e.target.value)}
                  placeholder={placeholder}
                  dir={dir || 'rtl'}
                />
              )}
            </div>
          ))}

          <div className="admin-contact-actions">
            <button
              className="btn btn-primary"
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? (
                <>
                  <Loader2 size={16} className="spinner" />
                  שומר...
                </>
              ) : (
                <>
                  <Save size={16} />
                  שמור שינויים
                </>
              )}
            </button>
            {saved && (
              <span className="admin-contact-saved">
                <CheckCircle2 size={16} />
                נשמר בהצלחה
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
