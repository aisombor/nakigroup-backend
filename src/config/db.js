const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  database: process.env.DB_NAME || 'nakigroup_db',
  user: process.env.DB_USER || 'nakigroup_user',
  password: process.env.DB_PASSWORD || '',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Test connection on startup
(async () => {
  try {
    const conn = await pool.getConnection();
    console.log('✅ Connected to MySQL database');
    conn.release();
  } catch (err) {
    console.error('❌ Failed to connect to MySQL:', err.message);
  }
})();

module.exports = {
  query: async (text, params) => {
    if (params && params.length > 0) {
      const [rows] = await pool.execute(text, params);
      return { rows };
    }
    const [rows] = await pool.query(text);
    return { rows };
  },
  pool,
};
