/**
 * Rules Engine Service
 * Evaluates answers against configured rules and returns structured results.
 */

const rules = require('../data/rules.json');
const ruleSets = require('../data/ruleSets.json');
const resultTemplates = require('../data/resultTemplates.json');
const questions = require('../data/questions.json');

/**
 * Evaluate a single condition against the provided answers
 */
function evaluateCondition(condition, answers) {
  const { field, op, value } = condition;
  const answerValue = answers[field];

  // If the answer is not provided, the condition cannot be met
  if (answerValue === undefined || answerValue === null) {
    return false;
  }

  switch (op) {
    case '=':
      return answerValue === value;
    case '!=':
      return answerValue !== value;
    case '>':
      return answerValue > value;
    case '<':
      return answerValue < value;
    case '>=':
      return answerValue >= value;
    case '<=':
      return answerValue <= value;
    case 'in':
      return Array.isArray(value) && value.includes(answerValue);
    case 'not_in':
      return Array.isArray(value) && !value.includes(answerValue);
    default:
      return false;
  }
}

/**
 * Evaluate a condition group (supports "all" / "any")
 */
function evaluateConditionGroup(conditionsJson, answers) {
  if (conditionsJson.all) {
    return conditionsJson.all.every(cond => evaluateCondition(cond, answers));
  }
  if (conditionsJson.any) {
    return conditionsJson.any.some(cond => evaluateCondition(cond, answers));
  }
  return false;
}

/**
 * Build the explanation path based on the matched rule's conditions and answers
 */
function buildExplanationPath(matchedRule, answers, template) {
  const path = [];
  const questionMap = {};
  questions.forEach(q => { questionMap[q.questionKey] = q; });

  if (matchedRule && matchedRule.conditionsJson && matchedRule.conditionsJson.all) {
    for (const condition of matchedRule.conditionsJson.all) {
      const question = questionMap[condition.field];
      if (question) {
        path.push({ type: 'question', labelHe: question.labelHe });
        
        const rawAnswer = answers[condition.field];
        let answerLabel;
        if (rawAnswer === true) answerLabel = 'כן';
        else if (rawAnswer === false) answerLabel = 'לא';
        else if (rawAnswer === 'unknown') answerLabel = 'לא יודע/ת';
        else answerLabel = String(rawAnswer);
        
        path.push({ type: 'answer', labelHe: answerLabel });
      }
    }
  }

  // Add the result node
  if (template) {
    path.push({ type: 'result', labelHe: template.headlineHe });
  }

  return path;
}

/**
 * Main evaluation function
 * @param {string} moduleCode - e.g. "orlah"
 * @param {Object} answers - key-value map of question answers
 * @returns {Object} evaluation result
 */
function evaluate(moduleCode, answers) {
  // Find the published rule set for this module
  const ruleSet = ruleSets.find(
    rs => rs.status === 'published' && rs.moduleId === 1 // For MVP, module 1 = orlah
  );

  if (!ruleSet) {
    return {
      statusCode: 'ERROR',
      error: 'No published rule set found',
    };
  }

  // Get active rules for this rule set, sorted by priority
  const activeRules = rules
    .filter(r => r.ruleSetId === ruleSet.id && r.isActive)
    .sort((a, b) => a.priority - b.priority);

  // Evaluate rules in priority order
  let matchedRule = null;
  for (const rule of activeRules) {
    if (evaluateConditionGroup(rule.conditionsJson, answers)) {
      matchedRule = rule;
      break;
    }
  }

  if (!matchedRule) {
    return {
      statusCode: 'NO_MATCH',
      headlineHe: 'לא נמצא כלל מתאים',
      explanationHe: 'לא נמצא כלל מתאים לנתונים שהוזנו.',
      confidenceLevel: 'low',
      disclaimerHe: 'המידע באתר נועד לסיוע כללי בלבד ואינו מהווה פסק הלכה.',
    };
  }

  // Find the result template
  const template = resultTemplates.find(
    t => t.templateCode === matchedRule.actionsJson.resultTemplateCode
  );

  // Build explanation path
  const explanationPath = buildExplanationPath(matchedRule, answers, template);

  // Calculate a next relevant date (mock: 3 months from now)
  const nextDate = new Date();
  nextDate.setMonth(nextDate.getMonth() + 3);

  return {
    statusCode: matchedRule.actionsJson.statusCode,
    resultTemplateCode: matchedRule.actionsJson.resultTemplateCode,
    ruleSetVersion: ruleSet.version,
    headlineHe: template ? template.headlineHe : 'תוצאה',
    explanationHe: template ? template.explanationTemplateHe : '',
    recommendationHe: template ? template.recommendationTemplateHe : '',
    confidenceLevel: template ? template.confidenceLevel : 'low',
    disclaimerHe: template
      ? template.disclaimerHe
      : 'המידע באתר נועד לסיוע כללי בלבד ואינו מהווה פסק הלכה.',
    nextRelevantDate: nextDate.toISOString().split('T')[0],
    explanationPathJson: explanationPath,
    matchedRuleId: matchedRule.id,
    needsRabbiReview: matchedRule.actionsJson.needsRabbiReview || false,
  };
}

module.exports = { evaluate, evaluateCondition, evaluateConditionGroup };
