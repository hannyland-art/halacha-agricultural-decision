import { Link } from 'react-router-dom';
import { TreePine, Route, Leaf, MessageSquare, ChevronLeft, Clock } from 'lucide-react';
import './HomePage.css';

const features = [
  {
    icon: <TreePine size={32} />,
    title: 'שאלון מונחה',
    desc: 'ענו על שאלות פשוטות וקבלו הערכה ראשונית לגבי מצב העץ.',
  },
  {
    icon: <Route size={32} />,
    title: 'מסלול החלטה ויזואלי',
    desc: 'ראו בדיוק איך המערכת הגיעה לתוצאה, צעד אחר צעד.',
  },
  {
    icon: <Leaf size={32} />,
    title: 'שמירת צמחים',
    desc: 'שמרו צמחים ועקבו אחרי המצב ההלכתי שלהם לאורך זמן.',
  },
  {
    icon: <MessageSquare size={32} />,
    title: 'עזרה עם AI',
    desc: 'תארו את הצמח בחופשיות והמערכת תמלא את הפרטים עבורכם.',
  },
];

const modules = [
  {
    code: 'orlah',
    name: 'עורלה',
    desc: 'בדיקה הלכתית בסיסית לעצי פרי ולשלבי מניין עורלה',
    active: true,
  },
  {
    code: 'kilayim',
    name: 'כלאיים',
    desc: 'מודול עתידי לבדיקת כלאי אילן וכלאי זרעים',
    active: false,
  },
];

export default function HomePage() {
  return (
    <div className="home-page">
      {/* Hero */}
      <section className="hero">
        <div className="container">
          <div className="hero-content">
            <h1 className="hero-title">
              פתרון חכם לבדיקות הלכתיות
              <br />
              בצמחים ועצי פרי
            </h1>
            <p className="hero-subtitle">
              בדקו עורלה בצורה פשוטה, קבלו תוצאה ברורה, וראו איך המערכת הגיעה אליה.
            </p>
           
          </div>
          <div className="hero-visual">
            <div className="hero-illustration">
              <img src="/grove.png" alt="מטע" className="hero-grove-img" />
            </div>
          </div>
        </div>
      </section>

      {/* Modules */}
      <section className="modules-section">
        <div className="container">
          <h2 className="section-title">מודולים זמינים</h2>
          <div className="modules-grid">
            {modules.map((m) => (
              <div key={m.code} className={`card module-card ${!m.active ? 'module-inactive' : ''}`}>
                <div className="module-header">
                  <h3 className="module-name">{m.name}</h3>
                  {m.active ? (
                    <span className="badge badge-success">פעיל</span>
                  ) : (
                    <span className="badge badge-muted">
                      <Clock size={14} />
                      בקרוב
                    </span>
                  )}
                </div>
                <p className="module-desc">{m.desc}</p>
                {m.active && (
                  <div className="module-actions">
                    <Link to={`/wizard/${m.code}`} className="btn btn-primary btn-sm">
                      התחל בדיקה
                      <ChevronLeft size={16} />
                    </Link>
                    <Link to="/result?demo=true" className="btn btn-ghost btn-sm">
                      צפה בדוגמה
                    </Link>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
      {/* Features */}
      <section className="features-section">
        <div className="container">
          <h2 className="section-title">איך זה עובד?</h2>
          <div className="features-grid">
            {features.map((f, i) => (
              <div key={i} className="card feature-card">
                <div className="feature-icon">{f.icon}</div>
                <h3 className="feature-title">{f.title}</h3>
                <p className="feature-desc">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* Disclaimer */}
      <section className="disclaimer-section">
        <div className="container">
          <div className="disclaimer-card">
            <h3>⚠️ הבהרה חשובה</h3>
            <p>
              המידע באתר נועד לסיוע כללי בלבד ואינו מהווה פסק הלכה.
              <br />
              במקרה מעשי מומלץ להתייעץ עם רב.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
