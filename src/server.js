require('dotenv').config();
const app = require('./app');

const PORT = process.env.PORT || 5000;

// In local environment or non-passenger, listen on PORT
if (typeof(PhusionPassenger) === 'undefined') {
  app.listen(PORT, () => {
    console.log('====================================================');
    console.log(`🚀 Naki Group Backend Server is running on port ${PORT}`);
    console.log(`📡 URL: http://localhost:${PORT}`);
    console.log(`🩺 Health Check: http://localhost:${PORT}/api/health`);
    console.log(`💼 Jobs API:     http://localhost:${PORT}/api/jobs`);
    console.log(`📝 Apply API:    http://localhost:${PORT}/api/applications`);
    console.log(`🔐 Auth API:     http://localhost:${PORT}/api/auth/login`);
    console.log('====================================================');
  });
} else {
  // Passenger handles listening
  app.listen('passenger');
}

module.exports = app;
