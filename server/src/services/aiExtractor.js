/**
 * AI Parameter Extraction Service (Mock)
 * In production, this would call an LLM API.
 * For MVP, it uses keyword matching to extract structured parameters
 * aligned with the updated Orlah question flow.
 */

const SEEDLING_KEYWORDS = {
  'שתיל צעיר': 'young_seedling',
  'שתיל': 'young_seedling',
  'אילן צעיר': 'young_tree',
  'אילן בוגר': 'mature_tree',
  'ייחור': 'cutting',
  'הרכבה': 'graft',
};

const REASON_KEYWORDS = {
  'פרי': 'fruit',
  'לפרי': 'fruit',
  'לאכילה': 'fruit',
  'גידור': 'fencing',
  'לגידור': 'fencing',
  'קורות': 'timber',
  'לקורות': 'timber',
  'נוי': 'ornamental',
  'לנוי': 'ornamental',
};

const LOCATION_KEYWORDS = {
  'ארץ ישראל': 'israel',
  'ישראל': 'israel',
  'חו״ל': 'abroad',
  'חול': 'abroad',
  'חו"ל': 'abroad',
};

const GROUND_POT_KEYWORDS = {
  'אדמה': 'ground',
  'קרקע': 'ground',
  'עציץ': 'pot',
};

function extractParameters(rawText) {
  const originalText = rawText;
  const extracted = {};
  const confidence = {};

  // Extract seedling type
  for (const [keyword, value] of Object.entries(SEEDLING_KEYWORDS)) {
    if (originalText.includes(keyword)) {
      extracted.seedling_type = value;
      confidence.seedling_type = 0.9;
      break;
    }
  }

  // Extract planting reason
  for (const [keyword, value] of Object.entries(REASON_KEYWORDS)) {
    if (originalText.includes(keyword)) {
      extracted.planting_reason = value;
      confidence.planting_reason = 0.85;
      break;
    }
  }

  // Extract planting location (Israel / abroad)
  for (const [keyword, value] of Object.entries(LOCATION_KEYWORDS)) {
    if (originalText.includes(keyword)) {
      extracted.planting_location = value;
      confidence.planting_location = 0.95;
      break;
    }
  }

  // Extract ground vs pot
  for (const [keyword, value] of Object.entries(GROUND_POT_KEYWORDS)) {
    if (originalText.includes(keyword)) {
      extracted.current_ground_or_pot = value;
      confidence.current_ground_or_pot = 0.85;
      break;
    }
  }

  // Detect transfer
  if (originalText.includes('הועבר') || originalText.includes('העברה') || originalText.includes('העתקה')) {
    extracted.is_transfer = 'transfer';
    confidence.is_transfer = 0.88;
  } else if (originalText.includes('שתילה חדשה') || originalText.includes('שתלתי')) {
    extracted.is_transfer = 'new_planting';
    confidence.is_transfer = 0.85;
  }

  // Detect soil block
  if (originalText.includes('גוש אדמה')) {
    if (originalText.includes('לא בטוח') || originalText.includes('לא יודע')) {
      extracted.transfer_soil_block_intact = 'unknown';
      confidence.transfer_soil_block_intact = 0.7;
    } else if (originalText.includes('כן') || originalText.includes('שלם') || originalText.includes('היה גוש')) {
      extracted.transfer_soil_block_intact = 'yes';
      confidence.transfer_soil_block_intact = 0.8;
    } else if (originalText.includes('לא') || originalText.includes('ללא')) {
      extracted.transfer_soil_block_intact = 'no';
      confidence.transfer_soil_block_intact = 0.8;
    }
  }

  // Detect perforated pot
  if (originalText.includes('עציץ נקוב')) {
    extracted.current_pot_type = 'perforated';
    confidence.current_pot_type = 0.9;
  } else if (originalText.includes('עציץ') && (originalText.includes('לא נקוב') || originalText.includes('אינו נקוב'))) {
    extracted.current_pot_type = 'non_perforated';
    confidence.current_pot_type = 0.9;
  }

  // Detect date type
  if (originalText.includes('בערך') || originalText.includes('משוער') || originalText.includes('לא מדויק') || originalText.includes('בקירוב')) {
    extracted.date_type = 'estimated';
    confidence.date_type = 0.85;
  } else if (originalText.includes('מדויק') || originalText.includes('בדיוק')) {
    extracted.date_type = 'exact';
    confidence.date_type = 0.9;
  }

  // Try to extract a date (pattern: dd/mm/yyyy or yyyy-mm-dd)
  const datePatternSlash = /(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{4})/;
  const datePatternIso = /(\d{4})-(\d{2})-(\d{2})/;
  let match = originalText.match(datePatternIso);
  if (match) {
    extracted.planting_date = match[0];
    confidence.planting_date = 0.95;
  } else {
    match = originalText.match(datePatternSlash);
    if (match) {
      const [, day, month, year] = match;
      extracted.planting_date = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
      confidence.planting_date = 0.9;
    }
  }

  return {
    extractedFieldsJson: extracted,
    confidenceJson: confidence,
  };
}

module.exports = { extractParameters };
