const express = require('express');
const router = express.Router();
const { extractParameters } = require('../services/aiExtractor');

// POST /api/ai/extract-parameters - Extract structured parameters from free text
router.post('/extract-parameters', (req, res) => {
  const { text } = req.body;

  if (!text) {
    return res.status(400).json({ error: 'text is required' });
  }

  try {
    const result = extractParameters(text);
    res.json({
      rawUserText: text,
      ...result,
      createdAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('AI extraction error:', error);
    res.status(500).json({ error: 'Extraction failed' });
  }
});

module.exports = router;
