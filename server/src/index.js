const express = require('express');
const cors = require('cors');

const modulesRouter = require('./routes/modules');
const plantsRouter = require('./routes/plants');
const decisionRouter = require('./routes/decision');
const aiRouter = require('./routes/ai');
const authRouter = require('./routes/auth');
const adminRouter = require('./routes/admin');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Request logging (simple)
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// Routes
app.use('/api/modules', modulesRouter);
app.use('/api/plants', plantsRouter);
app.use('/api/decision', decisionRouter);
app.use('/api/ai', aiRouter);
app.use('/api/auth', authRouter);
app.use('/api/admin', adminRouter);

// Public contact info (reads same data admin manages via shared store)
const contactStore = require('./services/contactStore');
app.get('/api/contact', (req, res) => {
  res.json(contactStore.get());
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`🌱 Halacha Agricultural Decision API running on port ${PORT}`);
});
