/**
 * Rules Engine Service
 * Evaluates answers against configured rules and returns structured results,
 * including Orlah date calculations with Hebrew calendar awareness.
 */

const rules = require('../data/rules.json');
const ruleSets = require('../data/ruleSets.json');
const resultTemplates = require('../data/resultTemplates.json');
const questions = require('../data/questions.json');
const questionOptions = require('../data/questionOptions.json');

// Build lookup maps once at load time
const questionMap = {};
questions.forEach(q => { questionMap[q.questionKey] = q; });

const optionLabelMap = {};
questionOptions.forEach(opt => {
  if (!optionLabelMap[opt.questionId]) optionLabelMap[opt.questionId] = {};
  optionLabelMap[opt.questionId][opt.optionValue] = opt.optionLabelHe;
});

/**
 * Resolve an answer value to its Hebrew display label
 */
function resolveAnswerLabel(questionKey, answerValue) {
  if (answerValue === true) return 'כן';
  if (answerValue === false) return 'לא';
  if (answerValue === null || answerValue === undefined) return '—';

  const question = questionMap[questionKey];
  if (question && optionLabelMap[question.id]) {
    const label = optionLabelMap[question.id][answerValue];
    if (label) return label;
  }
  return String(answerValue);
}

/**
 * Mock Hebrew date conversion using Intl API.
 * In production, use a proper Hebrew calendar library (e.g. hebcal).
 */
function toHebrewDateString(gregorianDate) {
  const d = new Date(gregorianDate);
  if (isNaN(d.getTime())) return 'תאריך לא תקין';

  try {
    const formatter = new Intl.DateTimeFormat('he-IL-u-ca-hebrew', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    return formatter.format(d);
  } catch {
    const months = [
      'תשרי', 'חשוון', 'כסלו', 'טבת', 'שבט', 'אדר',
      'ניסן', 'אייר', 'סיוון', 'תמוז', 'אב', 'אלול'
    ];
    const monthIdx = d.getMonth();
    return `${d.getDate()} ${months[monthIdx]} (משוער)`;
  }
}

/**
 * Approximate Rosh Hashana (1 Tishrei) for a given Gregorian year.
 * This is a rough approximation. In production, use a Hebrew calendar library.
 * Rosh Hashana typically falls between Sep 5 - Oct 5.
 */
function approximateRoshHashana(gregorianYear) {
  // Simple approximation: Sep 15-25 range depending on year
  // A more accurate method would use the Metonic cycle
  const baseYear = 2026;
  const baseDate = new Date(2026, 8, 23); // Sep 23, 2026 is ~1 Tishrei 5787
  const yearDiff = gregorianYear - baseYear;

  // Approximate: Rosh Hashana moves ~11 days earlier each year, +30 every 3 years (leap)
  let dayShift = yearDiff * 11;
  const leapAdjust = Math.floor(Math.abs(yearDiff) * 7 / 19) * 30;
  dayShift -= yearDiff > 0 ? leapAdjust : -leapAdjust;

  const rh = new Date(baseDate);
  rh.setDate(rh.getDate() + dayShift);

  // Clamp to reasonable range (Sep-Oct)
  if (rh.getMonth() < 7) { rh.setMonth(8, 15); }
  if (rh.getMonth() > 10) { rh.setMonth(8, 25); }

  return rh;
}

/**
 * Approximate Tu B'Shvat (15 Shvat) for a Hebrew year starting at the given Rosh Hashana.
 * Tu B'Shvat is typically ~4.5 months after Rosh Hashana (late Jan - mid Feb).
 */
function approximateTuBShvat(roshHashanaDate) {
  const tu = new Date(roshHashanaDate);
  tu.setMonth(tu.getMonth() + 4);
  tu.setDate(tu.getDate() + 15);
  // Tu B'Shvat typically falls Jan 15 - Feb 15
  if (tu.getMonth() > 1) { tu.setMonth(1, 1); }
  return tu;
}

/**
 * Calculate the Orlah end date using Hebrew calendar rules (MVP approximation).
 *
 * Algorithm:
 * 1. A tree must take root 44 days before Rosh Hashana for that partial year to count as year 1.
 * 2. Count 3 full Hebrew years (Tishrei to Tishrei).
 * 3. The permitted date is Tu B'Shvat (15 Shvat) after the 3rd Tishrei.
 *
 * @param {string} plantingDateStr - Gregorian date string
 * @param {boolean} isRestart - If true, count from transfer date instead
 * @param {string} transferDateStr - Transfer date if restart
 * @returns {Object|null} { gregorian: Date, tuBShvat: Date }
 */
function calculateOrlahEndDate(plantingDateStr, isRestart, transferDateStr) {
  const startStr = isRestart && transferDateStr ? transferDateStr : plantingDateStr;
  if (!startStr) return null;

  const startDate = new Date(startStr);
  if (isNaN(startDate.getTime())) return null;

  // Find the next Rosh Hashana after planting
  let rhYear = startDate.getFullYear();
  let nextRH = approximateRoshHashana(rhYear);

  // If planting is after this year's RH, look at next year's
  if (startDate > nextRH) {
    rhYear++;
    nextRH = approximateRoshHashana(rhYear);
  }

  // Check 44-day rule: planting must be >= 44 days before next RH
  const daysBefore = Math.floor((nextRH - startDate) / (1000 * 60 * 60 * 24));
  let firstTishrei;

  if (daysBefore >= 44) {
    // Partial year counts — this Tishrei ends year 1
    firstTishrei = nextRH;
  } else {
    // Too close to RH — year 1 starts at the NEXT Tishrei
    firstTishrei = approximateRoshHashana(rhYear + 1);
  }

  // After 3 Tishrei years: end of year 3 is at 3rd Tishrei from firstTishrei
  const thirdTishrei = approximateRoshHashana(firstTishrei.getFullYear() + 2);

  // Permitted date = Tu B'Shvat after the 3rd Tishrei
  const permittedDate = approximateTuBShvat(thirdTishrei);

  return {
    gregorian: permittedDate,
    thirdTishrei: thirdTishrei,
  };
}

/**
 * Evaluate a single condition against the provided answers
 */
function evaluateCondition(condition, answers) {
  const { field, op, value } = condition;
  const answerValue = answers[field];

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
    if (conditionsJson.all.length === 0) return true;
    return conditionsJson.all.every(cond => evaluateCondition(cond, answers));
  }
  if (conditionsJson.any) {
    return conditionsJson.any.some(cond => evaluateCondition(cond, answers));
  }
  return false;
}

/**
 * Build the explanation path based on key answers, with resolved labels
 */
function buildExplanationPath(matchedRule, answers, template) {
  const path = [];

  // Key fields to show in the decision path — in logical order
  const keyFields = [
    'planting_reason', 'planting_location', 'is_transfer',
    'planting_date', 'date_type', 'seedling_type',
    'transfer_soil_block_intact', 'transfer_delay',
    'current_ground_or_pot', 'current_pot_type',
    'transfer_current_ground_or_pot',
  ];

  for (const field of keyFields) {
    const answerValue = answers[field];
    if (answerValue === undefined || answerValue === null || answerValue === '') continue;

    const question = questionMap[field];
    if (!question) continue;

    path.push({ type: 'question', labelHe: question.labelHe });
    path.push({ type: 'answer', labelHe: resolveAnswerLabel(field, answerValue) });
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
    answers.planting_reason === 'unclear_mixed',
  ];
  if (uncertainIndicators.some(Boolean)) return true;
  if (matchedRule && ['NEEDS_REVIEW', 'DOUBT'].includes(matchedRule.actionsJson.statusCode)) return true;
  return false;
}

/**
 * Evaluate partial answers to check for early termination.
 * Called mid-wizard after each step.
 *
 * @param {string} moduleCode
 * @param {Object} answers - partial answers so far
 * @returns {{ shouldTerminate: boolean, result?: Object }}
 */
function evaluatePartial(moduleCode, answers) {
  const ruleSet = ruleSets.find(
    rs => rs.status === 'published' && rs.moduleId === 1
  );

  if (!ruleSet) {
    return { shouldTerminate: false };
  }

  // Only check rules marked as early termination
  const earlyRules = rules
    .filter(r => r.ruleSetId === ruleSet.id && r.isActive && r.actionsJson.isEarlyTermination)
    .sort((a, b) => a.priority - b.priority);

  for (const rule of earlyRules) {
    if (evaluateConditionGroup(rule.conditionsJson, answers)) {
      const template = resultTemplates.find(
        t => t.templateCode === rule.actionsJson.resultTemplateCode
      );

      const explanationPath = buildExplanationPath(rule, answers, template);

      return {
        shouldTerminate: true,
        result: {
          statusCode: rule.actionsJson.statusCode,
          resultTemplateCode: rule.actionsJson.resultTemplateCode,
          ruleSetVersion: ruleSet.version,
          headlineHe: template ? template.headlineHe : 'תוצאה',
          explanationHe: template ? template.explanationTemplateHe : '',
          recommendationHe: template ? template.recommendationTemplateHe : '',
          confidenceLevel: template ? template.confidenceLevel : 'low',
          disclaimerHe: template
            ? template.disclaimerHe
            : 'המידע באתר נועד לסיוע כללי בלבד ואינו מהווה פסק הלכה. מומלץ להתייעץ עם רב מוסמך.',
          permittedDateGregorian: null,
          permittedDateHebrew: null,
          isSafek: true,
          isEstimatedDate: false,
          plantingDateProvided: null,
          nextRelevantDate: null,
          explanationPathJson: explanationPath,
          matchedRuleId: rule.id,
          needsRabbiReview: rule.actionsJson.needsRabbiReview || false,
        },
      };
    }
  }

  return { shouldTerminate: false };
}

/**
 * Main evaluation function — full evaluation after all questions answered
 * @param {string} moduleCode
 * @param {Object} answers
 * @returns {Object} evaluation result
 */
function evaluate(moduleCode, answers) {
  const ruleSet = ruleSets.find(
    rs => rs.status === 'published' && rs.moduleId === 1
  );

  if (!ruleSet) {
    return {
      statusCode: 'ERROR',
      error: 'No published rule set found',
    };
  }

  const activeRules = rules
    .filter(r => r.ruleSetId === ruleSet.id && r.isActive)
    .sort((a, b) => a.priority - b.priority);

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

  const template = resultTemplates.find(
    t => t.templateCode === matchedRule.actionsJson.resultTemplateCode
  );

  const explanationPath = buildExplanationPath(matchedRule, answers, template);

  // Calculate Orlah dates
  const isRestart = matchedRule.actionsJson.statusCode === 'ORLAH_RESTART';
  const isContinues = matchedRule.actionsJson.statusCode === 'ORLAH_CONTINUES';
  const plantingDate = answers.planting_date;
  const prevPlantingDate = answers.prev_planting_date;
  const transferNewDate = answers.transfer_new_planting_date;

  let effectiveDate = plantingDate;
  if (isRestart && transferNewDate) {
    effectiveDate = transferNewDate;
  } else if (isContinues && prevPlantingDate) {
    effectiveDate = prevPlantingDate;
  }

  const orlahResult = calculateOrlahEndDate(effectiveDate, false, null);

  let permittedDateGregorian = null;
  let permittedDateHebrew = null;
  if (orlahResult) {
    permittedDateGregorian = orlahResult.gregorian.toISOString().split('T')[0];
    permittedDateHebrew = toHebrewDateString(orlahResult.gregorian);
  }

  const isEstimated = answers.date_type === 'estimated';
  const isSafek = hasSafek(answers, matchedRule);

  // Determine if the fruit is currently permitted
  let fruitPermitted = null;
  if (permittedDateGregorian) {
    const today = new Date();
    const permDate = new Date(permittedDateGregorian);
    fruitPermitted = today >= permDate ? 'yes' : 'no';
    if (isSafek) fruitPermitted = 'doubt';
  }
  if (['EXEMPT', 'POSSIBLY_EXEMPT'].includes(matchedRule.actionsJson.statusCode)) {
    fruitPermitted = 'yes';
  }
  if (['DOUBT', 'NEEDS_REVIEW'].includes(matchedRule.actionsJson.statusCode)) {
    fruitPermitted = 'doubt';
  }

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
    permittedDateGregorian,
    permittedDateHebrew,
    isSafek,
    isEstimatedDate: isEstimated,
    fruitPermitted,
    plantingDateProvided: effectiveDate || null,
    nextRelevantDate: permittedDateGregorian,
    explanationPathJson: explanationPath,
    matchedRuleId: matchedRule.id,
    needsRabbiReview: matchedRule.actionsJson.needsRabbiReview || false,
  };
}

module.exports = { evaluate, evaluatePartial, evaluateCondition, evaluateConditionGroup };
