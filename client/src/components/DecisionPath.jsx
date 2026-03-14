import { HelpCircle, CheckCircle2, XCircle, AlertTriangle, ArrowDown } from 'lucide-react';
import './DecisionPath.css';

function getNodeIcon(type) {
  switch (type) {
    case 'question':
      return <HelpCircle size={20} />;
    case 'answer':
      return <CheckCircle2 size={20} />;
    case 'result':
      return <AlertTriangle size={20} />;
    default:
      return null;
  }
}

function getNodeClass(type) {
  switch (type) {
    case 'question':
      return 'dp-node-question';
    case 'answer':
      return 'dp-node-answer';
    case 'result':
      return 'dp-node-result';
    default:
      return '';
  }
}

export default function DecisionPath({ path }) {
  if (!path || path.length === 0) {
    return (
      <div className="dp-empty">
        <p>אין נתוני מסלול החלטה להציג.</p>
      </div>
    );
  }

  return (
    <div className="decision-path">
      <h3 className="dp-title">מסלול ההחלטה</h3>
      <div className="dp-flow">
        {path.map((node, index) => (
          <div key={index} className="dp-step">
            {index > 0 && (
              <div className="dp-connector">
                <ArrowDown size={16} />
              </div>
            )}
            <div className={`dp-node ${getNodeClass(node.type)}`}>
              <div className="dp-node-icon">{getNodeIcon(node.type)}</div>
              <div className="dp-node-content">
                <span className="dp-node-type">
                  {node.type === 'question' ? 'שאלה' : node.type === 'answer' ? 'תשובה' : 'תוצאה'}
                </span>
                <span className="dp-node-label">{node.labelHe}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
