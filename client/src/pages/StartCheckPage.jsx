import { useNavigate } from 'react-router-dom';
import { TreePine, ChevronLeft, Sparkles, Play } from 'lucide-react';
import './StartCheckPage.css';

export default function StartCheckPage() {
  const navigate = useNavigate();

  const handleStart = () => {
    navigate('/wizard/orlah');
  };

  const handleDemo = () => {
    navigate('/result?demo=true');
  };

  return (
    <div className="start-check-page container">
      <div className="start-check-header">
        <TreePine size={48} className="start-check-icon" />
        <h1>חישוב שנות ערלה</h1>
        <p>ענו על שאלות לגבי הנטיעה שלכם וקבלו חישוב מפורט של שנות ערלה, כולל תאריך היתר משוער</p>
      </div>

      <div className="start-check-card card">
        <h3>מה נבדק?</h3>
        <ul className="start-check-list">
          <li>תאריך הנטיעה (מדויק או משוער)</li>
          <li>סוג השתיל וסיבת השתילה</li>
          <li>מיקום — ארץ ישראל או חו״ל</li>
          <li>פרטי העברה (אם הצמח הועבר ממקום אחר)</li>
          <li>מיקום הנטיעה הנוכחי — אדמה, עציץ, מבנה</li>
        </ul>

        <div className="start-check-actions">
          <button className="btn btn-primary btn-lg" onClick={handleStart}>
            התחל בדיקה
            <ChevronLeft size={20} />
          </button>
        </div>
      </div>

      <div className="start-check-extras">
        <button className="btn btn-secondary" onClick={handleDemo}>
          <Play size={18} />
          צפה בדוגמה
        </button>
        <button
          className="btn btn-ghost"
          onClick={() => navigate('/wizard/orlah?ai=true')}
        >
          <Sparkles size={18} />
          עזרה עם AI
        </button>
      </div>
    </div>
  );
}
