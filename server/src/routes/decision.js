const express = require('express');
const router = express.Router();
const { evaluate, evaluatePartial } = require('../services/rulesEngine');

// POST /api/decision/evaluate - Full evaluation after all questions answered
router.post('/evaluate', (req, res) => {
  const { moduleCode, answers } = req.body;

  if (!moduleCode || !answers) {
    return res.status(400).json({ error: 'moduleCode and answers are required' });
  }

  try {
    const result = evaluate(moduleCode, answers);
    res.json(result);
  } catch (error) {
    console.error('Rule evaluation error:', error);
    res.status(500).json({ error: 'Evaluation failed' });
  }
});

// POST /api/decision/check-early - Check for early termination mid-wizard
router.post('/check-early', (req, res) => {
  const { moduleCode, answers } = req.body;

  if (!moduleCode || !answers) {
    return res.status(400).json({ error: 'moduleCode and answers are required' });
  }

  try {
    const result = evaluatePartial(moduleCode, answers);
    res.json(result);
  } catch (error) {
    console.error('Early evaluation error:', error);
    res.status(500).json({ error: 'Early evaluation failed' });
  }
});

module.exports = router;
