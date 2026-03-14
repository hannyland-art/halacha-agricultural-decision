import { useState, useEffect } from 'react';
import { Mail, Phone, MapPin, Clock, MessageCircle, ExternalLink, Send } from 'lucide-react';
import { getContactInfo } from '../services/api';
import './ContactPage.css';

export default function ContactPage() {
  const [contact, setContact] = useState(null);
  const [loading, setLoading] = useState(true);

  // Simple contact form state (UI only for MVP)
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formMessage, setFormMessage] = useState('');
  const [formSent, setFormSent] = useState(false);

  useEffect(() => {
    loadContact();
  }, []);

  const loadContact = async () => {
    try {
      const data = await getContactInfo();
      setContact(data);
    } catch (err) {
      console.error('Failed to load contact info:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    // Mock – in production this would POST to server
    setFormSent(true);
    setTimeout(() => {
      setFormName('');
      setFormEmail('');
      setFormMessage('');
    }, 300);
  };

  if (loading) {
    return (
      <div className="contact-page container">
        <p style={{ textAlign: 'center', padding: 48, color: 'var(--color-text-muted)' }}>טוען פרטי קשר...</p>
      </div>
    );
  }

  return (
    <div className="contact-page container">
      <div className="contact-header">
        <Mail size={48} className="contact-header-icon" />
        <h1>צור קשר</h1>
        <p>יש לכם שאלה, הצעה או בעיה? נשמח לשמוע מכם.</p>
      </div>

      <div className="contact-layout">
        {/* Contact details */}
        <div className="contact-details">
          {contact?.email && (
            <div className="card contact-detail-card">
              <div className="contact-detail-icon"><Mail size={22} /></div>
              <div className="contact-detail-body">
                <h3>אימייל</h3>
                <a href={`mailto:${contact.email}`} dir="ltr">{contact.email}</a>
              </div>
            </div>
          )}

          {contact?.phone && (
            <div className="card contact-detail-card">
              <div className="contact-detail-icon"><Phone size={22} /></div>
              <div className="contact-detail-body">
                <h3>טלפון</h3>
                <a href={`tel:${contact.phone.replace(/[^0-9+]/g, '')}`} dir="ltr">{contact.phone}</a>
              </div>
            </div>
          )}

          {contact?.whatsapp && (
            <div className="card contact-detail-card">
              <div className="contact-detail-icon"><MessageCircle size={22} /></div>
              <div className="contact-detail-body">
                <h3>WhatsApp</h3>
                <a
                  href={`https://wa.me/${contact.whatsapp.replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  dir="ltr"
                >
                  {contact.whatsapp}
                  <ExternalLink size={12} style={{ marginRight: 4, verticalAlign: 'middle' }} />
                </a>
              </div>
            </div>
          )}

          {contact?.address && (
            <div className="card contact-detail-card">
              <div className="contact-detail-icon"><MapPin size={22} /></div>
              <div className="contact-detail-body">
                <h3>כתובת</h3>
                <p>{contact.address}</p>
              </div>
            </div>
          )}

          {contact?.officeHours && (
            <div className="card contact-detail-card">
              <div className="contact-detail-icon"><Clock size={22} /></div>
              <div className="contact-detail-body">
                <h3>שעות פעילות</h3>
                <p>{contact.officeHours}</p>
              </div>
            </div>
          )}

          {contact?.additionalNotes && (
            <div className="contact-notes card">
              <p>{contact.additionalNotes}</p>
            </div>
          )}
        </div>

        {/* Contact form */}
        <div className="contact-form-section">
          <div className="card contact-form-card">
            <h2>שלחו לנו הודעה</h2>
            {formSent ? (
              <div className="contact-form-success">
                <Mail size={32} />
                <p>ההודעה נשלחה בהצלחה!</p>
                <p className="contact-form-success-sub">נחזור אליכם בהקדם.</p>
                <button className="btn btn-secondary" onClick={() => setFormSent(false)}>
                  שלחו הודעה נוספת
                </button>
              </div>
            ) : (
              <form onSubmit={handleFormSubmit}>
                <div className="form-group">
                  <label className="form-label">שם</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="השם שלכם"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">אימייל</label>
                  <input
                    type="email"
                    className="form-input"
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    placeholder="email@example.com"
                    required
                    dir="ltr"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">הודעה</label>
                  <textarea
                    className="form-input"
                    rows={5}
                    value={formMessage}
                    onChange={(e) => setFormMessage(e.target.value)}
                    placeholder="כתבו כאן את ההודעה שלכם..."
                    required
                  />
                </div>
                <button type="submit" className="btn btn-primary btn-lg contact-submit-btn">
                  <Send size={18} />
                  שלח הודעה
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
