import { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { Sparkles, Loader2, ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import { getModuleQuestions, evaluateDecision, checkEarlyTermination } from '../services/api';
import AIAssistant from '../components/AIAssistant';
import './WizardPage.css';

/**
 * Check if a question is visible given the current answers and its visibility rules
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
          case '=': return answer === cond.value;
          case '!=': return answer !== cond.value;
          case 'in': return Array.isArray(cond.value) && cond.value.includes(answer);
          default: return false;
        }
      });
    }
    return true;
  });
}

/**
 * Render a single question's answer input
 */
function QuestionInput({ question, value, onChange }) {
  switch (question.answerType) {
    case 'boolean':
      return (
        <div className="option-buttons">
          <button className={`option-btn ${value === true ? 'selected' : ''}`} onClick={() => onChange(true)} type="button">כן</button>
          <button className={`option-btn ${value === false ? 'selected' : ''}`} onClick={() => onChange(false)} type="button">לא</button>
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
      return <input type="date" className="form-input" value={value || ''} onChange={(e) => onChange(e.target.value)} />;
    case 'text':
      return <input type="text" className="form-input" value={value || ''} onChange={(e) => onChange(e.target.value)} placeholder="הקלידו כאן..." />;
    case 'number':
      return <input type="number" className="form-input" value={value ?? ''} onChange={(e) => onChange(e.target.value === '' ? '' : Number(e.target.value))} placeholder="הזינו מספר..." />;
    default:
      return null;
  }
}

export default function WizardPage() {
  const { moduleCode } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [allQuestions, setAllQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [evaluating, setEvaluating] = useState(false);
  const [checkingEarly, setCheckingEarly] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [stepHistory, setStepHistory] = useState([]);
  const [aiOpen, setAiOpen] = useState(searchParams.get('ai') === 'true');

  // Load questions from API
  useEffect(() => {
    (async () => {
      try {
        const data = await getModuleQuestions(moduleCode || 'orlah');
        setAllQuestions(data);
      } catch (err) {
        console.error('Failed to load questions:', err);
      } finally {
        setLoading(false);
      }
    })();
  }, [moduleCode]);

  /**
   * Build ordered step keys from questions (preserving order from server).
   * Each step is a group of questions sharing the same stepKey.
   */
  const steps = useMemo(() => {
    const seen = new Set();
    const ordered = [];
    for (const q of allQuestions) {
      const key = q.stepKey || q.groupKey || q.questionKey;
      if (!seen.has(key)) {
        seen.add(key);
        ordered.push(key);
      }
    }
    return ordered;
  }, [allQuestions]);

  /**
   * For a given step key, return the visible questions in that step
   */
  const getStepQuestions = useCallback(
    (stepKey) => {
      return allQuestions
        .filter((q) => (q.stepKey || q.groupKey || q.questionKey) === stepKey)
        .filter((q) => isQuestionVisible(q, answers));
    },
    [allQuestions, answers]
  );

  /**
   * Compute which steps are visible (have at least one visible question)
   */
  const visibleSteps = useMemo(() => {
    return steps.filter((stepKey) => getStepQuestions(stepKey).length > 0);
  }, [steps, getStepQuestions]);

  const currentStepKey = visibleSteps[currentStepIndex] || visibleSteps[0];
  const currentQuestions = currentStepKey ? getStepQuestions(currentStepKey) : [];

  // Get the section label from the first question that has one
  const sectionLabel = useMemo(() => {
    for (const q of currentQuestions) {
      if (q.sectionLabelHe) return q.sectionLabelHe;
    }
    return '';
  }, [currentQuestions]);

  // Check if all required questions in the current step are answered
  const isStepComplete = useMemo(() => {
    return currentQuestions
      .filter((q) => q.isRequired)
      .every((q) => {
        const v = answers[q.questionKey];
        return v !== undefined && v !== null && v !== '';
      });
  }, [currentQuestions, answers]);

  // Total progress
  const totalVisibleRequired = useMemo(() => {
    let total = 0;
    let answered = 0;
    for (const stepKey of visibleSteps) {
      const qs = getStepQuestions(stepKey);
      for (const q of qs) {
        if (q.isRequired) {
          total++;
          const v = answers[q.questionKey];
          if (v !== undefined && v !== null && v !== '') answered++;
        }
      }
    }
    return { total, answered };
  }, [visibleSteps, getStepQuestions, answers]);

  const progress = totalVisibleRequired.total > 0
    ? (totalVisibleRequired.answered / totalVisibleRequired.total) * 100
    : 0;

  const isLastStep = currentStepIndex >= visibleSteps.length - 1;

  const handleAnswer = useCallback((questionKey, value) => {
    setAnswers((prev) => ({ ...prev, [questionKey]: value }));
  }, []);

  /**
   * Go to the next step, checking for early termination first
   */
  const handleNext = async () => {
    if (!isStepComplete) return;

    // Check for early termination
    setCheckingEarly(true);
    try {
      const earlyResult = await checkEarlyTermination(moduleCode || 'orlah', answers);
      if (earlyResult.shouldTerminate && earlyResult.result) {
        navigate('/result', {
          state: { result: earlyResult.result, answers, moduleCode: moduleCode || 'orlah' },
        });
        return;
      }
    } catch (err) {
      console.error('Early check failed (continuing):', err);
    } finally {
      setCheckingEarly(false);
    }

    if (isLastStep) {
      // Submit for full evaluation
      await handleSubmit();
    } else {
      // Find next visible step
      setStepHistory((prev) => [...prev, currentStepIndex]);
      setCurrentStepIndex((prev) => {
        const next = prev + 1;
        return next < visibleSteps.length ? next : prev;
      });
    }
  };

  const handleBack = () => {
    if (stepHistory.length > 0) {
      const prevIndex = stepHistory[stepHistory.length - 1];
      setStepHistory((prev) => prev.slice(0, -1));
      setCurrentStepIndex(prevIndex);
    }
  };

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

  // ─── Loading state ─────────────────────────────────────────────
  if (loading) {
    return (
      <div className="wizard-loading container">
        <Loader2 size={32} className="spinner" />
        <p>טוען שאלון...</p>
      </div>
    );
  }

  if (visibleSteps.length === 0) {
    return (
      <div className="wizard-loading container">
        <p>לא נמצאו שאלות למודול זה.</p>
      </div>
    );
  }

  // ─── Render ────────────────────────────────────────────────────
  return (
    <div className="wizard-page container">
      {/* Progress bar */}
      <div className="wizard-header-bar">
        <div className="wizard-progress">
          <div className="wizard-progress-bar" style={{ width: `${progress}%` }} />
        </div>
        <div className="wizard-progress-info">
          <span className="wizard-step-counter">
            שלב {currentStepIndex + 1} מתוך {visibleSteps.length}
          </span>
          <span className="wizard-progress-text">
            {totalVisibleRequired.answered}/{totalVisibleRequired.total} שאלות חובה
          </span>
        </div>
      </div>

      <div className="wizard-layout">
        {/* Step card */}
        <div className="wizard-main">
          <div className="wizard-step-card card">
            {sectionLabel && (
              <div className="wizard-step-header">
                <span className="wizard-step-label">{sectionLabel}</span>
              </div>
            )}

            <div className="wizard-step-body">
              {currentQuestions.map((q) => {
                const val = answers[q.questionKey];
                const isFilled = val !== undefined && val !== null && val !== '';
                return (
                  <div key={q.id} className={`wizard-question-block ${isFilled ? 'filled' : ''}`}>
                    <div className="wizard-question-header">
                      <h3 className="wizard-question-label">
                        {q.labelHe}
                        {q.isRequired && <span className="wizard-required-mark">*</span>}
                      </h3>
                      {!q.isRequired && (
                        <span className="wizard-optional-badge">אופציונלי</span>
                      )}
                    </div>
                    {q.helpTextHe && <p className="wizard-help-text">{q.helpTextHe}</p>}
                    <div className="wizard-answer-area">
                      <QuestionInput question={q} value={val} onChange={(v) => handleAnswer(q.questionKey, v)} />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Navigation buttons */}
            <div className="wizard-nav-buttons">
              {stepHistory.length > 0 && (
                <button className="btn btn-ghost" type="button" onClick={handleBack}>
                  <ChevronRight size={18} />
                  חזרה
                </button>
              )}
              <div className="wizard-nav-spacer" />
              <button
                className={`btn ${isLastStep ? 'btn-primary' : 'btn-primary'} btn-lg`}
                type="button"
                onClick={handleNext}
                disabled={!isStepComplete || evaluating || checkingEarly}
              >
                {evaluating || checkingEarly ? (
                  <>
                    <Loader2 size={18} className="spinner" />
                    {evaluating ? 'מחשב תוצאה...' : 'בודק...'}
                  </>
                ) : isLastStep ? (
                  <>
                    קבל תוצאה
                    <ChevronLeft size={18} />
                  </>
                ) : (
                  <>
                    המשך
                    <ChevronLeft size={18} />
                  </>
                )}
              </button>
            </div>
          </div>

          {!isStepComplete && (
            <p className="wizard-step-hint">יש לענות על כל שדות החובה (*) כדי להמשיך</p>
          )}
        </div>

        {/* Sidebar */}
        <div className="wizard-sidebar">
          <div className="card wizard-sidebar-card">
            <h4 className="wizard-sidebar-title">חישוב שנות ערלה</h4>
            <p className="wizard-sidebar-desc">
              ענו על השאלות בכל שלב. המערכת תוביל אתכם לפי הצורך.
            </p>
            <div className="wizard-sidebar-progress">
              <div className="wizard-sidebar-progress-bar" style={{ width: `${progress}%` }} />
            </div>
            <span className="wizard-sidebar-progress-text">
              שלב {currentStepIndex + 1}/{visibleSteps.length}
            </span>

            {/* Answer summary */}
            {stepHistory.length > 0 && (
              <div className="wizard-summary">
                <h5 className="wizard-summary-title">תשובות שניתנו:</h5>
                <div className="wizard-summary-list">
                  {Object.entries(answers)
                    .filter(([, v]) => v !== undefined && v !== null && v !== '')
                    .slice(0, 8)
                    .map(([key, val]) => {
                      const q = allQuestions.find((qq) => qq.questionKey === key);
                      if (!q) return null;
                      let displayVal = String(val);
                      if (val === true) displayVal = 'כן';
                      if (val === false) displayVal = 'לא';
                      if (q.options) {
                        const opt = q.options.find((o) => o.optionValue === val);
                        if (opt) displayVal = opt.optionLabelHe;
                      }
                      return (
                        <div key={key} className="wizard-summary-item">
                          <span className="wizard-summary-q">{q.labelHe}</span>
                          <span className="wizard-summary-a">{displayVal}</span>
                        </div>
                      );
                    })}
                </div>
              </div>
            )}
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
