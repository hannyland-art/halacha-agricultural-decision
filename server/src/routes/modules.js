const express = require('express');
const router = express.Router();
const modules = require('../data/modules.json');
const questions = require('../data/questions.json');
const questionOptions = require('../data/questionOptions.json');
const visibilityRules = require('../data/visibilityRules.json');

// GET /api/modules - Get all active modules
router.get('/', (req, res) => {
  const activeModules = modules.filter(m => m.isActive);
  res.json(activeModules);
});

// GET /api/modules/all - Get all modules (including inactive)
router.get('/all', (req, res) => {
  res.json(modules);
});

// GET /api/modules/:code - Get a specific module by code
router.get('/:code', (req, res) => {
  const mod = modules.find(m => m.code === req.params.code);
  if (!mod) return res.status(404).json({ error: 'Module not found' });
  res.json(mod);
});

// GET /api/modules/:code/questions - Get questions for a module
router.get('/:code/questions', (req, res) => {
  const mod = modules.find(m => m.code === req.params.code);
  if (!mod) return res.status(404).json({ error: 'Module not found' });

  const moduleQuestions = questions
    .filter(q => q.moduleId === mod.id && q.isActive)
    .sort((a, b) => a.displayOrder - b.displayOrder)
    .map(q => {
      const options = questionOptions
        .filter(o => o.questionId === q.id && o.isActive)
        .sort((a, b) => a.optionOrder - b.optionOrder);

      const visibility = visibilityRules.filter(v => v.questionId === q.id);

      return {
        ...q,
        options,
        visibilityRules: visibility,
      };
    });

  res.json(moduleQuestions);
});

module.exports = router;
