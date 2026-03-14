import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TreePine, ChevronLeft, Sparkles, Play } from 'lucide-react';
import './StartCheckPage.css';

export default function StartCheckPage() {
  const navigate = useNavigate();
  const [plantType, setPlantType] = useState('');
  const [isFruitTree, setIsFruitTree] = useState('');

  const handleStart = () => {
    // Navigate to wizard with any pre-filled data
    const params = new URLSearchParams();
    if (plantType) params.set('plantType', plantType);
    if (isFruitTree) params.set('fruitTree', isFruitTree);
    navigate(`/wizard/orlah?${params.toString()}`);
  };

  const handleDemo = () => {
    navigate('/result?demo=true');
  };

  return (
    <div className="start-check-page container">
      <div className="start-check-header">
        <TreePine size={48} className="start-check-icon" />
        <h1>התחל בדיקה חדשה</h1>
        <p>ענו על מספר שאלות בסיסיות כדי להתחיל את הבדיקה</p>
      </div>

      <div className="start-check-card card">
        <div className="form-group">
          <label className="form-label">האם מדובר בעץ פרי?</label>
          <div className="option-buttons">
            <button
              className={`option-btn ${isFruitTree === 'yes' ? 'selected' : ''}`}
              onClick={() => setIsFruitTree('yes')}
            >
              כן
            </button>
            <button
              className={`option-btn ${isFruitTree === 'no' ? 'selected' : ''}`}
              onClick={() => setIsFruitTree('no')}
            >
              לא
            </button>
            <button
              className={`option-btn ${isFruitTree === 'unknown' ? 'selected' : ''}`}
              onClick={() => setIsFruitTree('unknown')}
            >
              לא יודע/ת
            </button>
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">סוג הצמח</label>
          <select
            className="form-input"
            value={plantType}
            onChange={(e) => setPlantType(e.target.value)}
          >
            <option value="">בחרו סוג צמח...</option>
            <option value="lemon">לימון</option>
            <option value="olive">זית</option>
            <option value="apple">תפוח</option>
            <option value="pomegranate">רימון</option>
            <option value="grape">גפן</option>
            <option value="other">אחר</option>
          </select>
        </div>

        <div className="start-check-actions">
          <button className="btn btn-primary btn-lg" onClick={handleStart}>
            המשך לשאלון
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
