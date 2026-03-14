/**
 * AI Parameter Extraction Service (Mock)
 * In production, this would call an LLM API.
 * For MVP, it uses keyword matching to extract structured parameters.
 */

const PLANT_KEYWORDS = {
  'לימון': 'lemon',
  'lemon': 'lemon',
  'זית': 'olive',
  'olive': 'olive',
  'תפוח': 'apple',
  'apple': 'apple',
  'רימון': 'pomegranate',
  'pomegranate': 'pomegranate',
  'גפן': 'grape',
  'ענבים': 'grape',
  'grape': 'grape',
};

const SOURCE_KEYWORDS = {
  'משתלה': 'nursery',
  'nursery': 'nursery',
  'זרע': 'seed',
  'seed': 'seed',
  'שתיל': 'nursery',
};

const LOCATION_KEYWORDS = {
  'גינה': 'garden',
  'אדמה': 'ground',
  'עציץ': 'pot',
  'מרפסת': 'balcony',
  'חממה': 'greenhouse',
};

function extractParameters(rawText) {
  const text = rawText.toLowerCase ? rawText.toLowerCase() : rawText;
  const originalText = rawText;
  const extracted = {};
  const confidence = {};

  // Extract plant type
  for (const [keyword, value] of Object.entries(PLANT_KEYWORDS)) {
    if (originalText.includes(keyword)) {
      extracted.plant_type = value;
      confidence.plant_type = 0.95;
      break;
    }
  }

  // Extract source type
  for (const [keyword, value] of Object.entries(SOURCE_KEYWORDS)) {
    if (originalText.includes(keyword)) {
      extracted.source_type = value;
      confidence.source_type = 0.9;
      break;
    }
  }

  // Extract growth location
  for (const [keyword, value] of Object.entries(LOCATION_KEYWORDS)) {
    if (originalText.includes(keyword)) {
      extracted.growth_location = value;
      confidence.growth_location = 0.85;
      break;
    }
  }

  // Extract transferred
  if (originalText.includes('הועבר') || originalText.includes('העברה') || originalText.includes('שתלתי')) {
    extracted.transferred = true;
    confidence.transferred = 0.88;
  }

  // Extract sustaining soil block
  if (originalText.includes('גוש אדמה')) {
    if (originalText.includes('לא בטוח') || originalText.includes('לא יודע')) {
      extracted.sustaining_soil_block = 'unknown';
      confidence.sustaining_soil_block = 0.7;
    } else if (originalText.includes('כן') || originalText.includes('היה גוש')) {
      extracted.sustaining_soil_block = 'yes';
      confidence.sustaining_soil_block = 0.8;
    }
  }

  // Detect fruit tree
  if (originalText.includes('עץ') || originalText.includes('פרי')) {
    extracted.fruit_tree = true;
    confidence.fruit_tree = 0.9;
  }

  return {
    extractedFieldsJson: extracted,
    confidenceJson: confidence,
  };
}

module.exports = { extractParameters };
