/**
 * Rules Engine Service
 * Evaluates answers against configured rules and returns structured results,
 * including Orlah date calculations.
 */

const rules = require('../data/rules.json');
const ruleSets = require('../data/ruleSets.json');
const resultTemplates = require('../data/resultTemplates.json');
const questions = require('../data/questions.json');

/**
 * Mock Hebrew date conversion.
 * In production, use a proper Hebrew calendar library (e.g. hebcal).
 * Returns an approximate Hebrew date string for display.
 */
function toHebrewDateString(gregorianDate) {
  const d = new Date(gregorianDate);
  if (isNaN(d.getTime())) return 'תאריך לא תקין';

  // Use Intl to get a rough Hebrew calendar representation
  try {
    const formatter = new Intl.DateTimeFormat('he-IL-u-ca-hebrew', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    return formatter.format(d);
  } catch {
    // Fallback: return a placeholder
    const months = [
      'תשרי', 'חשוון', 'כסלו', 'טבת', 'שבט', 'אדר',
      'ניסן', 'אייר', 'סיוון', 'תמוז', 'אב', 'אלול'
    ];
    const monthIdx = d.getMonth();
    return `${d.getDate()} ${months[monthIdx]} (משוער)`;
  }
}

/**
 * Calculate the Orlah end date (3 years from planting).
 * In halacha, the count follows the Hebrew year system with Tu B'Shvat as the cutoff.
 * This is a simplified MVP approximation.
 */
function calculateOrlahEndDate(plantingDateStr, isTransferRestart, transferDateStr) {
  // Use the effective start date
  const startStr = isTransferRestart && transferDateStr ? transferDateStr : plantingDateStr;
  if (!startStr) return null;

  const startDate = new Date(startStr);
  if (isNaN(startDate.getTime())) return null;

  // Simplified: add 3 years to the planting date
  // In real halacha, the year starts at 1 Tishrei and Tu B'Shvat (15 Shvat) marks the new year for trees
  const endDate = new Date(startDate);
  endDate.setFullYear(endDate.getFullYear() + 3);

  // Approximate Tu B'Shvat adjustment: if planting was after ~Aug 15 (before Rosh Hashana),
  // the first partial year counts, so permitted date is slightly earlier than exact +3 years.
  // For MVP, we keep the simple +3 year calculation.

  return endDate;
}

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
    // Empty "all" array means always true (fallback rule)
    if (conditionsJson.all.length === 0) return true;
    return conditionsJson.all.every(cond => evaluateCondition(cond, answers));
  }
  if (conditionsJson.any) {
    return conditionsJson.any.some(cond => evaluateCondition(cond, answers));
  }
  return false;
}

/**
 * Build the explanation path based on key answers
 */
function buildExplanationPath(matchedRule, answers, template) {
  const path = [];
  const questionMap = {};
  questions.forEach(q => { questionMap[q.questionKey] = q; });

  // Key fields to show in the decision path
  const keyFields = [
    'planting_date', 'date_type', 'seedling_type', 'planting_reason',
    'planting_location', 'is_transfer',
    'transfer_soil_block_intact', 'transfer_delay',
    'current_ground_or_pot', 'current_pot_type',
  ];

  for (const field of keyFields) {
    const answerValue = answers[field];
    if (answerValue === undefined || answerValue === null || answerValue === '') continue;

    const question = questionMap[field];
    if (!question) continue;

    path.push({ type: 'question', labelHe: question.labelHe });

    let answerLabel;
    if (answerValue === true) answerLabel = 'כן';
    else if (answerValue === false) answerLabel = 'לא';
    else answerLabel = String(answerValue);

    // Try to resolve option label
    if (question.answerType === 'select') {
      // We don't have options loaded in memory here, so we use the raw value
      // The client will resolve display labels
    }

    path.push({ type: 'answer', labelHe: answerLabel });
  }

  // Add the result node
  if (template) {
    path.push({ type: 'result', labelHe: template.headlineHe });
  }

  return path;
}

/**
 * Determine if there is halachic doubt (safek)
 */
function hasSafek(answers, matchedRule) {
  const uncertainIndicators = [
    answers.date_type === 'estimated',
    answers.transfer_soil_block_intact === 'unknown',
    answers.seedling_type === 'unknown',
    answers.is_transfer === 'unknown',
    answers.prev_ground_or_pot === 'unknown',
    answers.current_pot_type === 'unknown',
  ];
  if (uncertainIndicators.some(Boolean)) return true;
  if (matchedRule && matchedRule.actionsJson.statusCode === 'NEEDS_REVIEW') return true;
  return false;
}

/**
 * Main evaluation function
 * @param {string} moduleCode - e.g. "orlah"
 * @param {Object} answers - key-value map of question answers
 * @returns {Object} evaluation result with Orlah-specific date fields
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
      disclaimerHe: 'המידע באתר נועד לסיוע כללי בלבד ואינו מהווה פסק הלכה. מומלץ להתייעץ עם רב מוסמך.',
    };
  }

  // Find the result template
  const template = resultTemplates.find(
    t => t.templateCode === matchedRule.actionsJson.resultTemplateCode
  );

  // Build explanation path
  const explanationPath = buildExplanationPath(matchedRule, answers, template);

  // Calculate Orlah dates
  const isTransferRestart = matchedRule.actionsJson.statusCode === 'ORLAH_RESTART';
  const plantingDate = answers.planting_date;
  const orlahEndDate = calculateOrlahEndDate(
    plantingDate,
    isTransferRestart,
    plantingDate // For restart, the new planting date is the effective date
  );

  // Format dates
  let permittedDateGregorian = null;
  let permittedDateHebrew = null;
  if (orlahEndDate) {
    permittedDateGregorian = orlahEndDate.toISOString().split('T')[0];
    permittedDateHebrew = toHebrewDateString(orlahEndDate);
  }

  // Determine doubt and estimation flags
  const isEstimated = answers.date_type === 'estimated';
  const isSafek = hasSafek(answers, matchedRule);

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
      : 'המידע באתר נועד לסיוע כללי בלבד ואינו מהווה פסק הלכה. מומלץ להתייעץ עם רב מוסמך.',
    // New Orlah-specific result fields
    permittedDateGregorian,
    permittedDateHebrew,
    isSafek,
    isEstimatedDate: isEstimated,
    plantingDateProvided: plantingDate || null,
    // Existing fields
    nextRelevantDate: permittedDateGregorian,
    explanationPathJson: explanationPath,
    matchedRuleId: matchedRule.id,
    needsRabbiReview: matchedRule.actionsJson.needsRabbiReview || false,
  };
}

module.exports = { evaluate, evaluateCondition, evaluateConditionGroup };
