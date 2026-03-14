import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Sparkles, Loader2 } from 'lucide-react';
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

export default function WizardPage() {
  const { moduleCode } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [currentStep, setCurrentStep] = useState(0);
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

      // Pre-fill from URL params
      const initial = {};
      const plantType = searchParams.get('plantType');
      const fruitTree = searchParams.get('fruitTree');
      if (plantType) initial.plant_type = plantType;
      if (fruitTree === 'yes') initial.fruit_tree = true;
      else if (fruitTree === 'no') initial.fruit_tree = false;
      setAnswers(initial);
    } catch (err) {
      console.error('Failed to load questions:', err);
    } finally {
      setLoading(false);
    }
  };

  // Get visible questions based on current answers
  const visibleQuestions = questions.filter((q) => isQuestionVisible(q, answers));
  const currentQuestion = visibleQuestions[currentStep];
  const totalSteps = visibleQuestions.length;
  const progress = totalSteps > 0 ? ((currentStep + 1) / totalSteps) * 100 : 0;

  const handleAnswer = (value) => {
    setAnswers((prev) => ({
      ...prev,
      [currentQuestion.questionKey]: value,
    }));
  };

  const handleNext = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    setEvaluating(true);
    try {
      const result = await evaluateDecision(moduleCode || 'orlah', answers);
      // Navigate to result page with data
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

  if (!currentQuestion) {
    return (
      <div className="wizard-loading container">
        <p>לא נמצאו שאלות למודול זה.</p>
      </div>
    );
  }

  const currentAnswer = answers[currentQuestion.questionKey];
  const isLastStep = currentStep === totalSteps - 1;

  return (
    <div className="wizard-page container">
      {/* Progress bar */}
      <div className="wizard-progress">
        <div className="wizard-progress-bar" style={{ width: `${progress}%` }} />
      </div>
      <div className="wizard-progress-text">
        שאלה {currentStep + 1} מתוך {totalSteps}
      </div>

      <div className="wizard-layout">
        {/* Main question area */}
        <div className="wizard-main">
          <div className="wizard-question-card card">
            <h2 className="wizard-question-label">{currentQuestion.labelHe}</h2>
            {currentQuestion.helpTextHe && (
              <p className="wizard-help-text">{currentQuestion.helpTextHe}</p>
            )}

            <div className="wizard-answer-area">
              {/* Boolean */}
              {currentQuestion.answerType === 'boolean' && (
                <div className="option-buttons">
                  <button
                    className={`option-btn ${currentAnswer === true ? 'selected' : ''}`}
                    onClick={() => handleAnswer(true)}
                  >
                    כן
                  </button>
                  <button
                    className={`option-btn ${currentAnswer === false ? 'selected' : ''}`}
                    onClick={() => handleAnswer(false)}
                  >
                    לא
                  </button>
                </div>
              )}

              {/* Select */}
              {currentQuestion.answerType === 'select' && currentQuestion.options && (
                <div className="option-buttons option-buttons-wrap">
                  {currentQuestion.options.map((opt) => (
                    <button
                      key={opt.id}
                      className={`option-btn ${currentAnswer === opt.optionValue ? 'selected' : ''}`}
                      onClick={() => handleAnswer(opt.optionValue)}
                    >
                      {opt.optionLabelHe}
                    </button>
                  ))}
                </div>
              )}

              {/* Date */}
              {currentQuestion.answerType === 'date' && (
                <input
                  type="date"
                  className="form-input"
                  value={currentAnswer || ''}
                  onChange={(e) => handleAnswer(e.target.value)}
                  style={{ maxWidth: 300 }}
                />
              )}

              {/* Text */}
              {currentQuestion.answerType === 'text' && (
                <input
                  type="text"
                  className="form-input"
                  value={currentAnswer || ''}
                  onChange={(e) => handleAnswer(e.target.value)}
                  placeholder="הקלידו כאן..."
                />
              )}

              {/* Number */}
              {currentQuestion.answerType === 'number' && (
                <input
                  type="number"
                  className="form-input"
                  value={currentAnswer || ''}
                  onChange={(e) => handleAnswer(Number(e.target.value))}
                  style={{ maxWidth: 200 }}
                />
              )}
            </div>
          </div>

          {/* Navigation */}
          <div className="wizard-nav">
            <button
              className="btn btn-ghost"
              onClick={handlePrev}
              disabled={currentStep === 0}
            >
              <ChevronRight size={18} />
              הקודם
            </button>

            {isLastStep ? (
              <button
                className="btn btn-primary btn-lg"
                onClick={handleSubmit}
                disabled={evaluating}
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
            ) : (
              <button
                className="btn btn-primary"
                onClick={handleNext}
                disabled={currentAnswer === undefined || currentAnswer === null || currentAnswer === ''}
              >
                הבא
                <ChevronLeft size={18} />
              </button>
            )}
          </div>
        </div>

        {/* Summary sidebar */}
        <div className="wizard-sidebar">
          <div className="card wizard-summary">
            <h4 className="wizard-summary-title">סיכום עד כה</h4>
            {Object.entries(answers).length === 0 ? (
              <p className="wizard-summary-empty">טרם נענו שאלות</p>
            ) : (
              <ul className="wizard-summary-list">
                {Object.entries(answers).map(([key, val]) => {
                  const q = questions.find((q) => q.questionKey === key);
                  let displayVal;
                  if (val === true) displayVal = 'כן';
                  else if (val === false) displayVal = 'לא';
                  else {
                    const opt = q?.options?.find((o) => o.optionValue === val);
                    displayVal = opt ? opt.optionLabelHe : String(val);
                  }
                  return (
                    <li key={key} className="wizard-summary-item">
                      <span className="wizard-summary-q">{q?.labelHe || key}</span>
                      <span className="wizard-summary-a">{displayVal}</span>
                    </li>
                  );
                })}
              </ul>
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
