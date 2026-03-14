import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Leaf, Calendar, MapPin, Sparkles, ArrowRight, FileText, Route, Clock, StickyNote, Hash, AlignLeft } from 'lucide-react';
import { getPlant } from '../services/api';
import { getStatusInfo, formatDate } from '../utils/statusUtils';
import DecisionPath from '../components/DecisionPath';
import AIAssistant from '../components/AIAssistant';
import './PlantDetailsPage.css';

const PLANT_TYPE_LABELS = {
  lemon: 'לימון',
  olive: 'זית',
  apple: 'תפוח',
  pomegranate: 'רימון',
  grape: 'גפן',
};

export default function PlantDetailsPage() {
  const { id } = useParams();
  const [plant, setPlant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('summary');
  const [aiOpen, setAiOpen] = useState(false);

  useEffect(() => {
    loadPlant();
  }, [id]);

  const loadPlant = async () => {
    try {
      const data = await getPlant(id);
      setPlant(data);
    } catch (err) {
      console.error('Failed to load plant:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="container" style={{ textAlign: 'center', padding: 48 }}>טוען פרטי צמח...</div>;
  }

  if (!plant) {
    return (
      <div className="container" style={{ textAlign: 'center', padding: 48 }}>
        <p>הצמח לא נמצא.</p>
        <Link to="/my-plants" className="btn btn-primary" style={{ marginTop: 16 }}>חזרה לצמחים שלי</Link>
      </div>
    );
  }

  const latestResult = plant.latestResult;
  const statusInfo = latestResult ? getStatusInfo(latestResult.statusCode) : getStatusInfo('INCOMPLETE');

  const tabs = [
    { key: 'summary', label: 'סיכום', icon: <FileText size={16} /> },
    { key: 'path', label: 'מסלול החלטה', icon: <Route size={16} /> },
    { key: 'answers', label: 'תשובות', icon: <StickyNote size={16} /> },
    { key: 'history', label: 'היסטוריה', icon: <Clock size={16} /> },
  ];

  return (
    <div className="plant-details-page container">
      <Link to="/my-plants" className="back-link">
        <ArrowRight size={16} />
        חזרה לצמחים שלי
      </Link>

      {/* Plant summary card */}
      <div className="card plant-summary-card">
        <div className="plant-summary-layout">
          <div className="plant-summary-image">
            {plant.imageUrl ? (
              <img src={plant.imageUrl} alt={plant.nickname} />
            ) : (
              <div className="plant-summary-placeholder">
                <Leaf size={48} />
              </div>
            )}
          </div>
          <div className="plant-summary-info">
            <div className="plant-summary-top">
              <h1>{plant.nickname}</h1>
              <span className={`badge ${statusInfo.badgeClass}`}>
                {statusInfo.icon} {statusInfo.label}
              </span>
            </div>
            <div className="plant-summary-meta">
              <span><Leaf size={14} /> {PLANT_TYPE_LABELS[plant.plantType] || plant.plantType}</span>
              <span><MapPin size={14} /> {plant.locationText}</span>
              <span><Calendar size={14} /> נוצר: {formatDate(plant.createdAt)}</span>
              {plant.ownerIdNumber && (
                <span><Hash size={14} /> מספור / ת.ז.: {plant.ownerIdNumber}</span>
              )}
            </div>
            {plant.description && (
              <div className="plant-summary-description">
                <AlignLeft size={14} /> {plant.description}
              </div>
            )}
            <div className="plant-summary-id">מזהה: {plant.publicPlantId}</div>
          </div>
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

      <div className="result-tab-content card">
        {activeTab === 'summary' && latestResult && (
          <div>
            <h3>{latestResult.computedSummaryHe || latestResult.headlineHe || 'סיכום'}</h3>
            {latestResult.nextRelevantDate && (
              <p style={{ marginTop: 12 }}>
                <Calendar size={14} style={{ verticalAlign: 'middle', marginLeft: 6 }} />
                תאריך רלוונטי הבא: {formatDate(latestResult.nextRelevantDate)}
              </p>
            )}
            <p style={{ marginTop: 12, color: 'var(--color-text-secondary)' }}>
              רמת ודאות: {latestResult.confidenceLevel === 'high' ? 'גבוהה' : latestResult.confidenceLevel === 'medium' ? 'בינונית' : 'נמוכה'}
            </p>
          </div>
        )}

        {activeTab === 'path' && latestResult && (
          <DecisionPath path={latestResult.explanationPathJson} />
        )}

        {activeTab === 'answers' && plant.answers && (
          <div>
            <h3>תשובות ששמורות</h3>
            <div className="result-answers-grid" style={{ marginTop: 16 }}>
              {plant.answers.map((a) => (
                <div key={a.id} className="result-answer-item">
                  <span className="answer-label">{a.questionKey}</span>
                  <span className="answer-value">{String(a.answerValue)}</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                    מקור: {a.answerSource === 'ai' ? 'AI' : 'ידני'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'history' && (
          <div>
            <h3>היסטוריית תוצאות</h3>
            {plant.results && plant.results.length > 0 ? (
              <div style={{ marginTop: 16 }}>
                {plant.results.map((r) => {
                  const s = getStatusInfo(r.statusCode);
                  return (
                    <div key={r.id} className="card" style={{ padding: 16, marginBottom: 12 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span className={`badge ${s.badgeClass}`}>{s.icon} {s.label}</span>
                        <span style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>
                          {formatDate(r.createdAt)}
                        </span>
                      </div>
                      <p style={{ marginTop: 8, fontSize: '0.9375rem' }}>{r.computedSummaryHe}</p>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p style={{ color: 'var(--color-text-muted)', marginTop: 12 }}>אין היסטוריה להצגה.</p>
            )}
          </div>
        )}
      </div>

      <div className="plant-details-actions">
        <button className="btn btn-ghost" onClick={() => setAiOpen(true)}>
          <Sparkles size={18} />
          עזרה עם AI
        </button>
      </div>

      <AIAssistant open={aiOpen} onClose={() => setAiOpen(false)} onApplyField={() => {}} />
    </div>
  );
}
