import { useState, useEffect } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { Save, RefreshCw, Sparkles, Calendar, Shield, FileText, Route, TreePine, Loader2, X } from 'lucide-react';
import { getStatusInfo, formatDate } from '../utils/statusUtils';
import { useAuth } from '../hooks/useAuth';
import { createPlant } from '../services/api';
import DecisionPath from '../components/DecisionPath';
import AIAssistant from '../components/AIAssistant';
import './ResultPage.css';

// Demo result data
const DEMO_RESULT = {
  statusCode: 'NEEDS_REVIEW',
  headlineHe: 'נדרש בירור נוסף',
  explanationHe: 'לפי הנתונים, אין מספיק ודאות כדי לקבוע מצב ברור של עורלה, במיוחד סביב פרטי ההעברה או גוש האדמה.',
  recommendationHe: 'מומלץ להשלים פרטים חסרים או להתייעץ עם רב לפני שימוש בפרי.',
  confidenceLevel: 'medium',
  disclaimerHe: 'המידע באתר נועד לסיוע כללי בלבד ואינו מהווה פסק הלכה.',
  nextRelevantDate: '2026-04-15',
  explanationPathJson: [
    { type: 'question', labelHe: 'האם זה עץ פרי?' },
    { type: 'answer', labelHe: 'כן' },
    { type: 'question', labelHe: 'האם הצמח הועבר ממקום למקום?' },
    { type: 'answer', labelHe: 'כן' },
    { type: 'question', labelHe: 'האם היה גוש אדמה שמספיק לקיום הצמח?' },
    { type: 'answer', labelHe: 'לא יודע/ת' },
    { type: 'result', labelHe: 'נדרש בירור נוסף' },
  ],
};

const DEMO_ANSWERS = {
  fruit_tree: true,
  plant_type: 'lemon',
  source_type: 'nursery',
  transferred: true,
  sustaining_soil_block: 'unknown',
  certainty_level: 'medium',
};

const CONFIDENCE_LABELS = {
  high: 'גבוהה',
  medium: 'בינונית',
  low: 'נמוכה',
};

const ANSWER_LABELS = {
  fruit_tree: 'עץ פרי',
  plant_type: 'סוג צמח',
  source_type: 'מקור',
  growth_location: 'מיקום',
  transferred: 'הועבר',
  sustaining_soil_block: 'גוש אדמה',
  perforated_pot: 'עציץ נקוב',
  exact_date_known: 'תאריך מדויק ידוע',
  location_country: 'מיקום גיאוגרפי',
  certainty_level: 'רמת ודאות',
  planted_or_purchased_date: 'תאריך שתילה/רכישה',
};

export default function ResultPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('result');
  const [aiOpen, setAiOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [ownerIdNumber, setOwnerIdNumber] = useState('');
  const [plantDescription, setPlantDescription] = useState('');
  const [idError, setIdError] = useState('');

  const isDemo = searchParams.get('demo') === 'true';
  const stateData = location.state;

  const result = isDemo ? DEMO_RESULT : stateData?.result;
  const answers = isDemo ? DEMO_ANSWERS : stateData?.answers;
  const moduleCode = stateData?.moduleCode || 'orlah';

  const handleSavePlant = () => {
    setShowSaveModal(true);
    setSaveError(null);
    setIdError('');
  };

  const handleConfirmSave = async () => {
    // Validate required field
    if (!ownerIdNumber.trim()) {
      setIdError('שדה חובה — יש להזין מספור / ת.ז.');
      return;
    }
    setIdError('');
    setSaving(true);
    setSaveError(null);
    try {
      const plantData = {
        nickname: '',
        plantType: answers?.plant_type || 'unknown',
        locationText: answers?.growth_location || '',
        moduleId: 1,
        userId: user?.id,
        ownerIdNumber: ownerIdNumber.trim(),
        description: plantDescription.trim(),
        answers: answers || {},
      };
      const newPlant = await createPlant(plantData);
      setSaved(true);
      setShowSaveModal(false);
      // Navigate to plant details after a short delay so user sees the success state
      setTimeout(() => {
        navigate(`/plants/${newPlant.id}`);
      }, 1000);
    } catch (err) {
      console.error('Failed to save plant:', err);
      setSaveError('שגיאה בשמירת הצמח. נסה שוב.');
    } finally {
      setSaving(false);
    }
  };

  if (!result) {
    return (
      <div className="container result-empty">
        <p>לא נמצאה תוצאה להציג.</p>
        <button className="btn btn-primary" onClick={() => navigate('/check')}>
          התחל בדיקה חדשה
        </button>
      </div>
    );
  }

  const statusInfo = getStatusInfo(result.statusCode);

  const tabs = [
    { key: 'result', label: 'תוצאה', icon: <FileText size={16} /> },
    { key: 'path', label: 'מסלול החלטה', icon: <Route size={16} /> },
    { key: 'details', label: 'פרטי הצמח', icon: <TreePine size={16} /> },
  ];

  return (
    <div className="result-page container">
      {/* Status card */}
      <div className="result-status-card card">
        <div className="result-status-header">
          <span className={`badge ${statusInfo.badgeClass}`} style={{ fontSize: '1rem', padding: '8px 20px' }}>
            {statusInfo.icon} {statusInfo.label}
          </span>
          {result.confidenceLevel && (
            <span className="result-confidence">
              <Shield size={16} />
              ודאות: {CONFIDENCE_LABELS[result.confidenceLevel] || result.confidenceLevel}
            </span>
          )}
        </div>
        <h1 className="result-headline">{result.headlineHe}</h1>
        <p className="result-explanation">{result.explanationHe}</p>
        <p className="result-recommendation">{result.recommendationHe}</p>
        {result.nextRelevantDate && (
          <div className="result-next-date">
            <Calendar size={16} />
            <span>תאריך רלוונטי הבא: {formatDate(result.nextRelevantDate)}</span>
          </div>
        )}
        <div className="result-disclaimer">
          ⚠️ {result.disclaimerHe}
        </div>
      </div>

      {/* Tabs */}
      <div className="result-tabs">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            className={`result-tab ${activeTab === tab.key ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="result-tab-content card">
        {activeTab === 'result' && (
          <div className="result-summary-tab">
            <h3>סיכום</h3>
            <div className="result-detail-grid">
              <div className="result-detail-item">
                <span className="detail-label">סטטוס</span>
                <span className={`badge ${statusInfo.badgeClass}`}>
                  {statusInfo.icon} {statusInfo.label}
                </span>
              </div>
              <div className="result-detail-item">
                <span className="detail-label">רמת ודאות</span>
                <span>{CONFIDENCE_LABELS[result.confidenceLevel] || '—'}</span>
              </div>
              {result.nextRelevantDate && (
                <div className="result-detail-item">
                  <span className="detail-label">תאריך הבא</span>
                  <span>{formatDate(result.nextRelevantDate)}</span>
                </div>
              )}
              {result.needsRabbiReview && (
                <div className="result-detail-item">
                  <span className="detail-label">בירור רבני</span>
                  <span className="badge badge-warning">נדרש</span>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'path' && (
          <DecisionPath path={result.explanationPathJson} />
        )}

        {activeTab === 'details' && answers && (
          <div className="result-details-tab">
            <h3>פרטים שהוזנו</h3>
            <div className="result-answers-grid">
              {Object.entries(answers).map(([key, val]) => {
                let displayVal;
                if (val === true) displayVal = 'כן';
                else if (val === false) displayVal = 'לא';
                else displayVal = String(val);
                return (
                  <div key={key} className="result-answer-item">
                    <span className="answer-label">{ANSWER_LABELS[key] || key}</span>
                    <span className="answer-value">{displayVal}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="result-actions">
        {user ? (
          <button
            className="btn btn-primary"
            onClick={handleSavePlant}
            disabled={saving || saved}
          >
            {saving ? (
              <>
                <Loader2 size={18} className="spinner" />
                שומר...
              </>
            ) : saved ? (
              <>
                <Save size={18} />
                נשמר בהצלחה!
              </>
            ) : (
              <>
                <Save size={18} />
                שמור את הצמח
              </>
            )}
          </button>
        ) : (
          <button className="btn btn-primary" onClick={() => navigate('/login')}>
            <Save size={18} />
            שמור צמח (נדרשת הרשמה)
          </button>
        )}
        {saveError && <p className="save-error-msg">{saveError}</p>}
        <button className="btn btn-secondary" onClick={() => navigate('/check')}>
          <RefreshCw size={18} />
          בדיקה חדשה
        </button>
        <button className="btn btn-ghost" onClick={() => setAiOpen(true)}>
          <Sparkles size={18} />
          הסבר לי עם AI
        </button>
      </div>

      <AIAssistant
        open={aiOpen}
        onClose={() => setAiOpen(false)}
        onApplyField={() => {}}
      />

      {/* Save Plant Modal */}
      {showSaveModal && (
        <div className="save-modal-overlay" onClick={() => setShowSaveModal(false)}>
          <div className="save-modal" onClick={(e) => e.stopPropagation()}>
            <div className="save-modal-header">
              <h2>שמירת צמח</h2>
              <button className="save-modal-close" onClick={() => setShowSaveModal(false)}>
                <X size={20} />
              </button>
            </div>
            <div className="save-modal-body">
              <div className="save-modal-field">
                <label htmlFor="ownerIdNumber">
                  מספור / ת.ז. <span className="required-mark">*</span>
                </label>
                <input
                  id="ownerIdNumber"
                  type="text"
                  className={`input ${idError ? 'input-error' : ''}`}
                  value={ownerIdNumber}
                  onChange={(e) => { setOwnerIdNumber(e.target.value); setIdError(''); }}
                  placeholder="הזן מספור או תעודת זהות"
                  autoFocus
                />
                {idError && <p className="field-error">{idError}</p>}
              </div>
              <div className="save-modal-field">
                <label htmlFor="plantDescription">
                  תיאור השתיל או החלקה <span className="optional-mark">(אופציונלי)</span>
                </label>
                <textarea
                  id="plantDescription"
                  className="input"
                  rows={3}
                  value={plantDescription}
                  onChange={(e) => setPlantDescription(e.target.value)}
                  placeholder="למשל: עץ לימון בחצר האחורית, חלקה 7 בשדה המערבי..."
                />
              </div>
              {saveError && <p className="save-error-msg">{saveError}</p>}
            </div>
            <div className="save-modal-actions">
              <button
                className="btn btn-primary"
                onClick={handleConfirmSave}
                disabled={saving}
              >
                {saving ? (
                  <>
                    <Loader2 size={18} className="spinner" />
                    שומר...
                  </>
                ) : (
                  <>
                    <Save size={18} />
                    שמור
                  </>
                )}
              </button>
              <button className="btn btn-ghost" onClick={() => setShowSaveModal(false)} disabled={saving}>
                ביטול
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
