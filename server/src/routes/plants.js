const express = require('express');
const router = express.Router();

// In-memory stores (loaded from JSON initially, mutated in memory)
let plants = require('../data/plants.json');
let plantAnswers = require('../data/plantAnswers.json');
let plantResults = require('../data/plantResults.json');

// GET /api/plants - Get all plants (optionally filter by userId)
router.get('/', (req, res) => {
  const { userId } = req.query;
  let result = plants;
  if (userId) {
    result = plants.filter(p => p.userId === parseInt(userId));
  }

  // Attach latest result to each plant
  const enriched = result.map(plant => {
    const latestResult = plantResults
      .filter(r => r.plantId === plant.id)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0];
    return { ...plant, latestResult: latestResult || null };
  });

  res.json(enriched);
});

// GET /api/plants/:id - Get plant by ID
router.get('/:id', (req, res) => {
  const plant = plants.find(p => p.id === parseInt(req.params.id));
  if (!plant) return res.status(404).json({ error: 'Plant not found' });

  const answers = plantAnswers.filter(a => a.plantId === plant.id);
  const results = plantResults
    .filter(r => r.plantId === plant.id)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  res.json({
    ...plant,
    answers,
    results,
    latestResult: results[0] || null,
  });
});

// POST /api/plants - Create a new plant
router.post('/', (req, res) => {
  const { nickname, plantType, locationText, moduleId, userId, ownerIdNumber, description, answers } = req.body;
  
  const newId = plants.length > 0 ? Math.max(...plants.map(p => p.id)) + 1 : 1;
  const publicPlantId = `PLANT-${1000 + newId}`;
  const now = new Date().toISOString();

  // Validate required field
  if (!ownerIdNumber || !ownerIdNumber.trim()) {
    return res.status(400).json({ error: 'ownerIdNumber is required (מספור / ת.ז.)' });
  }

  const newPlant = {
    id: newId,
    publicPlantId,
    userId: userId || null,
    moduleId: moduleId || 1,
    nickname: nickname || `צמח ${publicPlantId}`,
    plantType: plantType || 'unknown',
    locationText: locationText || '',
    ownerIdNumber: ownerIdNumber.trim(),
    description: description ? description.trim() : '',
    imageUrl: null,
    createdAt: now,
    updatedAt: now,
  };

  plants.push(newPlant);

  // Save answers if provided
  if (answers && typeof answers === 'object') {
    Object.entries(answers).forEach(([key, value]) => {
      const answerId = plantAnswers.length > 0
        ? Math.max(...plantAnswers.map(a => a.id)) + 1
        : 1;
      plantAnswers.push({
        id: answerId,
        plantId: newId,
        questionKey: key,
        answerValue: value,
        answerSource: 'manual',
        createdAt: now,
        updatedAt: now,
      });
    });
  }

  res.status(201).json(newPlant);
});

module.exports = router;
