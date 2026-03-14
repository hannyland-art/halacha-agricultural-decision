const express = require('express');
const router = express.Router();
const { evaluate } = require('../services/rulesEngine');

// POST /api/decision/evaluate - Evaluate answers against rules
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

module.exports = router;
