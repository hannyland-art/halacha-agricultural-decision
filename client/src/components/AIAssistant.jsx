import { useState } from 'react';
import { X, Sparkles, Send, Check } from 'lucide-react';
import { extractAIParameters } from '../services/api';
import './AIAssistant.css';

const EXAMPLES = [
  'קניתי עץ לימון ממשתלה לפני חודשיים, שתלתי אותו בגינה.',
  'יש לי עץ רימון בעציץ במרפסת, לא בטוח אם העציץ נקוב.',
  'שתלתי גפן מזרע באדמה לפני שנה בערך.',
];

const FIELD_LABELS = {
  plant_type: 'סוג צמח',
  source_type: 'מקור',
  growth_location: 'מיקום',
  transferred: 'הועבר',
  sustaining_soil_block: 'גוש אדמה',
  fruit_tree: 'עץ פרי',
  perforated_pot: 'עציץ נקוב',
  certainty_level: 'רמת ודאות',
};

const VALUE_LABELS = {
  lemon: 'לימון',
  olive: 'זית',
  apple: 'תפוח',
  pomegranate: 'רימון',
  grape: 'גפן',
  nursery: 'משתלה',
  seed: 'זרע',
  pot_transfer: 'העברה מעציץ',
  ground_transfer: 'העברה מקרקע',
  ground: 'באדמה',
  pot: 'בעציץ',
  garden: 'בגינה',
  balcony: 'במרפסת',
  greenhouse: 'בחממה',
  true: 'כן',
  false: 'לא',
  unknown: 'לא יודע/ת',
  yes: 'כן',
  no: 'לא',
};

export default function AIAssistant({ open, onClose, onApplyField }) {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [appliedFields, setAppliedFields] = useState(new Set());

  const handleExtract = async () => {
    if (!text.trim()) return;
    setLoading(true);
    setResult(null);
    setAppliedFields(new Set());
    try {
      const data = await extractAIParameters(text);
      setResult(data);
    } catch (err) {
      console.error('AI extraction error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApply = (field, value) => {
    onApplyField(field, value);
    setAppliedFields(prev => new Set([...prev, field]));
  };

  const handleExample = (example) => {
    setText(example);
  };

  if (!open) return null;

  return (
    <div className="ai-overlay" onClick={onClose}>
      <div className="ai-drawer" onClick={(e) => e.stopPropagation()}>
        <div className="ai-drawer-header">
          <div className="ai-drawer-title">
            <Sparkles size={20} />
            <span>עזרה עם AI</span>
          </div>
          <button className="ai-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="ai-drawer-body">
          <p className="ai-intro">
            תארו את הצמח בחופשיות והמערכת תזהה את הפרטים הרלוונטיים.
          </p>

          <div className="ai-examples">
            <p className="ai-examples-title">דוגמאות:</p>
            {EXAMPLES.map((ex, i) => (
              <button key={i} className="ai-example-btn" onClick={() => handleExample(ex)}>
                {ex}
              </button>
            ))}
          </div>

          <div className="ai-input-area">
            <textarea
              className="ai-textarea form-input"
              rows={4}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="כתבו כאן את תיאור הצמח..."
            />
            <button
              className="btn btn-primary"
              onClick={handleExtract}
              disabled={loading || !text.trim()}
            >
              {loading ? 'מנתח...' : 'נתח טקסט'}
              <Send size={16} />
            </button>
          </div>

          {result && result.extractedFieldsJson && (
            <div className="ai-results">
              <h4 className="ai-results-title">פרמטרים שזוהו:</h4>
              <div className="ai-fields">
                {Object.entries(result.extractedFieldsJson).map(([field, value]) => {
                  const confidence = result.confidenceJson?.[field];
                  const isApplied = appliedFields.has(field);
                  const displayValue = VALUE_LABELS[String(value)] || String(value);

                  return (
                    <div key={field} className={`ai-field-card ${isApplied ? 'applied' : ''}`}>
                      <div className="ai-field-info">
                        <span className="ai-field-name">
                          {FIELD_LABELS[field] || field}
                        </span>
                        <span className="ai-field-value">{displayValue}</span>
                        {confidence && (
                          <span className="ai-field-confidence">
                            {Math.round(confidence * 100)}% ביטחון
                          </span>
                        )}
                      </div>
                      <button
                        className={`btn btn-sm ${isApplied ? 'btn-ghost' : 'btn-primary'}`}
                        onClick={() => handleApply(field, value)}
                        disabled={isApplied}
                      >
                        {isApplied ? <><Check size={14} /> הוחל</> : 'החל'}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
