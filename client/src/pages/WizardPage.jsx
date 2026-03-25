import { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { Sparkles, Loader2, ChevronLeft } from 'lucide-react';
import { getModuleQuestions, evaluateDecision } from '../services/api';
import AIAssistant from '../components/AIAssistant';
import './WizardPage.css';

/**
 * Check if a question should be visible based on current answers
 */
function isQuestionVisible(question, answers) {
  if (!question.visibilityRules || question.visibilityRules.length === 0) {
    return true;
  }

  return question.visibilityRules.every((rule) => {
    const { expressionJson } = rule;
    if (expressionJson.all) {
      return expressionJson.all.every((cond) => {
        const answer = answers[cond.field];
        if (answer === undefined || answer === null) return false;
        switch (cond.op) {
          case '=':
            return answer === cond.value;
          case '!=':
            return answer !== cond.value;
          case 'in':
            return Array.isArray(cond.value) && cond.value.includes(answer);
          default:
            return false;
        }
      });
    }
    return true;
  });
}

/**
 * Group key to section label mapping
 */
const GROUP_SECTION_LABELS = {
  planting_date: 'תאריך נטיעה',
  seedling_info: 'פרטי השתיל',
  transfer_decision: 'סוג הנטיעה',
  prev_location: 'פרטי המקום הקודם (לפני ההעברה)',
  transfer_method: 'פרטי אופן ההעברה',
  current_location: 'מיקום הנטיעה הנוכחי',
};

/**
 * Render a single question's answer input
 */
function QuestionInput({ question, value, onChange }) {
  switch (question.answerType) {
    case 'boolean':
      return (
        <div className="option-buttons">
          <button
            className={`option-btn ${value === true ? 'selected' : ''}`}
            onClick={() => onChange(true)}
            type="button"
          >
            כן
          </button>
          <button
            className={`option-btn ${value === false ? 'selected' : ''}`}
            onClick={() => onChange(false)}
            type="button"
          >
            לא
          </button>
        </div>
      );

    case 'select':
      return question.options ? (
        <div className="option-buttons option-buttons-wrap">
          {question.options.map((opt) => (
            <button
              key={opt.id}
              className={`option-btn ${value === opt.optionValue ? 'selected' : ''}`}
              onClick={() => onChange(opt.optionValue)}
              type="button"
            >
              {opt.optionLabelHe}
            </button>
          ))}
        </div>
      ) : null;

    case 'date':
      return (
        <input
          type="date"
          className="form-input"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
        />
      );

    case 'text':
      return (
        <input
          type="text"
          className="form-input"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder="הקלידו כאן..."
        />
      );

    case 'number':
      return (
        <input
          type="number"
          className="form-input"
          value={value ?? ''}
          onChange={(e) => onChange(e.target.value === '' ? '' : Number(e.target.value))}
          placeholder="הזינו מספר..."
        />
      );

    default:
      return null;
  }
}

export default function WizardPage() {
  const { moduleCode } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [evaluating, setEvaluating] = useState(false);
  const [aiOpen, setAiOpen] = useState(searchParams.get('ai') === 'true');

  useEffect(() => {
    loadQuestions();
  }, [moduleCode]);

  const loadQuestions = async () => {
    try {
      const data = await getModuleQuestions(moduleCode || 'orlah');
      setQuestions(data);

      const initial = {};
      const plantType = searchParams.get('plantType');
      if (plantType) initial.seedling_type = plantType;
      setAnswers(initial);
    } catch (err) {
      console.error('Failed to load questions:', err);
    } finally {
      setLoading(false);
    }
  };

  // Get visible questions based on current answers
  const visibleQuestions = useMemo(
    () => questions.filter((q) => isQuestionVisible(q, answers)),
    [questions, answers]
  );

  // Group visible questions into sections
  const sections = useMemo(() => {
    const secs = [];
    let currentGroup = null;

    for (const q of visibleQuestions) {
      if (q.groupKey !== currentGroup) {
        currentGroup = q.groupKey;
        const label = q.sectionLabelHe || GROUP_SECTION_LABELS[q.groupKey] || '';
        secs.push({ groupKey: q.groupKey, label, questions: [q] });
      } else {
        secs[secs.length - 1].questions.push(q);
      }
    }
    return secs;
  }, [visibleQuestions]);

  // Count answered required questions for progress
  const requiredCount = visibleQuestions.filter((q) => q.isRequired).length;
  const answeredRequired = visibleQuestions.filter(
    (q) => q.isRequired && answers[q.questionKey] !== undefined && answers[q.questionKey] !== null && answers[q.questionKey] !== ''
  ).length;
  const progress = requiredCount > 0 ? (answeredRequired / requiredCount) * 100 : 0;
  const canSubmit = answeredRequired === requiredCount;

  const handleAnswer = useCallback((questionKey, value) => {
    setAnswers((prev) => ({ ...prev, [questionKey]: value }));
  }, []);

  const handleSubmit = async () => {
    setEvaluating(true);
    try {
      const result = await evaluateDecision(moduleCode || 'orlah', answers);
      navigate('/result', {
        state: { result, answers, moduleCode: moduleCode || 'orlah' },
      });
    } catch (err) {
      console.error('Evaluation failed:', err);
    } finally {
      setEvaluating(false);
    }
  };

  const handleApplyAIField = useCallback((field, value) => {
    setAnswers((prev) => ({ ...prev, [field]: value }));
  }, []);

  if (loading) {
    return (
      <div className="wizard-loading container">
        <Loader2 size={32} className="spinner" />
        <p>טוען שאלון...</p>
      </div>
    );
  }

  if (visibleQuestions.length === 0) {
    return (
      <div className="wizard-loading container">
        <p>לא נמצאו שאלות למודול זה.</p>
      </div>
    );
  }

  return (
    <div className="wizard-page container">
      {/* Progress bar */}
      <div className="wizard-progress">
        <div className="wizard-progress-bar" style={{ width: `${progress}%` }} />
      </div>
      <div className="wizard-progress-text">
        {answeredRequired} מתוך {requiredCount} שאלות חובה מולאו
      </div>

      <div className="wizard-layout">
        {/* Questions list */}
        <div className="wizard-main">
          {sections.map((section) => (
            <div key={section.groupKey} className="wizard-section">
              {section.label && (
                <div className="wizard-section-header">
                  <span className="wizard-section-label">{section.label}</span>
                </div>
              )}

              {section.questions.map((q, qIdx) => {
                const val = answers[q.questionKey];
                const isFilled = val !== undefined && val !== null && val !== '';
                return (
                  <div
                    key={q.id}
                    className={`wizard-question-row ${isFilled ? 'filled' : ''}`}
                  >
                    <div className="wizard-question-header">
                      <h3 className="wizard-question-label">
                        {q.labelHe}
                        {q.isRequired && <span className="wizard-required-mark">*</span>}
                      </h3>
                      {!q.isRequired && (
                        <span className="wizard-optional-badge">אופציונלי</span>
                      )}
                    </div>
                    {q.helpTextHe && (
                      <p className="wizard-help-text">{q.helpTextHe}</p>
                    )}
                    <div className="wizard-answer-area">
                      <QuestionInput
                        question={q}
                        value={val}
                        onChange={(v) => handleAnswer(q.questionKey, v)}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ))}

          {/* Submit */}
          <div className="wizard-submit-area">
            <button
              className="btn btn-primary btn-lg"
              onClick={handleSubmit}
              disabled={evaluating || !canSubmit}
            >
              {evaluating ? (
                <>
                  <Loader2 size={18} className="spinner" />
                  מחשב...
                </>
              ) : (
                <>
                  קבל תוצאה
                  <ChevronLeft size={18} />
                </>
              )}
            </button>
            {!canSubmit && (
              <p className="wizard-submit-hint">יש למלא את כל שדות החובה (*) כדי לקבל תוצאה</p>
            )}
          </div>
        </div>

        {/* Sidebar — AI button */}
        <div className="wizard-sidebar">
          <div className="card wizard-sidebar-card">
            <h4 className="wizard-sidebar-title">חישוב שנות ערלה</h4>
            <p className="wizard-sidebar-desc">
              מלאו את כל הפרטים הנדרשים ולחצו על "קבל תוצאה" לחישוב.
            </p>
            <div className="wizard-sidebar-progress">
              <div className="wizard-sidebar-progress-bar" style={{ width: `${progress}%` }} />
            </div>
            <span className="wizard-sidebar-progress-text">
              {answeredRequired}/{requiredCount} חובה
            </span>
          </div>

          <button className="btn btn-secondary wizard-ai-btn" onClick={() => setAiOpen(true)}>
            <Sparkles size={18} />
            עזרה עם AI
          </button>
        </div>
      </div>

      {/* AI Assistant Drawer */}
      <AIAssistant
        open={aiOpen}
        onClose={() => setAiOpen(false)}
        onApplyField={handleApplyAIField}
      />
    </div>
  );
}
