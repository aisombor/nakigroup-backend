const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
require('dotenv').config();
const mysql = require('mysql2/promise');

const dbHost = process.env.DB_HOST || 'localhost';
const dbPort = parseInt(process.env.DB_PORT || '3306', 10);
const dbName = process.env.DB_NAME || 'nakigroup_db';
const dbUser = process.env.DB_USER || 'nakigroup_user';
const dbPassword = process.env.DB_PASSWORD || 'O)_ngoNN+lAW-UWZ';

const pool = mysql.createPool({
  host: dbHost,
  port: dbPort,
  database: dbName,
  user: dbUser,
  password: dbPassword,
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
