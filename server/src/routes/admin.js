const express = require('express');
const router = express.Router();

const modules = require('../data/modules.json');
const questions = require('../data/questions.json');
const questionOptions = require('../data/questionOptions.json');
const visibilityRules = require('../data/visibilityRules.json');
const rules = require('../data/rules.json');
const ruleSets = require('../data/ruleSets.json');
const resultTemplates = require('../data/resultTemplates.json');

// Contact settings – shared mutable store
const contactStore = require('../services/contactStore');

// GET /api/admin/modules
router.get('/modules', (req, res) => {
  res.json(modules);
});

// GET /api/admin/questions
router.get('/questions', (req, res) => {
  const enriched = questions.map(q => {
    const options = questionOptions.filter(o => o.questionId === q.id);
    const visibility = visibilityRules.filter(v => v.questionId === q.id);
    return { ...q, options, visibilityRules: visibility };
  });
  res.json(enriched);
});

// GET /api/admin/question-options
router.get('/question-options', (req, res) => {
  res.json(questionOptions);
});

// GET /api/admin/visibility-rules
router.get('/visibility-rules', (req, res) => {
  res.json(visibilityRules);
});

// GET /api/admin/rules
router.get('/rules', (req, res) => {
  const enriched = rules.map(r => {
    const ruleSet = ruleSets.find(rs => rs.id === r.ruleSetId);
    return { ...r, ruleSetVersion: ruleSet ? ruleSet.version : 'N/A' };
  });
  res.json(enriched);
});

// GET /api/admin/rule-sets
router.get('/rule-sets', (req, res) => {
  res.json(ruleSets);
});

// GET /api/admin/result-templates
router.get('/result-templates', (req, res) => {
  res.json(resultTemplates);
});

// GET /api/admin/contact-settings
router.get('/contact-settings', (req, res) => {
  res.json(contactStore.get());
});

// PUT /api/admin/contact-settings
router.put('/contact-settings', (req, res) => {
  const updated = contactStore.update(req.body);
  res.json(updated);
});

// GET /api/admin/stats - Dashboard stats
router.get('/stats', (req, res) => {
  res.json({
    totalModules: modules.length,
    activeModules: modules.filter(m => m.isActive).length,
    totalQuestions: questions.length,
    totalRules: rules.length,
    activeRules: rules.filter(r => r.isActive).length,
    totalTemplates: resultTemplates.length,
    totalRuleSets: ruleSets.length,
    publishedRuleSets: ruleSets.filter(rs => rs.status === 'published').length,
  });
});

module.exports = router;
