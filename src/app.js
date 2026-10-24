const express = require('express');
const cors = require('cors');
const path = require('path');
const db = require('./config/db');

// Import routes
const authRoutes = require('./routes/authRoutes');
const jobRoutes = require('./routes/jobRoutes');
const applicationRoutes = require('./routes/applicationRoutes');

const app = express();

// Middlewares
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploads
app.use(['/api/uploads', '/uploads'], express.static(path.join(__dirname, 'uploads')));

// Root & Health Check Endpoints (handles both / and /api due to cPanel Passenger path rewriting)
const healthHandler = async (req, res) => {
  let dbStatus = 'disconnected';
  try {
    await db.query('SELECT 1');
    dbStatus = 'connected';
  } catch (err) {
    dbStatus = 'error: ' + err.message;
  }

  res.json({
    success: true,
    message: 'Naki Group API is running smoothly',
    timestamp: new Date().toISOString(),
    database: dbStatus,
  });
};

app.get('/', healthHandler);
app.get('/api', healthHandler);
app.get('/health', healthHandler);
app.get('/api/health', healthHandler);

// API Routes (supports both /api/* and /* paths)
app.use('/api/auth', authRoutes);
app.use('/auth', authRoutes);

app.use('/api/jobs', jobRoutes);
app.use('/jobs', jobRoutes);

app.use('/api/applications', applicationRoutes);
app.use('/applications', applicationRoutes);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `API Route not found: ${req.method} ${req.originalUrl}`,
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);

  if (err.message && err.message.includes('Only .pdf, .doc')) {
    return res.status(400).json({ success: false, message: err.message });
  }

  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({
      success: false,
      message: 'CV file size is too large! Maximum limit is 5MB.',
    });
  }

  res.status(500).json({
    success: false,
    message: err.message || 'An unexpected server error occurred',
  });
});

module.exports = app;
