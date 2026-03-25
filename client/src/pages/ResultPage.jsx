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
  statusCode: 'ORLAH_ACTIVE',
  headlineHe: 'ערלה חלה',
  explanationHe: 'לפי הנתונים שהוזנו, הצמח נשתל לצורך פרי בארץ ישראל כשתילה חדשה. דין ערלה חל ויש למנות שלוש שנות ערלה מתאריך הנטיעה.',
  recommendationHe: 'אין לאכול מפרי העץ עד תום שלוש שנות ערלה. בשנה הרביעית — פירות נטע רבעי.',
  confidenceLevel: 'high',
  disclaimerHe: 'המידע באתר נועד לסיוע כללי בלבד ואינו מהווה פסק הלכה. מומלץ להתייעץ עם רב מוסמך.',
  permittedDateGregorian: '2029-03-15',
  permittedDateHebrew: 'י״ב אדר ב׳ תשפ״ט',
  isSafek: false,
  isEstimatedDate: false,
  nextRelevantDate: '2029-03-15',
  explanationPathJson: [
    { type: 'question', labelHe: 'מהו תאריך הנטיעה?' },
    { type: 'answer', labelHe: '2026-03-15' },
    { type: 'question', labelHe: 'מהי סיבת השתילה?' },
    { type: 'answer', labelHe: 'fruit' },
    { type: 'question', labelHe: 'היכן נשתל הצמח?' },
    { type: 'answer', labelHe: 'israel' },
    { type: 'result', labelHe: 'ערלה חלה' },
  ],
};

const DEMO_ANSWERS = {
  planting_date: '2026-03-15',
  date_type: 'exact',
  seedling_type: 'young_seedling',
  planting_reason: 'fruit',
  planting_location: 'israel',
  is_transfer: 'new_planting',
  current_in_structure: 'no',
  current_ground_or_pot: 'ground',
};

const CONFIDENCE_LABELS = {
  high: 'גבוהה',
  medium: 'בינונית',
  low: 'נמוכה',
};

const ANSWER_LABELS = {
  planting_date: 'תאריך נטיעה',
  date_type: 'סוג תאריך',
  seedling_type: 'סוג שתיל',
  planting_reason: 'סיבת השתילה',
  planting_location: 'מקום השתילה',
  is_transfer: 'סוג הנטיעה',
  prev_planting_date: 'תאריך שתילה קודם',
  prev_location_area: 'מקום קודם',
  prev_in_structure: 'היה במבנה (קודם)',
  prev_under_roof: 'היה תחת גג (קודם)',
  prev_ground_or_pot: 'אדמה/עציץ (קודם)',
  prev_pot_type: 'סוג עציץ (קודם)',
  prev_pot_separation: 'הפרדה מאדמה (קודם)',
  prev_on_pavement: 'על ריצוף (קודם)',
  transfer_container_type: 'אמצעי העברה',
  transfer_soil_block_intact: 'גוש אדמה שלם',
  transfer_delay: 'עיכוב בהעברה',
  transfer_delay_duration: 'משך העיכוב (ימים)',
  transfer_had_fruit: 'פירות בהעברה',
  transfer_fruit_status: 'דין הפירות',
  current_in_structure: 'במבנה (נוכחי)',
  current_under_roof: 'תחת גג (נוכחי)',
  current_ground_or_pot: 'אדמה/עציץ (נוכחי)',
  current_pot_type: 'סוג עציץ (נוכחי)',
  current_pot_separation: 'הפרדה מאדמה (נוכחי)',
  current_on_pavement: 'על ריצוף (נוכחי)',
  rootstock_type: 'סוג כנה',
  scion_type: 'סוג רוכב',
  transfer_current_in_structure: 'במבנה (נוכחי, העברה)',
  transfer_current_under_roof: 'תחת גג (נוכחי, העברה)',
  transfer_current_ground_or_pot: 'אדמה/עציץ (נוכחי, העברה)',
  transfer_current_pot_type: 'סוג עציץ (נוכחי, העברה)',
  transfer_current_pot_separation: 'הפרדה (נוכחי, העברה)',
  transfer_current_on_pavement: 'ריצוף (נוכחי, העברה)',
  transfer_new_planting_date: 'תאריך נטיעה חדש (העברה)',
};

const OPTION_DISPLAY = {
  exact: 'מדויק',
  estimated: 'משוער',
  young_seedling: 'שתיל צעיר',
  young_tree: 'אילן צעיר',
  mature_tree: 'אילן בוגר',
  cutting: 'ייחור',
  graft: 'הרכבה',
  fruit: 'לפרי',
  fencing: 'לגידור',
  timber: 'לקורות',
  ornamental: 'לנוי',
  other: 'אחר',
  israel: 'ארץ ישראל',
  abroad: 'חו״ל',
  new_planting: 'שתילה חדשה',
  transfer: 'העברה',
  ground: 'באדמה',
  pot: 'בעציץ',
  perforated: 'עציץ נקוב',
  non_perforated: 'עציץ שאינו נקוב',
  bag: 'שקית / שק',
  bare_root: 'שורש חשוף',
  soil_block: 'גוש אדמה',
  orlah_fruit: 'פירות ערלה',
  permitted_fruit: 'פירות מותרים',
  uncertain: 'ספק',
  unknown: 'לא ידוע',
  yes: 'כן',
  no: 'לא',
  fencing_timber_only: 'לגידור / קורות בלבד',
  ornamental_only: 'לנוי בלבד',
  unclear_mixed: 'לא ברור / שימוש מעורב',
  perforated_pot: 'בעציץ נקוב',
  non_perforated_pot: 'בעציץ שאינו נקוב',
  with_separation: 'עם חציצה / ריצוף',
  yes_short: 'כן, קצר',
  yes_long: 'כן, ממושך',
  citrus: 'הדרים',
  stone_fruit: 'גלעיניים',
  apple_pear: 'תפוח / אגס',
  almond: 'שקד',
  olive: 'זית',
  pomegranate: 'רימון',
  lemon: 'לימון',
  orange: 'תפוז',
  clementine: 'קלמנטינה',
  grapefruit: 'אשכולית',
  apple: 'תפוח',
  pear: 'אגס',
  grape: 'גפן',
  peach: 'אפרסק',
  plum: 'שזיף',
  avocado: 'אבוקדו',
  fig: 'תאנה',
  date_palm: 'תמר',
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
              {result.permittedDateHebrew && (
                <div className="result-detail-item">
                  <span className="detail-label">תאריך היתר (עברי)</span>
                  <span className="result-date-value">{result.permittedDateHebrew}</span>
                </div>
              )}
              {result.permittedDateGregorian && (
                <div className="result-detail-item">
                  <span className="detail-label">תאריך היתר (לועזי)</span>
                  <span>{formatDate(result.permittedDateGregorian)}</span>
                </div>
              )}
              {result.isSafek && (
                <div className="result-detail-item">
                  <span className="detail-label">ספק</span>
                  <span className="badge badge-warning">יש ספק</span>
                </div>
              )}
              {result.isEstimatedDate && (
                <div className="result-detail-item">
                  <span className="detail-label">תאריך משוער</span>
                  <span className="badge badge-info">כן — התאריך אינו מדויק</span>
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
                else displayVal = OPTION_DISPLAY[val] || String(val);
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
